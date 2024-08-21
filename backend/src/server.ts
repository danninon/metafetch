import express from "express";
import cors from "cors";
import metadataRoutes from "./routes/metadata";
import helmet from "helmet";

const app = express();
const PORT = process.env.PORT || 3000;

// Set up rate limiting: maximum 5 requests per second
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/fetch-metadata", metadataRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});