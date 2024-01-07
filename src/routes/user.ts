import express from "express";
import { deleteUser, getAllUsers, getUser, newUser } from "../controllers/user.js";


const app = express.Router();


////////////////////// route: 'http://localhost:4000/api/v1/user'

// Post
app.post("/new", newUser);

// Get
app.get("/all", getAllUsers);

// 'http://localhost:4000/api/v1/user/:id'
app.route("/:id")
.get(getUser)
.delete(deleteUser);

export default app;