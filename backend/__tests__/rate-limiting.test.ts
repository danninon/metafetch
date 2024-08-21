import request from 'supertest';
import app from '../src/server'; // Adjust the path as needed

describe('Rate Limiter Middleware', () => {
    it('should allow 5 requests and block the 6th within a minute', async () => {
        for (let i = 1; i <= 5; i++) {
            const response = await request(app).post('/fetch-metadata');
            expect(response.status).toBe(200);
            // expect(response.text).toBe('Request successful');
        }

        // The 6th request should be blocked
        const blockedResponse = await request(app).post('/fetch-metadata');
        expect(blockedResponse.status).toBe(429);
        expect(blockedResponse.text).toBe('Too many requests, please try again later.');
    });
});
