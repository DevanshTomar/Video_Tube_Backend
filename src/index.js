import {app} from "./app.js";
import 'dotenv/config';
import logger from "./utils/logger.js";
import connectDB from "./db/index.js";

const PORT = process.env.PORT || 8000;

connectDB()
.then(() => {
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
})
.catch((err) => {
  logger.error("Error connecting to the database", err);
});
