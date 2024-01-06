import express, { NextFunction } from "express";

// Importing Routes
import userRoute from './routes/user.js'
import { connectDB } from "./utils/features.js";
import { errorMiddleware } from "./middlewares/error.js";


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

// middleware for custom error
app.use(errorMiddleware);

app.listen(port, ()=>{
    console.log(`Server is running on http://localhost:${port}`);
});