import { describe, expect, it, vi } from 'vitest';
import {
  completeRest,
  completeWork,
  createDefaultGameState,
  sanitizeHydratedGameState,
  startLongRest,
} from '../miniprogram/utils/gameState';

describe('work clock energy cycle', () => {
  it('drops energy by 10 only after the short rest completes', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1000);
    let state = createDefaultGameState();

    state = completeWork(state);
    expect(state.currentEnergy).toBe(100);

    state = completeRest(state);
    expect(state.currentEnergy).toBe(90);

    state = completeWork(state);
    state = completeRest(state);
    expect(state.currentEnergy).toBe(80);
  });

  it('restores all energy after a long rest', () => {
    let state = { ...createDefaultGameState(), currentEnergy: 40 };
    state = startLongRest(state);
    state = completeRest(state);
    expect(state.currentEnergy).toBe(100);
    expect(state.workSession.cyclesCompleted).toBe(0);
  });

  it('resets active clock sessions on hydration', () => {
    const state = sanitizeHydratedGameState({
      workSession: {
        state: 'working',
        remainingSeconds: 12,
        restType: null,
        cyclesCompleted: 3,
        sessionStart: 1000,
      },
    });

    expect(state.workSession.state).toBe('idle');
    expect(state.workSession.remainingSeconds).toBe(1500);
  });
});
