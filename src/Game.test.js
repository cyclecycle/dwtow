import { describe, it, expect, vi } from 'vitest';
import { Game } from './Game.js';

// Mock Three.js WebGLRenderer since JSDOM doesn't support WebGL
vi.mock('three', async () => {
    const actual = await vi.importActual('three');
    const WebGLRenderer = vi.fn(function () {
        this.setSize = vi.fn();
        this.setPixelRatio = vi.fn();
        this.setClearColor = vi.fn();
        this.render = vi.fn();
        this.domElement = document.createElement('canvas');
    });
    return {
        ...actual,
        WebGLRenderer
    };
});

describe('Game Class', () => {
    it('should initialize with a canvas', () => {
        document.body.innerHTML = '<canvas id="game-canvas"></canvas>';
        const game = new Game('game-canvas');
        expect(game).toBeDefined();
        expect(game.canvas).toBeDefined();
    });

    it('should have a scene, camera and renderer', () => {
        document.body.innerHTML = '<canvas id="game-canvas"></canvas>';
        const game = new Game('game-canvas');
        expect(game.scene).toBeDefined();
        expect(game.camera).toBeDefined();
        expect(game.renderer).toBeDefined();
    });

    it('should find closest enemy target', () => {
        document.body.innerHTML = '<canvas id="game-canvas"></canvas>';
        const game = new Game('game-canvas');
        const p1 = game.spawnUnit('player');
        p1.position.x = 0;

        const e1 = game.spawnUnit('enemy');
        e1.position.x = 2; // Closer

        const e2 = game.spawnUnit('enemy');
        e2.position.x = 10; // Further

        const target = game.findTarget(p1);
        expect(target).toBe(e1);
    });

    it('should not find target out of range', () => {
        document.body.innerHTML = '<canvas id="game-canvas"></canvas>';
        const game = new Game('game-canvas');
        const p1 = game.spawnUnit('player');
        p1.position.x = 0;
        p1.attackRange = 5;

        const e1 = game.spawnUnit('enemy');
        e1.position.x = 10; // Out of range

        const target = game.findTarget(p1);
        expect(target).toBeNull();
    });

    it('should calculate frontline correctly', () => {
        document.body.innerHTML = '<canvas id="game-canvas"></canvas>';
        const game = new Game('game-canvas');
        const p1 = game.spawnUnit('player');
        p1.position.x = 10;

        const e1 = game.spawnUnit('enemy');
        e1.position.x = 20;

        game.calculateFrontline();
        expect(game.frontlineX).toBe(15);
    });

    it('should update zone ownership based on frontline', () => {
        document.body.innerHTML = '<canvas id="game-canvas"></canvas>';
        const game = new Game('game-canvas');
        game.frontlineX = 30; // Past zone 1, 2, 3
        game.updateZones();

        expect(game.zones[0].owner).toBe('player');
        expect(game.zones[1].owner).toBe('player');
        expect(game.zones[2].owner).toBe('player');
        expect(game.zones[3].owner).toBe('player');
    });
});
