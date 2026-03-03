export class ResourceManager {
    constructor() {
        this.flux = 100;
        this.incomeRate = 10; // Base passive income
        this.extractors = 0;
    }

    update(deltaTime) {
        this.flux += (this.incomeRate + this.extractors * 5) * deltaTime;
    }

    spend(amount) {
        if (this.flux >= amount) {
            this.flux -= amount;
            return true;
        }
        return false;
    }

    addExtractor() {
        this.extractors++;
    }
}
