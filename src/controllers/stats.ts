import { myCache } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Order } from "../models/order.js";
import { Product } from "../models/product.js";
import { User } from "../models/user.js";
import { MyDoc, calculatePercentage, getChartData, getInventories } from "../utils/features.js";

export const getDashboardStats = TryCatch( async(req, res, next) => {

    let stats = {};

    if (myCache.has("admin-stats")) {
        stats = JSON.parse(myCache.get("admin-stats") as string);
    }

    else {
        const today = new Date();
        
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const thisMonth = {
            start: new Date(today.getFullYear(), today.getMonth(), 1),
            end: today
        }

        const lastMonth = {
            start: new Date(today.getFullYear(), today.getMonth()-1, 1),
            end: new Date(today.getFullYear(), today.getMonth(), 0)
        }

        const thisMonthProductsPromise = Product.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end
            }
        });

        const lastMonthProductsPromise = Product.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        });

        const thisMonthUsersPromise = User.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end
            }
        });

        const lastMonthUsersPromise = User.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        });


        const thisMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end
            }
        });

        const lastMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        });

        const lastSixMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: sixMonthsAgo,
                $lte: today
            }
        });

        const latestTransactionsPromise = Order.find({})
        .select(["orderItems", "discount", "total", "status"]).limit(4);

        const [
            thisMonthProducts,
            lastMonthProducts,
            thisMonthUsers,
            lastMonthUsers,
            thisMonthOrders,
            lastMonthOrders,
            productsCount,
            usersCount,
            allOrders,
            lastSixMonthOrders,
            categories,
            femaleUsersCount,
            latestTransactions,

        ] = await Promise.all([
            thisMonthProductsPromise,
            lastMonthProductsPromise,
            thisMonthUsersPromise,
            lastMonthUsersPromise,
            thisMonthOrdersPromise,
            lastMonthOrdersPromise,
            Product.countDocuments(),
            User.countDocuments(),
            Order.find({}).select("total"),
            lastSixMonthOrdersPromise,
            Product.distinct("category"),
            User.countDocuments({gender: "female"}),
            latestTransactionsPromise
        ]);

        const thisMonthRevenue = thisMonthOrders.reduce(
            (total, order) => total + (order.total || 0), 0
        );

        const lastMonthRevenue = lastMonthOrders.reduce(
            (total, order) => total + (order.total || 0), 0
        );


        const percentChange = {
            revenue: calculatePercentage(thisMonthRevenue, lastMonthRevenue), 
            product: calculatePercentage(thisMonthProducts.length, lastMonthProducts.length),
            user: calculatePercentage(thisMonthUsers.length, lastMonthUsers.length),
            order: calculatePercentage(thisMonthOrders.length, lastMonthOrders.length)
        }

        const revenue = allOrders.reduce(
            (total, order) => total + (order.total || 0), 0
        );

        const count = {
            revenue: revenue,
            product: productsCount,
            user: usersCount,
            order: allOrders.length
        }

        const orderMonthCounts = new Array(6).fill(0);
        const orderMonthlyRevenue = new Array(6).fill(0);
        // BELOW CAN ALSO BE DONE USING    getCharts() from features.js
        lastSixMonthOrders.forEach((order) => {
            const creationDate = order.createdAt;
            const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;

            if (monthDiff < 6) {
                orderMonthCounts[6-monthDiff-1] += 1;
                orderMonthlyRevenue[6-monthDiff-1] += order.total;
            }
        });

       
        const categoryCount = await getInventories({categories, productsCount});

        const userRatio = {
            male: usersCount - Number(femaleUsersCount),
            female: Number(femaleUsersCount)
        }

        const modifiedLatestTransaction = latestTransactions.map(i => (
            {
                _id: i._id,
                discount: i.discount,
                amount: i.total,
                quantity: i.orderItems.length,
                status: i.status,
            }
        )) 

        stats = {
            percentChange,
            count,
            chart: {
                order: orderMonthCounts,
                revenue: orderMonthlyRevenue
            },
            categoryCount,
            userRatio,
            latestTransactions: modifiedLatestTransaction
        }

        myCache.set("admin-stats", JSON.stringify(stats));
    }

    return res.status(200).json({
        success: true,
        stats
    })
});


