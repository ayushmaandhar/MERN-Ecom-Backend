import express, { NextFunction } from "express";
import { connectDB } from "./utils/features.js";
import { errorMiddleware } from "./middlewares/error.js";
import NodeCache from "node-cache";
import {config} from "dotenv";
import morgan from "morgan";
import Stripe from "stripe";
import cors from "cors";



// Importing Routes
import userRoute from './routes/user.js';
import productRoute from './routes/product.js';
import orderRoute from './routes/orders.js';
import paymentRoute from './routes/payment.js';
import dashboardRoute from './routes/stats.js';



// setting the path to env file
config({
    path: "./.env" 
})

const port = process.env.PORT ?? 4000; 
const mongo_uri = process.env.MONGO_URI ?? "";
const stripe_key = process.env.STRIPE_KEY ?? "";
const serverDomain = process.env.SERVER_DOMAIN ?? "";

// establishing DB connection
connectDB(mongo_uri);

// Stripe Payment Gateway initialization
export const stripe = new Stripe(stripe_key);

// initializing caching
export const myCache = new NodeCache();

const app = express();
app.use(express.json());
app.use(morgan("dev")); // for dev use: to identify request types in terminal
app.use(cors()); // for CORS 

// general
app.get("/", (req, res) => {
    res.send("API working on '/api/v1'");
})

// Using Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/payment", paymentRoute); 
app.use("/api/v1/dashboard", dashboardRoute)


// static folder declaration
app.use("/uploads", express.static("uploads"));

// middleware for custom error
app.use(errorMiddleware);

app.listen(port, ()=>{
    console.log(`Server is running on ${serverDomain}`);
});