import express, { NextFunction } from "express";
import { connectDB } from "./utils/features.js";
import { errorMiddleware } from "./middlewares/error.js";
import NodeCache from "node-cache";
import {config} from "dotenv";

// Importing Routes
import userRoute from './routes/user.js';
import productRoute from './routes/product.js';
import orderRoute from './routes/orders.js';
import morgan from "morgan";


// setting the path to env file
config({
    path: "./.env" 
})

const port = process.env.PORT ?? 4000; 
const mongo_uri = process.env.MONGO_URI ?? "";

connectDB(mongo_uri);

// initializing caching
export const myCache = new NodeCache();

const app = express();
app.use(express.json());
app.use(morgan("dev")); // for dev use: to identify request types in terminal

// general
app.get("/", (req, res) => {
    res.send("API working on '/api/v1'");
})

// Using Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/order", orderRoute);



// static folder declaration
app.use("/uploads", express.static("uploads"));

// middleware for custom error
app.use(errorMiddleware);

app.listen(port, ()=>{
    console.log(`Server is running on http://localhost:${port}`);
});