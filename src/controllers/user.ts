import { Request, Response, NextFunction } from "express";
import { User } from "../models/user.js";
import { ControllerType, NewUserRequestBody } from "../types/types.js";
import { TryCatch } from "../middlewares/error.js";
import ErrorHandler from "../utils/utility-class.js";

export const newUser: ControllerType = TryCatch(
  async(
    req: Request<{}, {}, NewUserRequestBody>, 
    res: Response, 
    next: NextFunction
  ): Promise<Response<any, Record<string, any>> | void> => {

    const {name, email, photo, _id, gender, dob} = req.body;

    let user = await User.findById(_id);

    if (user) return res.status(200).json({
        success: true,
        message: `Welcome, ${user.name}`
    });

    if (!_id || !name || !email || !photo || !gender || !dob)
        return next( new ErrorHandler("Please Enter All Fields", 400));

    user = await User.create({
        name, 
        email, 
        photo, 
        _id, 
        gender, 
        dob: new Date(dob)
    });

    return  res.status(201).json({
        success: true,
        message: `user ${user.name} created!`,
    });

});

export const getAllUsers = TryCatch( async(req, res, next) => {
    const users = await User.find({});
    return res.status(201).json({
        success: true,
        users
    });
});

export const getUser = TryCatch( async(req: Request, res, next) => {
    const id = req.params.id;
    const user = await User.findById(id);

    if (!user) return next( new ErrorHandler("Invalid Id", 400));
    
    return res.status(200).json({
        success: true,
        user
    });
});

export const deleteUser = TryCatch( async(req: Request, res, next) => {
    const id = req.params.id;
    const user = await User.findById(id);

    if (!user) return next( new ErrorHandler("Invalid Id", 400));

    await user.deleteOne();
    
    return res.status(200).json({
        success: true,
        message: "User Deleted Successfully"
    });
});
