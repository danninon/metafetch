import xss from "xss";

interface Metadata {
    url: string;
    title?: string;
    description?: string;
    image?: string;
}

export function sanitizeMetadata(metadata: Metadata) {
    return {
        url: metadata.url,
        title: metadata.title ? xss(metadata.title) : "No title found", // Ensure string
        description: metadata.description ? xss(metadata.description) : "No description found", // Ensure string
        image: metadata.image ? xss(metadata.image) : "No image found", // Ensure string
    };
}
