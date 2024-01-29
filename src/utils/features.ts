import mongoose, { Document, ObjectId } from "mongoose";
import { InvalidateCacheProps, orderItemsType } from "../types/types.js";
import { myCache } from "../app.js";
import { Product } from "../models/product.js";
import { Order } from "../models/order.js";

export const connectDB = (uri: string) => {
    mongoose.connect(uri, {
        dbName: "Ecom-Jan-23"
    }).then((c) => {
        console.log(`DB connected to ${c.connection.host}`)
    }).catch((e) => {
        console.log(e)
    });
}


export const invalidateCache = async({
    product, order, admin, userId, orderId, productId 
}: InvalidateCacheProps) => {

     if (product) {
        const productKeys: string[] = [
            "latest-products",
            "categories",
            "all-products",
            `product-${productId}`
        ];

        if ( typeof productId === "string" ) 
            productKeys.push(`product-${productId}`);
        if ( typeof productId === "object" ) 
            productId.forEach((i) => productKeys.push(`product-${i}`));
        

        myCache.del(productKeys)
     }

     if (order) {
        const orderKeys: string[] = [
            "all-orders", 
            `my-orders-${userId}`, 
            `order-${orderId}`
        ];
        
        myCache.del(orderKeys); 
     }

     if (admin) {
        console.log("")
     }
};


export const reduceStock = async(orderItems: orderItemsType[]) => {
    
    for (let i=0; i < orderItems.length; i++) {
        const order = orderItems[i];
        const product = await Product.findById(order.productId);
        if (!product) throw new Error("Product Not Found!");
        product.stock -= order.quantity;
        await product.save();
    }
};

export const calculatePercentage = (thisMonth: number, lastMonth: number) => {
    if (lastMonth === 0) return Number(thisMonth*100);
    const percent = (thisMonth/ lastMonth) * 100;
    return Number(percent.toFixed(0));
};

export const getInventories = async( {categories, productsCount} : {
    categories: string[], 
    productsCount: number
}) => {
    const categoriesCountPromise = categories.map((category) => Product.countDocuments({category}));
    const categoriesCount = await Promise.all(categoriesCountPromise);
    const categoryCount: Record<string, number>[] = [];

    categories.forEach((category, i) => {
        categoryCount.push({
            [category]: Math.round((categoriesCount[i] / productsCount) * 100)
        });
    });

    return categoryCount;
};

export interface MyDoc extends Document{
    createdAt: Date,
}

type chartDataProps = {
    length: number,
    docArr: MyDoc[],
    today: Date
} 

export const getChartData = async( {length, docArr, today}: chartDataProps) => {
    const data: number[] = new Array(length).fill(0);

    docArr.forEach((doc) => {
        const creationDate = doc.createdAt;
        const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;

        if (monthDiff < length) {
            data[length-monthDiff-1] += 1;
        }
    });
    console.log(data)
    return data;
}