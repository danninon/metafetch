import express from 'express';
import http from 'http';
import { fetchMetadata } from '../../src/business/fetchMetaData'; // Path to your fetchMetadata function
import { sanitizeMetadata } from '../../src/security/sanitizationBoxing'; // Path to your sanitization function

describe('Integration Test with Mock Third-Party Server', () => {
    let server: http.Server;

    beforeAll((done) => {
        const app = express();

        // Serve a simple HTML file with malicious metadata
        app.get('/xss-test.html', (req, res) => {
            res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta property="og:title" content="<script>alert('Hacked!');</script>">
                    <meta property="og:description" content="This is a <img src=x onerror=alert('Hacked!')> description.">
                    <meta property="og:image" content="https://example.com/image.jpg?query=<script>alert('Hacked!');</script>">
                    <title>XSS Test Page</title>
                </head>
                <body>
                    <h1>This is a test page for XSS prevention</h1>
                </body>
                </html>
            `);
        });

        // Start the mock server on a random available port
        server = app.listen(8000, () => {
            const port = (server.address() as any).port;
            console.log(`Test server running on port ${port}`);
            done();
        });
    });

    afterAll((done) => {
        server.close(done);
    });

    it('should fetch and sanitize metadata from the mock server', async () => {
        const port = (server.address() as any).port;
        const testUrl = `http://localhost:${port}/xss-test.html`;

        // Fetch the metadata
        const metadata = await fetchMetadata(testUrl);

        // Sanitize the metadata
        const sanitizedMetadata = await sanitizeMetadata(metadata);

        // Assertions
        expect(sanitizedMetadata.image).toBe("https://example.com/image.jpg?query=&lt;script&gt;alert('Hacked!');&lt;/script&gt;");
    });

    it('should fetch and sanitize metadata from the HubSpot Blog page', async () => {
        const testUrl = "https://blog.hubspot.com/marketing/google-logo-history";
        const noneSanitizedUrl = 'https://53.fs1.hubspotusercontent-na1.net/hubfs/53/image8-2.jpg';
        // Fetch the metadata
        const metadata = await fetchMetadata(testUrl);

        // Sanitize the metadata
        const sanitizedMetadata = await sanitizeMetadata(metadata);

        // Assertions to check if the correct image URL is returned
        expect(sanitizedMetadata.image).toBe(noneSanitizedUrl);


    });
});
