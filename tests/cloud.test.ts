import { describe, expect, it } from 'vitest';
import { classifyCloudError } from '../miniprogram/utils/cloud';

describe('cloud error classification', () => {
  it('marks timeout errors as degraded timeout failures', () => {
    expect(classifyCloudError(new Error('fetchIntelFeed timeout after 15000ms'))).toMatchObject({
      code: 'TIMEOUT',
      degraded: true,
    });
  });
});
