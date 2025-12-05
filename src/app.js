import "dotenv/config";
import express, { json, urlencoded } from "express";
import { createServer } from "http";
import cors from "cors";
import routes from "./routes/route.js";
import { error, notFound } from "./middleware/middleware.js";
const app = express();

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

app.use(json({ limit: "10mb" }));
app.use(urlencoded({ limit: "10mb", extended: true }));

app.use("/", routes);
app.use(notFound);
app.use(error);

const PORT = process.env.PORT || 3000;
const server = createServer(app);

server.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;