export const getPieCharts = TryCatch( async(req, res, next) => {

    let charts;

    if (myCache.has("admin-pie-charts")) {
        charts = JSON.parse(myCache.get("admin-pie-charts") as string);
    }

    else {
        const [
            processingOrder,
            shippingOrder,
            deliveredOrder,
            categories,
            productsCount,
            productsOutOfStock,
            allOrders,
            allUsers,
            customerUsers,
            adminUsers

        ] = await Promise.all([
            Order.countDocuments({status: "Processing"}),
            Order.countDocuments({status: "Shipping"}),
            Order.countDocuments({status: "Delivered"}),
            Product.distinct("category"),
            Product.countDocuments(),
            Product.countDocuments({stock: 0}),
            Order.find({}).select(["total", "discount", "subtotal", "tax", "shippingCharges",]),
            User.find({}).select(["dob"]),
            User.countDocuments({role: "user"}),
            User.countDocuments({role: "admin"}),
 
        ]);

        const orderFullfillment = {
            processing: processingOrder,
            shipping: shippingOrder,
            delivered: deliveredOrder
        };

        const productCategories = await getInventories({categories, productsCount});

        const stockAvailability = {
            outOfStock: productsOutOfStock,
            inStock: productsCount - productsOutOfStock 
        }

        const grossIncome = allOrders.reduce(
            (prev, order) => prev + (order.total || 0), 0 
        );

        const discount = allOrders.reduce(
            (prev, order) => prev + (order.discount || 0), 0 
        );

        const productionCost = allOrders.reduce(
            (prev, order) => prev + (order.shippingCharges || 0), 0 
        );

        const burnt = allOrders.reduce(
            (prev, order) => prev + (order.tax || 0), 0 
        );

        const marketingCost = Math.round(grossIncome * (30/100));

        const netMargin = grossIncome - discount - productionCost - burnt - marketingCost;

        const revenueDistribution = {
            netMargin,
            discount,
            productionCost,
            burnt,
            marketingCost
        };

        const usersAgeGroup = {
            teen: allUsers.filter(i => i.age < 20).length,
            adult: allUsers.filter(i => i.age >= 20 && i.age < 40).length,
            old: allUsers.filter(i => i.age >= 40).length
        };

        const adminCustomer = {
            admin: adminUsers,
            customer: customerUsers
        };

        charts = {
            orderFullfillment,
            productCategories,
            stockAvailability,
            revenueDistribution,
            usersAgeGroup,
            adminCustomer
        };

        myCache.set("admin-pie-charts", JSON.stringify(charts));
    }

    return res.status(200).json({
        success: true,
        charts
    });

});


export const getBarCharts = TryCatch( async(req, res, next) => {
    let charts;
    const key = "admin-bar-charts";

    if (myCache.has(key)) charts = JSON.parse(myCache.get(key) as string);

    else {

        const today = new Date();

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth()-6);

        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth()-12);

       
        const sixMonthProductsPromise = Product.find({
            createdAt: {
                $gte: sixMonthsAgo,
                $lte: today
            }
        }).select("createdAt");

        const sixMonthUsersPromise = User.find({
            createdAt: {
                $gte: sixMonthsAgo,
                $lte: today
            }
        }).select("createdAt");

        const twelveMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: twelveMonthsAgo,
                $lte: today
            }
        }).select("createdAt");

        const [
            sixMonthProducts,
            sixMonthUsers,
            twelveMonthOrders,

        ] = await Promise.all([
            sixMonthProductsPromise,
            sixMonthUsersPromise,
            twelveMonthOrdersPromise
        ]);


        const productsCountsPromise = getChartData({length: 6, today, docArr: sixMonthProducts});
        const usersCountsPromise = getChartData({length: 6, today, docArr: sixMonthUsers});
        const ordersCountsPromise = getChartData({length: 12, today, docArr: twelveMonthOrders});

        const [productsCounts, usersCounts, ordersCounts] = await Promise.all([
            productsCountsPromise,
            usersCountsPromise,
            ordersCountsPromise
        ]);

        charts = {
            users: usersCounts,
            products: productsCounts,
            orders: ordersCounts
        };

        myCache.set(key, JSON.stringify(charts));
    }

    return res.status(200).json({
        success: true,
        charts
    });


});


export const getLineCharts = TryCatch( async(req, res, next) => {
    let charts;
    const key = "admin-line-charts";

    if (myCache.has(key)) charts = JSON.parse(myCache.get(key) as string);

    else {

        const today = new Date();

        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth()-12);

        const baseQuery = {
            createdAt: {
                $gte: twelveMonthsAgo,
                $lte: today
            }
        }

        const [
            twelveMonthProducts,
            twelveMonthUsers,
            twelveMonthOrders,

        ] = await Promise.all([
            Product.find(baseQuery).select("createdAt"),
            User.find(baseQuery).select("createdAt"),
            Order.find(baseQuery).select(["createdAt", "discount", "total"])
        ]);


        const productsCounts = getChartData({length: 12, today, docArr: twelveMonthProducts});
        const usersCounts = getChartData({length: 12, today, docArr: twelveMonthUsers});
        const discount = getChartData({length: 12, today, docArr: twelveMonthOrders, property: "discount"});
        const revenue = getChartData({length: 12, today, docArr: twelveMonthOrders, property: "total"});


        charts = {
            users: usersCounts,
            products: productsCounts,
            discount,
            revenue
        };

        myCache.set(key, JSON.stringify(charts));
    }

    return res.status(200).json({
        success: true,
        charts
    });


});