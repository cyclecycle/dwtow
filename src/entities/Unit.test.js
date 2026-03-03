import { describe, it, expect, vi } from 'vitest';
import { Unit } from './Unit.js';
import * as THREE from 'three';

describe('Unit Class', () => {
    it('should initialize with correct properties', () => {
        const typeData = { speed: 10, health: 100, attackDamage: 10, attackRange: 5 };
        const unit = new Unit({ team: 'player', type: 'PEACEKEEPER', typeData });
        expect(unit.team).toBe('player');
        expect(unit.speed).toBe(10);
        expect(unit.state).toBe('MOVE');
        expect(unit.mesh).toBeDefined();
    });

    it('should move forward based on team (player)', () => {
        const unit = new Unit({ team: 'player', speed: 10, position: new THREE.Vector3(0, 0, 0) });
        unit.update(1); // 1 second
        expect(unit.position.x).toBe(10);
    });

    it('should move backward based on team (enemy)', () => {
        const unit = new Unit({ team: 'enemy', speed: 10, position: new THREE.Vector3(0, 0, 0) });
        unit.update(1); // 1 second
        expect(unit.position.x).toBe(-10);
    });

    it('should take damage and die', () => {
        const unit = new Unit({ health: 100 });
        unit.takeDamage(50);
        expect(unit.health).toBe(50);
        unit.takeDamage(60);
        expect(unit.health).toBe(0);
        expect(unit.state).toBe('DEAD');
    });

    it('should attack target when in range and state is ATTACK', () => {
        const attacker = new Unit({ team: 'player', attackDamage: 20, attackRate: 1 });
        const target = new Unit({ team: 'enemy', health: 100 });

        attacker.state = 'ATTACK';
        attacker.target = target;

        const spy = vi.fn();
        window.addEventListener('unit-attack', spy);

        attacker.update(0.1, 1); // gameTime = 1
        expect(spy).toHaveBeenCalled();

        window.removeEventListener('unit-attack', spy);

        target.takeDamage(100); // Make it dead
        attacker.update(0.1, 1);

        expect(attacker.state).toBe('MOVE');
        expect(attacker.target).toBeNull();
    });
});
