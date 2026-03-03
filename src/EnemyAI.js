import { UNIT_TYPES } from './entities/UnitTypes.js';

export class EnemyAI {
    constructor(game) {
        this.game = game;
        this.lastSpawnTime = 0;
        this.spawnInterval = 3; // Basic interval
        this.flux = 100;
        this.incomeRate = 10;
        this.extractors = 0;
    }

    update(deltaTime, gameTime) {
        // AI has its own economy separate from player for now, or just cheats?
        // Let's give it a simple independent flux pool.
        this.flux += (this.incomeRate + this.extractors * 5) * deltaTime;

        if (gameTime - this.lastSpawnTime >= this.spawnInterval) {
            this.makeDecision();
            this.lastSpawnTime = gameTime;
        }
    }

    makeDecision() {
        const frontline = this.game.frontlineX;

        // Mode detection
        let mode = 'balanced';
        if (frontline < -20) mode = 'panic'; // Player pushing deep into AI territory
        if (frontline > 20) mode = 'greed';  // AI pushing deep into Player territory

        if (mode === 'panic') {
            // Spam cheap units (Scrap-Hounds)
            this.spawnIfPossible('SCRAP_HOUND');
            this.spawnInterval = 1.5;
        } else if (mode === 'greed') {
            // Build extractors if AI controls zones
            const aiZones = this.game.zones.filter(z => z.owner === 'enemy' && !z.hasExtractor);
            if (aiZones.length > 0 && this.flux >= 50) {
                const zone = aiZones[0];
                zone.hasExtractor = true;
                this.flux -= 50;
                this.extractors++;
                // Visual for AI extractor (red)
                const THREE = this.game.scene.constructor.name === 'Scene' ? window.THREE : null; // Hacky way to get THREE if needed
                // Better to just let Game handle it if possible, but let's keep it simple
            }
            this.spawnIfPossible('GOLIATH_MECH') || this.spawnIfPossible('PEACEKEEPER');
            this.spawnInterval = 4;
        } else {
            // Balanced
            const r = Math.random();
            if (r < 0.6) this.spawnIfPossible('PEACEKEEPER');
            else if (r < 0.9) this.spawnIfPossible('AEGIS_DRONE');
            else this.spawnIfPossible('MORTAR_WALKER');
            this.spawnInterval = 3;
        }
    }

    spawnIfPossible(typeKey) {
        const cost = UNIT_TYPES[typeKey].cost;
        if (this.flux >= cost) {
            this.game.spawnUnit('enemy', typeKey);
            this.flux -= cost;
            return true;
        }
        return false;
    }
}
