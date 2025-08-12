import logger from "./utils/logger.js";
import morgan from "morgan";
import express from "express";
import 'dotenv/config';
import cors from "cors";
import cookieParser from "cookie-parser";
// Import Routes
import healthcheckRoutes from "./routes/healthcheck.routes.js";
import userRoutes from "./routes/user.routes.js";
import errorHandler from "./middlewares/error.middlewares.js";

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Logging
const morganFormat = ":method :url :status :response-time ms";

app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };  
        logger.info(JSON.stringify(logObject));
      },
    },
  })
);


// Routes
app.use("/api/v1/healthcheck", healthcheckRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/tweets", tweetRoutes);

// Error Handler
app.use(errorHandler);



export {app};