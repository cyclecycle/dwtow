import { describe, it, expect } from 'vitest';
import { ResourceManager } from './ResourceManager.js';

describe('ResourceManager', () => {
    it('should initialize with starting flux', () => {
        const res = new ResourceManager();
        expect(res.flux).toBe(100);
    });

    it('should increment flux over time', () => {
        const res = new ResourceManager();
        res.update(1); // 1 second
        expect(res.flux).toBe(110); // 100 + 10
    });

    it('should spend flux correctly', () => {
        const res = new ResourceManager();
        const success = res.spend(50);
        expect(success).toBe(true);
        expect(res.flux).toBe(50);

        const failure = res.spend(100);
        expect(failure).toBe(false);
        expect(res.flux).toBe(50);
    });

    it('should increase income with extractors', () => {
        const res = new ResourceManager();
        res.addExtractor();
        res.update(1);
        expect(res.flux).toBe(115); // 100 + 10 + 5
    });
});
