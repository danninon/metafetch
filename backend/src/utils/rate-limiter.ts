import rateLimit from "express-rate-limit";

export const createRateLimiter = (limit: number = 5, windowMs: number = 60 * 1000) => {
    return rateLimit({
        windowMs,
        max: limit,
        message: "Too many requests, please try again later.",
    });
};