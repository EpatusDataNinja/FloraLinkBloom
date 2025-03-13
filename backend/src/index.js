import dotenv from "dotenv";
import app from "./app.js";
import reportsRouter from './routers/reportsRouter.js';

dotenv.config();
const PORT = process.env.PORT || 5000;

app.use('/api/v1/reports', reportsRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
