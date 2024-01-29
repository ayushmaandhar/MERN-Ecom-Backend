import { Request, Response, NextFunction } from "express";


export interface NewUserRequestBody {
    name: string,
    email: string,
    photo: string,
    gender: string,
    _id: string,
    dob: Date
}

export interface NewProductRequestBody {
    name: string,
    price: number,
    stock: number,
    category: string,
    //photo: string,
    _id: string,
}

export type ControllerType = (
    req: Request<any, {}, any>, 
    res: Response, 
    next: NextFunction
) => Promise<Response<any, Record<string, any>>| void> ;


export type SearchRequestQuery = {
    search?: string,
    price?: string,
    category?: string,
    sort?: string,
    page?: string
}


export interface BaseQuery {
    name?: {
        $regex: string,
        $options: string
    },
    price?: {
        $lte: number
    },
    category?: string
}


export type InvalidateCacheProps = {
     product?: boolean,
     order?: boolean,
     admin?: boolean,
     userId?: string,
     orderId?: string,
     productId?: string | string[],
}
    

export type orderItemsType = {
    name: string,
    photo: string,
    price: number,
    quantity: number,
    productId: string,
}

export type shoppingInfoType = {
    address: string,
    city: string,
    state: string,
    country: string,
    pinCode: number,
}

export interface NewOrderRequestBody {
    shippingInfo: shoppingInfoType,
    user: string,
    subTotal: number,
    tax: number,
    shippingCharges: number,
    discount: number,
    total: number,
    orderItems: orderItemsType[]
}