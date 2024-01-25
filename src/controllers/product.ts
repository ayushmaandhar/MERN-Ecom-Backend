import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middlewares/error.js";
import { BaseQuery, NewProductRequestBody, SearchRequestQuery } from "../types/types.js";
import { Product } from "../models/product.js";
import {rm} from 'fs';
// import {faker} from '@faker-js/faker';
import ErrorHandler from "../utils/utility-class.js";
import { myCache } from "../app.js";
import { invalidateCache } from "../utils/features.js";


// revalidate cache on - New Prod, Update Prod, Delete Prod, New Order
export const getLatestProducts = TryCatch( 
    async(req: Request, res: Response, next: NextFunction) => {

        let products = [];
        if(myCache.has("latest-products")) 
            products = JSON.parse(myCache.get("latest-products")!);

        else {
            products = await Product.find().sort({createdAt: -1}).limit(5);
            myCache.set("latest-products", JSON.stringify(products));
        }
        
    
    return res.status(200).json({
        success: true,
        products
    })
});

// revalidate cache on - New Prod, Update Prod, Delete Prod, New Order
export const getAllCategories = TryCatch( 
    async(req: Request, res: Response, next: NextFunction) => {

        let categories;

        if (myCache.has("categories"))
            categories = JSON.parse(myCache.get("categories")!);

        else {
            categories = await Product.distinct("category");
            myCache.set("categories", JSON.stringify(categories));
        }
         
    return res.status(200).json({
        success: true,
        categories
    })
});

// revalidate cache on - New Prod, Update Prod, Delete Prod, New Order
export const getAdminProducts  = TryCatch( 
    async(req: Request, res: Response, next: NextFunction) => {

        let products;

        if (myCache.has("all-products")) 
            products = JSON.parse(myCache.get("all-products")!);

        else {
            products = await Product.find();
            myCache.set("all-products", JSON.stringify(products))
        }
    
    return res.status(200).json({
        success: true,
        products
    })
});

// revalidate cache on - New Prod, Update Prod, Delete Prod, New Order
export const getSingleProduct  = TryCatch( 
    async(req: Request, res: Response, next: NextFunction) => {
        
        let product;
        const id = req.params.id;

        if (myCache.has(`product-${id}`))
            product = JSON.parse(myCache.get(`product-${id}`)!);

        else {
            product = await Product.findById(id);
            if(!product) return next( new ErrorHandler("Product Not Found", 404));
            myCache.set(`product-${id}`, JSON.stringify(product));
        }

    return res.status(200).json({
        success: true,
        product
    })
});


export const newProduct = TryCatch( 
    async(req: Request<{}, {}, NewProductRequestBody>, res: Response, next: NextFunction) => {
        const { name, price, stock, category } = req.body;
        const photo = req.file;

        if (!photo) return next( new ErrorHandler("Please Add a Photo", 400));

        if (!name || !price || !stock || !category) {
            rm(photo.path, () => console.log("Deleted"));
            return next( new ErrorHandler("Please Enter All Fields", 400));
        }
            
        await Product.create({
            name,
            price,
            stock,
            category: category.toLowerCase(),
            photo: photo.path,
        });

        await invalidateCache({ product: true });

        return res.status(201).json({
            success: true,
            message: "Product Created Successfully",
        })
});


export const updateProduct = TryCatch( 
    async(req: Request, res: Response, next: NextFunction) => {

        const { id } = req.params;
        const { name, price, stock, category } = req.body;
        const photo = req.file;
        const product = await Product.findById(id);

        if(!product) return next( new ErrorHandler("Product Not Found", 404));

        if (photo) {
            rm(product.photo, () => console.log("Old photo Deleted"));
            product.photo = photo.path;
        }
            
        if (name) product.name = name;
        if (price) product.price = price;
        if (stock) product.stock = stock;
        if (category) product.category = category;

        await product.save();

        await invalidateCache({ product: true });

        return res.status(200).json({
            success: true,
            message: "Product Updated Successfully",
        })
});


export const deleteProduct  = TryCatch( 
    async(req: Request, res: Response, next: NextFunction) => {
        
        const product = await Product.findById(req.params.id);
        if(!product) return next( new ErrorHandler("Product Not Found", 404));

        rm(product.photo, () => console.log("Product Photo Deleted"));

        await Product.deleteOne();
        
        await invalidateCache({ product: true });
    
    return res.status(200).json({
        success: true,
        message: "Product Deleted Successfully"
    })
});


export const getAllProducts = TryCatch( 
    async(req: Request<{}, {}, SearchRequestQuery>, res: Response, next: NextFunction) => {
        
        const {search, sort, category, price} = req.query;
        const page = Number(req.query.page) || 1;
        const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
        const skip = (page - 1) * limit; 

        const baseQuery: BaseQuery = {};

        if (search) 
            baseQuery.name = {
                $regex: String(search),
                $options: "i"
            };

        if (price) 
            baseQuery.price = {
                    $lte: Number(price)
            };
        
        if (category) baseQuery.category =  String(category);

        const productsPromise = Product.find(baseQuery)
            .sort( sort && { price: sort === "asc" ? 1 : -1 })
            .limit(limit)
            .skip(skip);

        const [products, filteredOnlyProducts] = await Promise.all([
            productsPromise,
            Product.find(baseQuery)
        ]);

        const totalPages = Math.ceil(filteredOnlyProducts.length / limit);
    
    return res.status(200).json({
        success: true,
        products,
        totalPages
    })
});



// const generateRandomProducts = async (count: number) => {
//     const products = [];

//     for (let i=0; i < count; i++) {
//         const product = {
//             name: faker.commerce.productName(),
//             photo: "uploads/28a7e286-94d3-4c3a-b423-a063325a8955.jpg",
//             price: faker.commerce.price({ min: 1500, max: 90000, dec: 0 }),
//             stock: faker.commerce.price({ min: 1500, max: 90000, dec: 0 }),
//             category: faker.commerce.department(),
//             createdAt: new Date(faker.date.past()),
//             updatedAt: new Date(faker.date.recent()),
//             __v:0
//         };
//         products.push(product);
//     }

//     await Product.create(products);
//     console.log({success: true, message: "Products created"})
// }

// //generateRandomProducts(40);


// const deleteRandomProduct = async (count: number) => {
//     const products = await Product.find({}).skip(2);

//     for (let i=0; i<count; i++) {
//         const product = products[i];
//         await product.deleteOne();
//     }

//     console.log("Products Deleted");
// }

// //deleteRandomProduct(38);