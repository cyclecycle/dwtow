import * as THREE from 'three';

export class Unit {
    constructor(options = {}) {
        this.id = Math.random().toString(36).substr(2, 9);
        this.type = options.type || 'PEACEKEEPER';
        this.team = options.team || 'player';

        const typeData = options.typeData || {};
        this.speed = typeData.speed || options.speed || 5;
        this.attackRange = typeData.attackRange || options.attackRange || 5;
        this.attackDamage = typeData.attackDamage || options.attackDamage || 10;
        this.attackRate = typeData.attackRate || options.attackRate || 1;
        this.lastAttackTime = 0;

        this.health = typeData.health || options.health || 100;
        this.maxHealth = this.health;
        this.position = options.position || new THREE.Vector3(0, 0, 0);
        this.state = 'MOVE';
        this.target = null;

        this.mesh = this.createMesh(typeData);
        this.mesh.position.copy(this.position);
    }

    createMesh(typeData) {
        const color = this.team === 'player' ? 0x3366ff : 0xff3333;

        let geometry;
        if (this.type === 'GOLIATH_MECH') {
            geometry = new THREE.BoxGeometry(3, 4, 3);
        } else if (this.type === 'MORTAR_WALKER') {
            geometry = new THREE.CylinderGeometry(1, 1.5, 2, 6);
        } else if (this.type === 'AEGIS_DRONE') {
            geometry = new THREE.SphereGeometry(1.2, 8, 8);
        } else {
            geometry = new THREE.BoxGeometry(1, 1, 1);
        }

        const material = new THREE.MeshStandardMaterial({
            color,
            wireframe: this.type === 'AEGIS_DRONE' // Just to make it look different
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = (geometry.parameters.height || 1) / 2;
        return mesh;
    }

    update(deltaTime, gameTime) {
        if (this.state === 'DEAD') return;

        if (this.state === 'MOVE') {
            const direction = this.team === 'player' ? 1 : -1;
            this.position.x += this.speed * deltaTime * direction;
        }

        if (this.state === 'ATTACK' && this.target) {
            if (this.target.state === 'DEAD') {
                this.target = null;
                this.state = 'MOVE';
            } else if (gameTime - this.lastAttackTime >= this.attackRate) {
                this.attack(this.target);
                this.lastAttackTime = gameTime;
            }
        }

        this.mesh.position.copy(this.position);
        this.mesh.position.y = 0.5;
    }

    attack(target) {
        // Dispatch hit event for UI feedback
        window.dispatchEvent(new CustomEvent('unit-attack', {
            detail: {
                unit: this,
                target: target
            }
        }));
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.state = 'DEAD';
            // Dispatch death event for screen shake/VFX
            window.dispatchEvent(new CustomEvent('unit-death', {
                detail: { type: this.type, position: this.position.clone() }
            }));
        }
    }
}
