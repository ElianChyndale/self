import { CLOUD_ENV_ID } from '../env';
import type { AppCapabilities, GameState, IntelSource, NewsArticle, UserProfile } from '../types';

type CloudErrorCode = 'TIMEOUT' | 'UNAVAILABLE' | 'UNKNOWN';

interface CloudErrorInfo {
  code: CloudErrorCode;
  message: string;
  degraded: boolean;
}

export type ClaimMigrationCode =
  | 'NOT_CONFIGURED'
  | 'INVALID_CODE'
  | 'ALREADY_USED'
  | 'EXPIRED'
  | 'UNAVAILABLE'
  | 'TIMEOUT'
  | 'UNKNOWN';

export interface LoginResult {
  openId: string;
  profile: UserProfile;
  gameState: GameState;
  capabilities: AppCapabilities;
}

export interface SaveProfileResult {
  ok: true;
  profile: UserProfile;
}

export type ClaimMigrationResult =
  | {
    ok: true;
    openId: string;
    profile: UserProfile;
    gameState: GameState;
    capabilities: AppCapabilities;
  }
  | {
    ok: false;
    code: ClaimMigrationCode;
    message: string;
    claimMigrationConfigured: boolean;
  };

export function classifyCloudError(error: unknown): CloudErrorInfo {
  const message = error instanceof Error ? error.message : String(error || 'Unknown cloud error');
  if (/timeout/i.test(message)) {
    return {
      code: 'TIMEOUT',
      message,
      degraded: true,
    };
  }

  if (/unavailable|cloudbase|wx\.cloud/i.test(message)) {
    return {
      code: 'UNAVAILABLE',
      message,
      degraded: true,
    };
  }

  return {
    code: 'UNKNOWN',
    message,
    degraded: false,
  };
}

function toCloudError(error: unknown): Error & CloudErrorInfo {
  const info = classifyCloudError(error);
  const next = new Error(info.message) as Error & CloudErrorInfo;
  next.code = info.code;
  next.degraded = info.degraded;
  return next;
}

export function initCloud(): void {
  if (!wx.cloud) {
    console.warn('CloudBase is unavailable in this runtime.');
    return;
  }

  wx.cloud.init({
    env: CLOUD_ENV_ID,
    traceUser: true,
  });
}

export async function callCloudFunction<T>(
  name: string,
  data: Record<string, unknown> = {},
  timeoutMs = 10000,
): Promise<T> {
  if (!wx.cloud?.callFunction) {
    throw toCloudError(new Error('wx.cloud is unavailable in this runtime'));
  }
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`${name} timeout after ${timeoutMs}ms`)), timeoutMs);
  });
  try {
    const result = await Promise.race([
      wx.cloud.callFunction({ name, data }),
      timeoutPromise,
    ]);
    return (result as { result: T }).result;
  } catch (error) {
    throw toCloudError(error);
  }
}

export function loginWithCloud(): Promise<LoginResult> {
  return callCloudFunction<LoginResult>('login', {}, 8000);
}

export function saveGameStateToCloud(gameState: GameState): Promise<{ ok: boolean }> {
  return callCloudFunction<{ ok: boolean }>('saveGameState', { gameState }, 5000);
}

export function saveProfileToCloud(profile: Partial<UserProfile>): Promise<SaveProfileResult> {
  return callCloudFunction<SaveProfileResult>('saveProfile', { profile }, 5000);
}

function extensionFromFilePath(filePath: string): string {
  const match = filePath.match(/\.(jpg|jpeg|png|webp|gif)$/i);
  return match ? `.${match[1].toLowerCase()}` : '.png';
}

export async function uploadAvatarToCloud(localFilePath: string, openId: string): Promise<string> {
  if (!wx.cloud?.uploadFile) {
    throw toCloudError(new Error('wx.cloud.uploadFile is unavailable in this runtime'));
  }

  const normalizedOpenId = (openId || 'anonymous').replace(/[^a-zA-Z0-9_-]/g, '_');
  const cloudPath = `avatars/${normalizedOpenId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}${extensionFromFilePath(localFilePath)}`;

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`uploadAvatar timeout after 15000ms`)), 15000);
  });

  try {
    const uploadResult = await Promise.race([
      wx.cloud.uploadFile({
        cloudPath,
        filePath: localFilePath,
      }),
      timeoutPromise,
    ]);
    return (uploadResult as { fileID: string }).fileID;
  } catch (error) {
    throw toCloudError(error);
  }
}

export function claimMigration(email: string, claimCode: string): Promise<ClaimMigrationResult> {
  return callCloudFunction<ClaimMigrationResult>('claimMigration', { email, claimCode }, 10000);
}

export function fetchIntelFeed(force = false): Promise<{
  articles: NewsArticle[];
  fetchedAt: number;
  source: IntelSource;
  degraded: boolean;
}> {
  return callCloudFunction<{
    articles: NewsArticle[];
    fetchedAt: number;
    source: IntelSource;
    degraded: boolean;
  }>('fetchIntelFeed', { force }, 15000);
}

export function fetchIntelArticle(link: string, description: string): Promise<{
  content: string;
  fetchedAt: number;
  source: IntelSource;
  degraded: boolean;
}> {
  return callCloudFunction<{
    content: string;
    fetchedAt: number;
    source: IntelSource;
    degraded: boolean;
  }>(
    'fetchIntelArticle',
    { link, description },
    20000,
  );
}
