import * as THREE from 'three';
import { Unit } from './entities/Unit.js';
import { UNIT_TYPES } from './entities/UnitTypes.js';
import { EnemyAI } from './EnemyAI.js';
import { ResourceManager } from './ResourceManager.js';
import { Projectile } from './entities/Projectile.js';

export class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0x050505);

        this.scene = new THREE.Scene();
        this.units = [];
        this.projectiles = [];
        this.gameTime = 0;
        this.shakeIntensity = 0;
        this.resources = new ResourceManager();
        this.ai = new EnemyAI(this);
        this.frontlineX = 0;
        this.gameState = 'PLAYING'; // PLAYING, VICTORY, DEFEAT

        window.addEventListener('unit-attack', (e) => this.spawnProjectile(e.detail.unit, e.detail.target));
        window.addEventListener('unit-death', (e) => {
            const intensity = e.detail.type === 'GOLIATH_MECH' ? 1.0 : 0.2;
            this.shake(intensity);
        });
        this.zones = [
            { id: 0, x: -40, owner: 'player', hasExtractor: false },
            { id: 1, x: -20, owner: 'neutral', hasExtractor: false },
            { id: 2, x: 0, owner: 'neutral', hasExtractor: false },
            { id: 3, x: 20, owner: 'neutral', hasExtractor: false },
            { id: 4, x: 40, owner: 'enemy', hasExtractor: false }
        ];

        // Isometric Camera Setup
        const aspect = window.innerWidth / window.innerHeight;
        const d = 20;
        this.camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
        this.camera.position.set(20, 20, 20);
        this.camera.lookAt(0, 0, 0);

        this.initLights();
        this.initMap();

        window.addEventListener('resize', () => this.onWindowResize());
        window.addEventListener('unit-hit', (e) => {
            if (e.detail.team === 'player' || e.detail.team === 'enemy') {
                this.shake(0.1);
            }
        });
    }

    initLights() {
        const ambientLight = new THREE.AmbientLight(0x404040, 2);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
        dirLight.position.set(10, 20, 10);
        this.scene.add(dirLight);
    }

    initMap() {
        // Linear highway
        const geometry = new THREE.PlaneGeometry(100, 10);
        const material = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            side: THREE.DoubleSide
        });
        const highway = new THREE.Mesh(geometry, material);
        highway.rotation.x = Math.PI / 2;
        this.scene.add(highway);

        // Add some "markers" for zones later
        for (let i = -2; i <= 2; i++) {
            const markerGeo = new THREE.BoxGeometry(0.2, 0.1, 10);
            const markerMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
            const marker = new THREE.Mesh(markerGeo, markerMat);
            marker.position.set(i * 20, 0.05, 0);
            this.scene.add(marker);
        }
    }

    onWindowResize() {
        const aspect = window.innerWidth / window.innerHeight;
        const d = 20;
        this.camera.left = -d * aspect;
        this.camera.right = d * aspect;
        this.camera.top = d;
        this.camera.bottom = -d;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    start() {
        this.lastTime = performance.now();
        this.animate();
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        this.gameTime += deltaTime;

        this.update(deltaTime);
        this.render();
    }

    update(deltaTime) {
        if (this.gameState !== 'PLAYING') return;

        this.resources.update(deltaTime);
        this.ai.update(deltaTime, this.gameTime);
        this.calculateFrontline();
        this.updateZones();
        this.updateProjectiles(deltaTime);
        this.checkWinLoss();

        // Update all units
        for (let i = this.units.length - 1; i >= 0; i--) {
            const unit = this.units[i];

            // Find target if MOVE
            if (unit.state === 'MOVE') {
                const target = this.findTarget(unit);
                if (target) {
                    unit.target = target;
                    unit.state = 'ATTACK';
                }
            }

            unit.update(deltaTime, this.gameTime);

            if (unit.state === 'DEAD') {
                this.scene.remove(unit.mesh);
                this.units.splice(i, 1);
            }
        }
    }

    calculateFrontline() {
        let playerFurthest = -50;
        let enemyFurthest = 50;

        for (const unit of this.units) {
            if (unit.team === 'player' && unit.position.x > playerFurthest) {
                playerFurthest = unit.position.x;
            } else if (unit.team === 'enemy' && unit.position.x < enemyFurthest) {
                enemyFurthest = unit.position.x;
            }
        }

        this.frontlineX = (playerFurthest + enemyFurthest) / 2;
    }

    updateZones() {
        const epsilon = 0.1;
        for (const zone of this.zones) {
            if (this.frontlineX > zone.x + epsilon) {
                zone.owner = 'player';
            } else if (this.frontlineX < zone.x - epsilon) {
                zone.owner = 'enemy';
            }
        }
    }

    buildExtractor(zoneId) {
        const zone = this.zones.find(z => z.id === zoneId);
        if (zone && zone.owner === 'player' && !zone.hasExtractor) {
            if (this.resources.spend(50)) {
                zone.hasExtractor = true;
                this.resources.addExtractor();
                // Visual feedback for extractor
                const markerGeo = new THREE.CylinderGeometry(1, 1, 2, 8);
                const markerMat = new THREE.MeshStandardMaterial({ color: 0xffff00 });
                const extractor = new THREE.Mesh(markerGeo, markerMat);
                extractor.position.set(zone.x, 1, (Math.random() - 0.5) * 5);
                this.scene.add(extractor);
                return true;
            }
        }
        return false;
    }

    findTarget(unit) {
        let closestTarget = null;
        let minDistance = unit.attackRange;

        for (const other of this.units) {
            if (other.team !== unit.team && other.state !== 'DEAD') {
                const distance = Math.abs(other.position.x - unit.position.x);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestTarget = other;
                }
            }
        }
        return closestTarget;
    }

    spawnUnit(team, typeKey = 'PEACEKEEPER') {
        const typeData = UNIT_TYPES[typeKey];
        if (team === 'player' && this.resources.flux < typeData.cost) {
            return null;
        }

        if (team === 'player') {
            this.resources.spend(typeData.cost);
        }

        const startX = team === 'player' ? -50 : 50;
        const unit = new Unit({
            team,
            type: typeKey,
            typeData,
            position: new THREE.Vector3(startX, 0, (Math.random() - 0.5) * 8)
        });
        this.units.push(unit);
        this.scene.add(unit.mesh);
        return unit;
    }

    spawnProjectile(attacker, target) {
        const projectile = new Projectile({
            start: attacker.position.clone().add(new THREE.Vector3(0, 1, 0)),
            target: target,
            team: attacker.team,
            damage: attacker.attackDamage,
            type: attacker.type === 'MORTAR_WALKER' ? 'mortar' : 'bullet'
        });
        this.projectiles.push(projectile);
        this.scene.add(projectile.mesh);
    }

    updateProjectiles(deltaTime) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            const hit = p.update(deltaTime);
            if (hit) {
                this.scene.remove(p.mesh);
                this.projectiles.splice(i, 1);

                // Dispatch hit event for UI markers
                window.dispatchEvent(new CustomEvent('unit-hit', {
                    detail: { team: p.team, targetPosition: p.targetPos }
                }));
            }
        }
    }

    checkWinLoss() {
        if (this.frontlineX <= -48) {
            this.gameState = 'DEFEAT';
            window.dispatchEvent(new CustomEvent('game-over', { detail: { result: 'DEFEAT' } }));
        } else if (this.frontlineX >= 48) {
            this.gameState = 'VICTORY';
            window.dispatchEvent(new CustomEvent('game-over', { detail: { result: 'VICTORY' } }));
        }
    }

    buildAIBox(x) {
        const markerGeo = new THREE.CylinderGeometry(1, 1, 2, 8);
        const markerMat = new THREE.MeshStandardMaterial({ color: 0xff00ff }); // AI is purple/red
        const extractor = new THREE.Mesh(markerGeo, markerMat);
        extractor.position.set(x, 1, (Math.random() - 0.5) * 5);
        this.scene.add(extractor);
    }

    shake(intensity) {
        this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    }

    render() {
        // Apply camera shake
        if (this.shakeIntensity > 0) {
            const rx = (Math.random() - 0.5) * this.shakeIntensity;
            const ry = (Math.random() - 0.5) * this.shakeIntensity;
            this.camera.position.x += rx;
            this.camera.position.y += ry;

            this.renderer.render(this.scene, this.camera);

            // Reset for next frame (orthographic camera is fixed position mostly)
            this.camera.position.x -= rx;
            this.camera.position.y -= ry;

            this.shakeIntensity *= 0.9; // Decay
            if (this.shakeIntensity < 0.01) this.shakeIntensity = 0;
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }
}
