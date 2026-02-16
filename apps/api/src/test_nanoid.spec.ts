jest.mock('nanoid', () => ({ nanoid: () => 'id' }));
import { nanoid } from 'nanoid';

describe('Nanoid', () => {
    it('should be defined', () => {
        expect(nanoid).toBeDefined();
        expect(nanoid()).toBe('id');
    });
});
