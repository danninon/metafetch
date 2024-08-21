import { Router, Request, Response } from "express";
import {validateUrls} from "../business/urlValidationLogic";

const router = Router();

// Middleware to validate URLs


router.post(
    "/",
    validateUrls, // Use the URL validation middleware
    async function (req: Request, res: Response) {
        // Assuming other logic here for handling the request
        res.status(200).send("Request successful");
    }
);

export default router; // for tests
