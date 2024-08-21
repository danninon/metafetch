// import logger from "../logger/logger";
//
// // Function to check if a URL is valid
// export function isValidUrl(url: string): boolean {
//     try {
//         // Basic check using the URL constructor
//         new URL(url);
//
//         // Additional regex validation to ensure proper URL structure
//         const urlPattern = /^(https?:\/\/)?(([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}|localhost|127\.0\.0\.1)(:\d{1,5})?(\/.*)?$/;
//
//
//         if (!urlPattern.test(url)) {
//             throw new Error(`Invalid URL format: ${url}`);
//         }
//
//         logger.info(`Valid URL format: ${url}`);
//         return true;
//     } catch (error) {
//         logger.warn(`Invalid URL format: ${url}`);
//         return false;
//     }
// }
//
// // Middleware to validate URLs
// export function validateUrls(req: any, res: any, next: any) {
//     const { urls } = req.body;
//
//     if (!urls || !Array.isArray(urls)) {
//         logger.warn("Invalid input, expected an array of URLs.");
//         return res.status(400).json({ error: "Invalid input, expected an array of URLs." });
//     }
//
//     for (const url of urls) {
//         if (!isValidUrl(url)) {
//             return res.status(400).json({ error: `Invalid URL format: ${url}` });
//         }
//     }
//
//     next();
// }

import logger from "../logger/logger";
import axios from "axios";

// Function to check if a URL is valid and reachable
export async function isValidUrl(url: string): Promise<{ success: boolean, error: string }> {
    try {
        // Basic check using the URL constructor
        new URL(url);

        // Additional regex validation to ensure proper URL structure
        const urlPattern = /^(https?:\/\/)?(([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}|localhost|127\.0\.0\.1)(:\d{1,5})?(\/.*)?$/;

        if (!urlPattern.test(url)) {
            const errorMsg = `Invalid URL format: ${url}`;
            logger.warn(errorMsg);
            return { success: false, error: errorMsg };
        }

        // Check if the URL is reachable by making a HEAD request
        try {
            await axios.head(url);
            logger.info(`URL is reachable: ${url}`);
        } catch {
            const errorMsg = `URL ${url} Unreachable`;
            logger.warn(errorMsg);
            return { success: false, error: errorMsg };
        }

        logger.info(`Valid URL format and reachable: ${url}`);
        return { success: true, error: ""};
    } catch {
        const errorMsg = `Invalid URL format: ${url}`;
        logger.warn(errorMsg);
        return { success: false, error: errorMsg };
    }
}

// Middleware to validate URLs
// export async function validateUrls(req: any, res: any, next: any) {
//     const { urls } = req.body;
//
//     if (!urls || !Array.isArray(urls)) {
//         const errorMsg = "Invalid input, expected an array of URLs.";
//         logger.warn(errorMsg);
//         return res.status(400).json({ error: errorMsg });
//     }
//
//     const results = [];
//
//     for (const url of urls) {
//         const { success, error } = await isValidUrl(url);
//         if (success) {
//             results.push({ url, status: 'Valid and reachable' });
//         } else {
//             results.push({ url, status: error });
//         }
//     }
//
//     res.status(200).json({ results });
//
//     next();
// }
