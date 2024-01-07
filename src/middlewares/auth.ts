import { NextFunction, Request, Response } from "express";
import { TryCatch } from "./error.js";
import ErrorHandler from "../utils/utility-class.js";
import { User } from "../models/user.js";


// Middleware to makesure only admin is allowed
export const adminOnly = TryCatch(async (req: Request, res: Response, next: NextFunction) => {

    const {id} = req.query;

    if (!id) return next( new ErrorHandler("User not Logged In", 401 ));

    const user = await User.findById(id);
    if (!user) return next(new ErrorHandler("ID is incorrect", 401));

    if (user.role !== 'admin')
        return next(new ErrorHandler("You can't access this route!", 403));

    next();

});