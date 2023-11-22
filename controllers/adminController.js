const User = require("../models/userModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const asyncHandler = require("express-async-handler");
const moment = require("moment");
const PDFDocument = require("pdfkit");

//----load admin login page

const adminLogin = asyncHandler(async (req, res) => {
    try {
        res.render("adminLogin", { errorMessage: "" });
    } catch (error) {
        console.error(error);
        res.render("error", { errorMessage: "Something went wrong" });
    }
});

//admin dashboard

const adminDashboard = asyncHandler(async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ is_admin: { $ne: true } });
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();

        const deliveredProducts = await Order.aggregate([
            { $match: { orderStatus: "Delivered", "products.productStatus": "Delivered" } },
            { $sort: { date: -1 } },
        ]);
        console.log("delivered Products", deliveredProducts);
        let totalAmount = 0;
        deliveredProducts.forEach((product) => {
            totalAmount += product.actualTotalAmount;
        });

        const totalDelivered = await Order.countDocuments({ "products.productStatus": "Delivered" });
        const totalOrderPlaced = await Order.countDocuments({ orderStatus: "Order Placed" });
        const totalOrderCancelled = await Order.countDocuments({ orderStatus: "Order Cancelled" });
        const totalPending = await Order.countDocuments({ orderStatus: "Pending" });
        // console.log('cancel:',totalOrderCancelled);

        // Sending the product Details
        const products = await Product.find().populate("category");
        const productsCount = products.length;
        let category = new Set(products.map((product) => product.category.categoryName));
        const categoryCount = Array.from(category).length;

        // Find how many items sell in each products========

        function categoryCounter(products) {
            const categoryCounts = {};

            products.forEach((product) => {
                const categoryName = product.category.name;
                if (categoryCounts[categoryName]) {
                    categoryCounts[categoryName]++;
                } else {
                    categoryCounts[categoryName] = 1;
                }
            });
            return categoryCounts;
        }

        const cCount = categoryCounter(products);
        console.log(cCount);

        res.render("admin-Dashboard", {
            totalUsers,
            totalProducts,
            totalOrders,
            totalAmount,
            delivered: totalDelivered,
            orderPlaced: totalOrderPlaced,
            pending: totalPending,
            orderCancelled: totalOrderCancelled,
            cCount,
        });
    } catch (error) {
        console.error(error);
        res.render("error", { errorMessage: "Something went wrong" });
    }
});

//admin login vrification with data---------------------------------------------------
const adminVerifyLogin = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;
        const totalUsers = await User.countDocuments({ is_admin: { $ne: true } });
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalAmountOfDeliveredProducts = await Order.aggregate([
            {
                $unwind: "$products",
            },
            {
                $match: {
                    "products.productStatus": "Delivered",
                },
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$products.total" },
                },
            },
        ]);
        let totalAmount = 0;
        if (totalAmountOfDeliveredProducts.length > 0) {
            totalAmount = totalAmountOfDeliveredProducts[0].totalAmount;
        }
        const findAdmin = await User.findOne({ email: email, is_admin: true });
        const totalDelivered = await Order.countDocuments({ "products.productStatus": "Delivered" });
        const totalOrderPlaced = await Order.countDocuments({ orderStatus: "Order Placed" });
        const totalOrderCancelled = await Order.countDocuments({ orderStatus: "Order Cancelled" });
        const totalPending = await Order.countDocuments({ orderStatus: "Pending" });
        // console.log('cancel:',totalOrderCancelled);

        // Sending the product Details
        const products = await Product.find().populate("category");
        const productsCount = products.length;
        let category = new Set(products.map((product) => product.category.categoryName));
        const categoryCount = Array.from(category).length;

        // Find how many items sell in each products========

        function categoryCounter(products) {
            const categoryCounts = {};

            products.forEach((product) => {
                const categoryName = product.category.name;
                if (categoryCounts[categoryName]) {
                    categoryCounts[categoryName]++;
                } else {
                    categoryCounts[categoryName] = 1;
                }
            });
            return categoryCounts;
        }

        const cCount = categoryCounter(products);

        if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
            req.session.admin = findAdmin._id
            res.render("admin-Dashboard", {
                totalUsers,
                totalProducts,
                totalOrders,
                totalAmount,
                delivered: totalDelivered,
                orderPlaced: totalOrderPlaced,
                pending: totalPending,
                orderCancelled: totalOrderCancelled,
                cCount,
            });
        } else {
            res.render("adminLogin", { errorMessage: "Invalid admin id and password" });
        }
    } catch (error) {
        console.error(error);
        res.render("error", { errorMessage: "Something went wrong" });
    }
});
//-----------------------------------------------------------------

