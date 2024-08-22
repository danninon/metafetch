import express from "express";
import cors from "cors";
import metadataRoutes from "./routes/metadata";
import healthRoute from "./routes/health"; // Import the health route module
import helmet from "helmet";
import {createRateLimiter} from "./utils/rate-limiter";

const app = express();
const PORT = process.env.PORT || 3000;

// Set up rate limiting: maximum 5 requests per second
 app.use(helmet());

// app.use(cors({
//     origin: 'http://localhost:3001'
// }));
app.use(cors());

app.use(express.json());

app.use('/health', healthRoute); // Mount the health route
app.use("/fetch-metadata", metadataRoutes);

if (process.env.NODE_ENV !== 'test') {
    const rateLimiter = createRateLimiter(5, 60*1000);
    app.use(rateLimiter)

    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}



export default app;