import { describe, it, expect, vi } from 'vitest';
import { EnemyAI } from './EnemyAI.js';

describe('EnemyAI', () => {
    it('should initialize with correct properties', () => {
        const game = { frontlineX: 0, zones: [], spawnUnit: vi.fn() };
        const ai = new EnemyAI(game);
        expect(ai.flux).toBe(100);
    });

    it('should spawn units based on decisions', () => {
        const game = {
            frontlineX: -30, // Panic mode
            zones: [],
            spawnUnit: vi.fn()
        };
        const ai = new EnemyAI(game);
        ai.flux = 200;
        ai.makeDecision();
        expect(game.spawnUnit).toHaveBeenCalledWith('enemy', 'SCRAP_HOUND');
    });
});