//block the user --------------------------
const blockUser = asyncHandler(async (req, res) => {
    try {
        const id = req.query.id;
        console.log(id, "user id in bloked user");

        const blokedUser = await User.findByIdAndUpdate(id, { isBlocked: true }, { new: true });

        if (blokedUser) {
            // req.session.userBloked = true;
            // req.session.isBlocked = true;

            res.redirect("/admin/usermanagement");
        }
    } catch (error) {
        console.log("Error happens in admin controller at blokeUser function", error);
    }
});

//unbloking a user ---------------------------------------
const unBlockUser = asyncHandler(async (req, res) => {
    try {
        const id = req.query.id;
        console.log(id, "user id in unbloked user");

        const unBlokedUser = await User.findByIdAndUpdate(
            id,
            {
                isBlocked: false,
            },
            { new: true }
        );

        if (unBlokedUser) {
            req.session.userBloked = false;
            req.session.blockedMessage = "User is unblocked by admin.";
            console.log("User is unblocked by admin", unBlokedUser);
            res.redirect("/admin/usermanagement");
        }
    } catch (error) {
        console.log("Error happens in admin controller at unBlokeUser function", error);
    }
});

const userManagement = asyncHandler(async (req, res) => {
    try {
        let users = [];
        const filter = req.query.filtervalue;
        const name = req.query.searchuser;
        const page = parseInt(req.query.page) || 1;
        const perPage = 4;

        let query = { is_admin: { $ne: true } };

        if (name) {
            query.username = { $regex: ".*" + name + ".*", $options: "i" };
        } else if (filter === "active") {
            query.isActive = true;
        }

        const totalUsers = await User.countDocuments(query);
        const totalPages = Math.ceil(totalUsers / perPage);

        users = await User.find(query)
            .skip((page - 1) * perPage)
            .limit(perPage);

        req.session.allUsers = users;

        res.render("user-List", { users, currentPage: page, totalPages });
    } catch (error) {
        console.log("Error happened in admin controller at users function ", error);
    }
});

//admin logout

const adminLogout = asyncHandler(async (req, res) => {
    try {
        const admin=req.session.admin
        if(admin){
            await User.findByIdAndUpdate(admin, { isActive: false });
            req.session.admin = null;
        }
        res.redirect("/admin");
    } catch (error) {
        console.error(error);
        res.render("error", { errorMessage: "Something went wrong" });
    }
});

// ---------sales report----------

const loadSalesReport = async (req, res) => {
    try {
        const deliveredProducts = await Order.aggregate([
            { $match: { orderStatus: "Delivered", "products.productStatus": "Delivered" } },
            { $sort: { date: -1 } },
        ]);
        console.log("delivered Products", deliveredProducts);
        let totalAmount = 0;
        deliveredProducts.forEach((product) => {
            totalAmount += product.actualTotalAmount;
        });

    
        res.render("salesReport", { deliveredProducts, totalAmount });
    } catch (error) {
        console.error(error);
    }
};

