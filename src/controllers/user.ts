import { Request, Response, NextFunction } from "express";
import { User } from "../models/user.js";
import { NewUserRequestBody } from "../types/types.js";
import { TryCatch } from "../middlewares/error.js";

export const newUser = TryCatch(
  async(
    req: Request<{}, {}, NewUserRequestBody>, 
    res: Response, 
    next: NextFunction
  ) => {
    const {name, email, photo, _id, gender, dob} = req.body;
    const user = await User.create({
        name, 
        email, 
        photo, 
        _id, 
        gender, 
        dob: new Date(dob)
    });

    return  res.status(201).json({
        success: true,
        message: `Welcome ${user.name}!`,
    });

});
