import logger from "../logger/logger";
import { Router, Request, Response, NextFunction } from "express";

const router = Router();

// Middleware to validate URLs
function validateUrls(req: Request, res: Response, next: NextFunction) {
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

// Function to check if a URL is valid
function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        logger.info(`Valid URL format: ${url}`);
        return true;
    } catch {
        logger.warn(`Invalid URL format: ${url}`);
        return false;
    }
}

router.post(
    "/",
    validateUrls, // Use the URL validation middleware
    async function (req: Request, res: Response) {
        // Assuming other logic here for handling the request
        res.status(200).send("Request successful");
    }
);

export default router; // for tests
