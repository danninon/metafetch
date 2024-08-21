import { Router, Request, Response } from "express";
import {isValidUrl} from "../business/urlValidationLogic";
import logger from "../logger/logger";
import {fetchMetadata} from "../business/fetchMetaData";
import {sanitizeMetadata} from "../security/sanitizationBoxing";


const router = Router();

interface SuccessResult {
    url: string;
    title: string;
    description: string;
    image: string;
}

interface ErrorResult {
    url: string;
    status: string;
    message: string;
}

type Result = SuccessResult | ErrorResult;

router.post(
    "/",
    async function (req: Request, res: Response) {
        const urls: string[] = req.body.urls;

        logger.info(`Received request to fetch metadata for URLs: ${JSON.stringify(urls)}`);

        if (!urls || !Array.isArray(urls)) {
            logger.warn("Invalid input, expected an array of URLs.");
            return res.status(400).json({ error: "Invalid input, expected an array of URLs." });
        }

        const metadataPromises = urls.map(async (url): Promise<Result> => {
            const validationResult = await isValidUrl(url);

            if (!validationResult.success) {
                return { url, status: "error", message: validationResult.error };
            }

            try {
                const metadata = await fetchMetadata(url);
                return sanitizeMetadata(metadata); // Ensure all fields are strings
            } catch (error) {
                logger.error(`Failed to fetch metadata for URL: ${url}. Error: ${error as Error}`);
                return { url, status: "error", message: `Failed to fetch metadata for ${url}` };
            }
        });

        try {
            const results = await Promise.all(metadataPromises);

            const allSucceeded = results.every(result => 'title' in result);
            const allFailed = results.every(result => 'status' in result);

            if (allSucceeded) {
                res.status(200).json(results);
            } else if (allFailed) {
                res.status(400).json({ error: "All URLs failed.", results });
            } else {
                res.status(207).json(results);
            }

            logger.info("Processed all URLs.");
            logger.debug(`Processing results: ${JSON.stringify(results)}`);
        } catch (error) {
            logger.error(`An unexpected error occurred. Error: ${error as Error}`);
            res.status(500).json({ error: "An unexpected error occurred while processing the URLs." });
        }
    }
);

export default router;