import express from "express";
import { adminOnly } from "../middlewares/auth.js";
import { getBarCharts, getDashboardStats, getLineCharts, getPieCharts } from "../controllers/stats.js";
const app = express.Router();
//////////////////// parent route: http://localhost:4000/api/v1/dashboard
app.get("/stats", adminOnly, getDashboardStats);
app.get("/pie", adminOnly, getPieCharts);
app.get("/bar", adminOnly, getBarCharts);
app.get("/line", adminOnly, getLineCharts);
export default app;
