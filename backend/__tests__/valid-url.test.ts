import request from 'supertest';
import app from '../src/server'; // Adjust the path as needed

describe('URL Validation Middleware', () => {
    it('should accept a valid URL', async () => {
        const response = await request(app)
            .post('/fetch-metadata')
            .send({ urls: ["https://example.com"] }) // Valid URL
            .set('Accept', 'application/json');

        expect(response.status).toBe(200);
        expect(response.text).toBe('Request successful');
    });

    it('should reject an invalid URL with missing protocol', async () => {
        const response = await request(app)
            .post('/fetch-metadata')
            .send({ urls: ["www.example.com"] }) // Invalid URL (missing protocol)
            .set('Accept', 'application/json');

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid URL format: www.example.com');
    });

    it('should reject an invalid URL with spaces', async () => {
        const response = await request(app)
            .post('/fetch-metadata')
            .send({ urls: ["https://example .com"] }) // Invalid URL (contains spaces)
            .set('Accept', 'application/json');

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid URL format: https://example .com');
    });

    // could be expanded to every single character
    it('should reject an invalid URL with incorrect characters', async () => {
        const response = await request(app)
            .post('/fetch-metadata')
            .send({ urls: ["https://example@.com"] }) // Invalid URL (incorrect characters)
            .set('Accept', 'application/json');

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid URL format: https://example@.com');
    });

    it('should reject an invalid URL with no domain', async () => {
        const response = await request(app)
            .post('/fetch-metadata')
            .send({ urls: ["https://"] }) // Invalid URL (no domain)
            .set('Accept', 'application/json');

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid URL format: https://');
    });

    it('should accept multiple valid URLs', async () => {
        const response = await request(app)
            .post('/fetch-metadata')
            .send({ urls: ["https://example.com", "https://anotherexample.com"] }) // Multiple valid URLs
            .set('Accept', 'application/json');

        expect(response.status).toBe(200);
        expect(response.text).toBe('Request successful');
    });

    it('should reject if one of the multiple URLs is invalid', async () => {
        const response = await request(app)
            .post('/fetch-metadata')
            .send({ urls: ["https://example.com", "invalid-url"] }) // One valid and one invalid URL
            .set('Accept', 'application/json');

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid URL format: invalid-url');
    });
});
