import express from "express";
import { adminOnly } from "../middlewares/auth.js";
import { deleteProduct, getAdminProducts, getAllCategories, getAllProducts, getLatestProducts, getSingleProduct, newProduct, updateProduct } from "../controllers/product.js";
import { singleUpload } from "../middlewares/multer.js";
const app = express.Router();
//////////////////// parent route: http://localhost:4000/api/v2/product
//// admin Specific requests
app.post("/new", adminOnly, singleUpload, newProduct);
app.get("/admin-products", adminOnly, getAdminProducts);
// General GET requests
app.get("/latest", getLatestProducts);
app.get("/categories", getAllCategories);
app.get("/all", getAllProducts); // search with filters
// ProductId routes
app.route("/:id")
    .get(getSingleProduct)
    .put(adminOnly, singleUpload, updateProduct)
    .delete(adminOnly, deleteProduct);
export default app;
