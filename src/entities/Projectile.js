import * as THREE from 'three';

export class Projectile {
    constructor(options = {}) {
        this.start = options.start.clone();
        this.target = options.target;
        this.targetPos = options.target.position.clone();
        this.speed = options.speed || 20;
        this.damage = options.damage || 10;
        this.team = options.team;
        this.type = options.type || 'bullet'; // 'bullet' or 'mortar'

        this.progress = 0;
        this.distance = this.start.distanceTo(this.targetPos);
        this.duration = this.distance / this.speed;

        this.mesh = this.createMesh();
        this.mesh.position.copy(this.start);
    }

    createMesh() {
        const geometry = this.type === 'mortar' ?
            new THREE.SphereGeometry(0.4, 8, 8) :
            new THREE.SphereGeometry(0.1, 4, 4);
        const material = new THREE.MeshBasicMaterial({
            color: this.team === 'player' ? 0xffff00 : 0xffaa00
        });
        return new THREE.Mesh(geometry, material);
    }

    update(deltaTime) {
        this.progress += deltaTime / this.duration;
        if (this.progress >= 1) {
            this.onHit();
            return true;
        }

        // Linear interpolation for X and Z
        this.mesh.position.lerpVectors(this.start, this.targetPos, this.progress);

        if (this.type === 'mortar') {
            // Parabolic arc for Y
            const height = 10; // Max height of arc
            this.mesh.position.y = Math.sin(this.progress * Math.PI) * height + 1;
        } else {
            this.mesh.position.y = 1;
        }

        return false;
    }

    onHit() {
        if (this.target && this.target.state !== 'DEAD') {
            this.target.takeDamage(this.damage);
        }
    }
}
