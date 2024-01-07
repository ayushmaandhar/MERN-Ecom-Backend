import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/utility-class.js";


export interface NewUserRequestBody {
    name: string,
    email: string,
    photo: string,
    gender: string,
    _id: string,
    dob: Date
}

export type ControllerType = (
    req: Request<{}, {}, NewUserRequestBody>, 
    res: Response, 
    next: NextFunction
) => Promise<Response<any, Record<string, any>>| void> ;
    