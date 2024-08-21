// Utility function to extract metadata
import logger from "../logger/logger";
import axios from "axios";

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