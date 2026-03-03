import { UNIT_TYPES } from './entities/UnitTypes.js';

export class EnemyAI {
    constructor(game) {
        this.game = game;
        this.lastSpawnTime = 0;
        this.spawnInterval = 2.5; // Faster base interval
        this.flux = 150; // Higher starting flux
        this.incomeRate = 12; // Higher base income
        this.extractors = 0;
    }

    update(deltaTime, gameTime) {
        // Scaling difficulty over time
        const timeScale = 1 + (gameTime / 120); // 2x income at 2 mins
        this.flux += (this.incomeRate * timeScale + this.extractors * 8) * deltaTime;

        if (gameTime - this.lastSpawnTime >= this.spawnInterval) {
            this.makeDecision(gameTime);
            this.lastSpawnTime = gameTime;
        }
    }

    makeDecision(gameTime) {
        const frontline = this.game.frontlineX;

        // Mode detection
        let mode = 'balanced';
        if (frontline < -15) mode = 'panic'; // More sensitive panic
        if (frontline > 25) mode = 'greed';  

        if (mode === 'panic') {
            // Panic: Spam mixed tier 1 quickly
            const r = Math.random();
            if (r < 0.7) this.spawnIfPossible('SCRAP_HOUND');
            else this.spawnIfPossible('PEACEKEEPER');
            
            this.spawnInterval = 0.8; // Very aggressive
        } else if (mode === 'greed') {
            // Greed: Build economy and heavy units
            const aiZones = this.game.zones.filter(z => z.owner === 'enemy' && !z.hasExtractor);
            if (aiZones.length > 0 && this.flux >= 50) {
                const zone = aiZones[0];
                zone.hasExtractor = true;
                this.flux -= 50;
                this.extractors++;
                
                // Trigger a visual for AI building an extractor
                this.game.buildAIBox(zone.x);
            }
            
            const r = Math.random();
            if (r < 0.4) this.spawnIfPossible('GOLIATH_MECH');
            else if (r < 0.7) this.spawnIfPossible('MORTAR_WALKER');
            else this.spawnIfPossible('AEGIS_DRONE');
            
            this.spawnInterval = 3.5;
        } else {
            // Balanced: Smart mixture
            const r = Math.random();
            if (r < 0.3) this.spawnIfPossible('SCRAP_HOUND');
            else if (r < 0.6) this.spawnIfPossible('PEACEKEEPER');
            else if (r < 0.85) this.spawnIfPossible('AEGIS_DRONE');
            else this.spawnIfPossible('MORTAR_WALKER');
            
            this.spawnInterval = 2.0;
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
