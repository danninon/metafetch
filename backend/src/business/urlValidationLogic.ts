import logger from "../logger/logger";

// Function to check if a URL is valid
export function isValidUrl(url: string): boolean {
    try {
        // Basic check using the URL constructor
        new URL(url);

        // Additional regex validation to ensure proper URL structure
        const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;

        if (!urlPattern.test(url)) {
            throw new Error(`Invalid URL format: ${url}`);
        }

        logger.info(`Valid URL format: ${url}`);
        return true;
    } catch (error) {
        logger.warn(`Invalid URL format: ${url}`);
        return false;
    }
}

// Middleware to validate URLs
export function validateUrls(req: any, res: any, next: any) {
    const { urls } = req.body;

    if (!urls || !Array.isArray(urls)) {
        logger.warn("Invalid input, expected an array of URLs.");
        return res.status(400).json({ error: "Invalid input, expected an array of URLs." });
    }

    for (const url of urls) {
        if (!isValidUrl(url)) {
            return res.status(400).json({ error: `Invalid URL format: ${url}` });
        }
    }

    next();
}
