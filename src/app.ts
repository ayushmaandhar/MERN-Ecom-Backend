import express, { NextFunction } from "express";
import { connectDB } from "./utils/features.js";
import { errorMiddleware } from "./middlewares/error.js";

// Importing Routes
import userRoute from './routes/user.js';
import productRoute from './routes/product.js';


const port = 4000;
connectDB();

const app = express();
app.use(express.json());

// general
app.get("/", (req, res) => {
    res.send("API working on '/api/v1'");
})

// Using Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);


// static folder declaration
app.use("/uploads", express.static("uploads"));

// middleware for custom error
app.use(errorMiddleware);

app.listen(port, ()=>{
    console.log(`Server is running on http://localhost:${port}`);
});