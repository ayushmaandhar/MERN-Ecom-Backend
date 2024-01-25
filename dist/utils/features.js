import mongoose from "mongoose";
import { myCache } from "../app.js";
export const connectDB = () => {
    mongoose.connect("mongodb://localhost:27017", {
        dbName: "Ecom-Jan-23"
    }).then((c) => {
        console.log(`DB connected to ${c.connection.host}`);
    }).catch((e) => {
        console.log(e);
    });
};
export const invalidateCache = ({ product, order, admin }) => {
    if (product) {
        const product = [];
        myCache.del();
    }
    if (order) {
    }
    if (admin) {
    }
};
