import {Router} from "express";

// const metadataRateLimiter = createRateLimiter(5, 60 * 1000);
const router = Router();

router.post(
    "/",
    async function (
        req,
        res
    ){
        res.status(200).send("Request successful");
})

export default router; //for tests