const filterSales = asyncHandler(async (req, res) => {
    try {
        const filterValue = req.query.identify;

        let filter = {
            "products.productStatus": "Delivered",
        };

        if (filterValue === "today") {
            const startOfToday = moment().startOf("day");
            const endOfToday = moment().endOf("day");
            console.log(" Start of Today:", startOfToday.format());
            console.log("End of Today:", endOfToday.format());

            filter.date = {
                $gte: startOfToday.toDate(),
                $lte: endOfToday.toDate(),
            };
        } else if (filterValue === "weekly") {
            const startOfWeek = moment().startOf("isoWeek");
            const endOfWeek = moment().endOf("isoWeek");
            console.log(" Start of Week:", startOfWeek.format());
            console.log("End of Week:", endOfWeek.format());

            filter.date = {
                $gte: startOfWeek.toDate(),
                $lte: endOfWeek.toDate(),
            };
        } else if (filterValue === "monthly") {
            const startOfMonth = moment().startOf("month");
            const endOfMonth = moment().endOf("month");

            filter.date = {
                $gte: startOfMonth.toDate(),
                $lte: endOfMonth.toDate(),
            };
        } else if (filterValue === "yearly") {
            const startOfYear = moment().startOf("year");
            const endOfYear = moment().endOf("year");

            filter.date = {
                $gte: startOfYear.toDate(),
                $lte: endOfYear.toDate(),
            };
        }

        const orders = await Order.aggregate([
            {
                $unwind: "$products", // Assuming "products" is an array within the Order collection
            },
            {
                $match: filter,
            },
            {
                $group: {
                    _id: {
                        orderId: "$_id",
                        orderDate: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                        orderNo: "$ord",
                    },
                    productId: { $first: "$products.productId" },
                    total: { $sum: "$products.total" },
                    couponDiscountAmount: { $first: "$couponDiscountAmount" },
                },
            },
            {
                $project: {
                    _id: 0,
                    orderId: "$_id.orderId",
                    orderDate: "$_id.orderDate",
                    orderNo: "$_id.orderNo",
                    productId: 1,
                    total: { $subtract: ["$total", "$couponDiscountAmount"] },
                },
            },
        ]);
        
        

        res.json({ orders });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

const generatePdf = asyncHandler(async (req, res) => {
    try {
        let { startingDate, endingDate } = req.body || {};

        // Check if startingDate and endingDate are provided
        const dateFilterExists = startingDate && endingDate;

        console.log("startddate", startingDate);
        console.log("enddate", endingDate);

        // Fetch date-wise sales data using your existing function
        let filter = { "products.productStatus": "Delivered" };

        if (dateFilterExists) {
            startingDate = new Date(startingDate);
            endingDate = new Date(endingDate);

            filter.$and = [
                { date: { $gte: startingDate } },
                { date: { $lte: endingDate } }
            ];
        }

        const orders = await Order.aggregate([
            {
                $unwind: "$products", // Assuming "products" is an array within the Order collection
            },
            {
                $match: filter,
            },
            {
                $group: {
                    _id: {
                        orderId: "$_id",
                        orderDate: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                        orderNo: "$ord",
                    },
                    productId: { $first: "$products.productId" },
                    total: { $sum: "$products.total" },
                    couponDiscountAmount: { $first: "$couponDiscountAmount" },
                },
            },
            {
                $project: {
                    _id: 0,
                    orderId: "$_id.orderId",
                    orderDate: "$_id.orderDate",
                    orderNo: "$_id.orderNo",
                    productId: 1,
                    total: { $subtract: ["$total", "$couponDiscountAmount"] },
                },
            },
        ]);

        const PDFDocument = require("pdfkit");
        const doc = new PDFDocument();

        // Set initial font size
        doc.fontSize(12);

        // Set a title
        doc.text("Sales Report", { align: "center" }).fontSize(16).moveDown();

        const margin = 10; // 1 inch margin
        doc.moveTo(margin, margin) // Drawing a rectangle around the content
            .lineTo(600 - margin, margin)
            .lineTo(600 - margin, 842 - margin)
            .lineTo(margin, 842 - margin)
            .lineTo(margin, margin)
            .lineTo(600 - margin, margin)
            .lineWidth(3)
            .strokeColor("#000000")
            .stroke()
            .moveDown();

        // Define table headers
        const headers = ["Order ID", "Date", "Total"];

        // Set initial positions for headers and data
        let headerX = 20;
        let headerY = doc.y + 10;

        // Draw headers
        doc.font("Helvetica-Bold");
        headers.forEach((header) => {
            doc.text(header, headerX, headerY);
            headerX += 230; // Adjust spacing as needed
        });

        // Set font back to normal for data
        doc.font("Helvetica");

        // Set initial position for data
        let dataY = headerY + 25;

        // Draw data
        orders.forEach((order) => {
            doc.text(order.orderId, 20, dataY);
            doc.text(order.orderDate, 250, dataY);
            doc.text(` ${order.total}`, 480, dataY);
            dataY += 25; // Adjust spacing as needed
        });

        const buffers = [];
        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => {
            const pdfData = Buffer.concat(buffers);
            res.writeHead(200, {
                "Content-Length": Buffer.byteLength(pdfData),
                "Content-Type": "application/pdf",
                "Content-Disposition": 'attachment; filename="sales_report.pdf"',
            });
            res.end(pdfData);
        });

        doc.end();
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});



const dateWiseSales = async (req, res) => {
    try {
        let { startingDate, endingDate } = req.body;

        startingDate = new Date(startingDate);
        endingDate = new Date(endingDate);

        const filter = {
            $and: [
                { "products.productStatus": "Delivered" },
                { date: { $gte: startingDate } },
                { date: { $lte: endingDate } }
            ]
        };

        const orders = await Order.aggregate([
            {
                $unwind: "$products", // Assuming "products" is an array within the Order collection
            },
            {
                $match: filter,
            },
            {
                $group: {
                    _id: {
                        orderId: "$_id",
                        orderDate: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                        orderNo: "$ord",
                    },
                    productId: { $first: "$products.productId" },
                    total: { $sum: "$products.total" },
                    couponDiscountAmount: { $first: "$couponDiscountAmount" },
                },
            },
            {
                $project: {
                    _id: 0,
                    orderId: "$_id.orderId",
                    orderDate: "$_id.orderDate",
                    orderNo: "$_id.orderNo",
                    productId: 1,
                    total: { $subtract: ["$total", "$couponDiscountAmount"] },
                },
            },
        ]);

        console.log("report:", orders);
        res.json({ orders });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};





module.exports = {
    adminLogin,
    adminVerifyLogin,
    adminDashboard,
    adminLogout,
    blockUser,
    unBlockUser,
    userManagement,
    loadSalesReport,
    filterSales,
    generatePdf,
    dateWiseSales
};
