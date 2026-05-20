"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classifyCloudError = classifyCloudError;
exports.initCloud = initCloud;
exports.callCloudFunction = callCloudFunction;
exports.loginWithCloud = loginWithCloud;
exports.saveGameStateToCloud = saveGameStateToCloud;
exports.saveProfileToCloud = saveProfileToCloud;
exports.claimMigration = claimMigration;
exports.fetchIntelFeed = fetchIntelFeed;
exports.fetchIntelArticle = fetchIntelArticle;
const env_1 = require("../env");
function classifyCloudError(error) {
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
function toCloudError(error) {
    const info = classifyCloudError(error);
    const next = new Error(info.message);
    next.code = info.code;
    next.degraded = info.degraded;
    return next;
}
function initCloud() {
    if (!wx.cloud) {
        console.warn('CloudBase is unavailable in this runtime.');
        return;
    }
    wx.cloud.init({
        env: env_1.CLOUD_ENV_ID,
        traceUser: true,
    });
}
async function callCloudFunction(name, data = {}, timeoutMs = 10000) {
    var _a;
    if (!((_a = wx.cloud) === null || _a === void 0 ? void 0 : _a.callFunction)) {
        throw toCloudError(new Error('wx.cloud is unavailable in this runtime'));
    }
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`${name} timeout after ${timeoutMs}ms`)), timeoutMs);
    });
    try {
        const result = await Promise.race([
            wx.cloud.callFunction({ name, data }),
            timeoutPromise,
        ]);
        return result.result;
    }
    catch (error) {
        throw toCloudError(error);
    }
}
function loginWithCloud() {
    return callCloudFunction('login', {}, 8000);
}
function saveGameStateToCloud(gameState) {
    return callCloudFunction('saveGameState', { gameState }, 5000);
}
function saveProfileToCloud(profile) {
    return callCloudFunction('saveProfile', { profile }, 5000);
}
function claimMigration(email, claimCode) {
    return callCloudFunction('claimMigration', { email, claimCode }, 10000);
}
function fetchIntelFeed(force = false) {
    return callCloudFunction('fetchIntelFeed', { force }, 15000);
}
function fetchIntelArticle(link, description) {
    return callCloudFunction('fetchIntelArticle', { link, description }, 20000);
}
