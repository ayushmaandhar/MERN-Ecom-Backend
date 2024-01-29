import express from "express";
import { adminOnly } from "../middlewares/auth.js";
import { allOrders, deleteOrder, getSingleOrder, myOrders, newOrder, processOrder } from "../controllers/order.js";


const app = express.Router();
//////////////////// parent route: http://localhost:4000/api/v2/order

// Post
app.post("/new", newOrder);

app.get("/my", myOrders);

app.get("/all", adminOnly, allOrders);

app.route("/:id")
.get(getSingleOrder)
.put(adminOnly, processOrder)
.delete(adminOnly, deleteOrder);


export default app;