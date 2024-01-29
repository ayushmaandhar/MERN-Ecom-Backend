import express from "express";
import {adminOnly} from "../middlewares/auth.js";
import { allCoupons, applyDiscount, createPaymentIntent, deleteCoupon, newCoupon } from "../controllers/payment.js";

const app = express.Router();
//////////////////// parent route: http://localhost:4000/api/v1/payment

// Stripe
app.post("/create", createPaymentIntent);

// Coupon 
app.post("/coupon/new", adminOnly, newCoupon);
app.get("/coupon/all", adminOnly, allCoupons);
app.delete("/coupon/:id", adminOnly, deleteCoupon);

// discount  
app.get("/discount", applyDiscount);

export default app;

