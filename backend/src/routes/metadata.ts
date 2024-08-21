import { Router, Request, Response } from "express";
import {validateUrls} from "../business/urlValidationLogic";
import logger from "../logger/logger";
import axios from "axios";

const router = Router();

// Middleware to validate URLs


router.post(
    "/",
    validateUrls, // Use the URL validation middleware
    async function (req: Request, res: Response) {
        // Assuming other logic here for handling the request
        const urls: string[] = req.body.urls;

        logger.info(`Received request to fetch metadata for URLs: ${JSON.stringify(urls)}`);

        if (!urls || !Array.isArray(urls)) {
            logger.warn("Invalid input, expected an array of URLs.");
            return res
                .status(400)
                .json({ error: "Invalid input, expected an array of URLs." });
        }
        const metadataPromises = urls.map(async function (url) {
            return fetchMetadata(url);
        });

        try {
            const results = await Promise.all(metadataPromises);
            logger.info("Successfully fetched metadata for all URLs.");
            logger.debug(`Metadata results: ${JSON.stringify(results)}`);
            res.json(results);
        } catch (error) {
            logger.error(`Failed to fetch metadata for one or more URLs. Error: ${error as Error}`);
            res.status(500).json({ error: "Failed to fetch metadata" });
        }

    }
);

// Utility function to extract metadata
export async function fetchMetadata(url: string) {
    logger.info(`Fetching metadata for URL: ${url}`);

    try {
        const response = await axios.get(url);
        const html = response.data;
        logger.debug(`Fetched HTML content for URL: ${url}`);

        // Basic parsing for title, description, and image
        const titleMatch = html.match(/<title>([^<]*)<\/title>/);
        const descriptionMatch = html.match(
            /<meta name="description" content="([^"]*)"/
        );
        const imageMatch = html.match(
            /<meta property="og:image" content="([^"]*)"/
        );

        const metadata = {
            url,
            title: titleMatch ? titleMatch[1] : "No title found",
            description: descriptionMatch
                ? descriptionMatch[1]
                : "No description found",
            image: imageMatch ? imageMatch[1] : "No image found",
        };

        logger.info(`Successfully extracted metadata for URL: ${url}`);
        logger.debug(`Metadata for ${url}: ${JSON.stringify(metadata)}`);

        return metadata;
    } catch (error) {
        logger.error(`Failed to fetch metadata for URL: ${url}. Error: ${error as Error}`);
        return { url, error: "Failed to fetch metadata" };
    }
}

export default router; // for tests
