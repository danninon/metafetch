import request from 'supertest';
import app from '../src/server'; // Adjust the path as needed

describe('URL Validation Middleware', () => {
    let server: any;

    beforeAll(() => {

        server = app.listen(4000, () => {
            console.log('Test server running on port 4000');
        });
    });

    afterAll((done) => {
        server.close(done); // Close the server after all tests are done
    });
    it('should accept a valid URL', async () => {
        const response = await request(app)
            .post('/fetch-metadata')
            .send({ urls: ["https://example.com"] }) // Valid URL
            .set('Accept', 'application/json');

        expect(response.status).toBe(200);

        expect(response.text).toBe('[{\"url\":\"https://example.com\",\"title\":\"Example Domain\",\"description\":\"No description found\",\"image\":\"No image found\"}]');
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

    it('should accept multiple valid URLs Texts, yes title, no image, no description', async () => {
        const response = await request(app)
            .post('/fetch-metadata')
            .send({ urls: ["https://example.com", "https://express-rate-limit.mintlify.app/quickstart/usage"] }) // Multiple valid URLs
            .set('Accept', 'application/json');

        expect(response.status).toBe(200);
        expect(response.text).toBe('' +
            "[{\"url\":\"https://example.com\",\"title\":\"Example Domain\",\"description\":\"No description found\",\"image\":\"No image found\"},{\"url\":\"https://express-rate-limit.mintlify.app/quickstart/usage\",\"title\":\"Usage - express-rate-limit\",\"description\":\"No description found\",\"image\":\"No image found\"}]"
        );
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
