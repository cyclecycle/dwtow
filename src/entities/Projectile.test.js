import { describe, it, expect, vi } from 'vitest';
import { Projectile } from './Projectile.js';
import * as THREE from 'three';

describe('Projectile', () => {
    it('should initialize and move toward target', () => {
        const target = { position: new THREE.Vector3(10, 0, 0), takeDamage: vi.fn(), state: 'MOVE' };
        const p = new Projectile({
            start: new THREE.Vector3(0, 0, 0),
            target,
            speed: 10
        });

        expect(p.duration).toBe(1);
        p.update(0.5);
        expect(p.mesh.position.x).toBe(5);

        const hit = p.update(0.5);
        expect(hit).toBe(true);
        expect(target.takeDamage).toHaveBeenCalled();
    });

    it('should have a parabolic arc for mortar type', () => {
        const target = { position: new THREE.Vector3(10, 0, 0), takeDamage: vi.fn(), state: 'MOVE' };
        const p = new Projectile({
            start: new THREE.Vector3(0, 0, 0),
            target,
            type: 'mortar',
            speed: 10
        });

        p.update(0.5); // Midpoint
        expect(p.mesh.position.y).toBeGreaterThan(1);
    });
});
