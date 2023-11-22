const Coupon = require("../models/couponModel");
const UsedCoupon = require("../models/usedCouponModel");
const User = require("../models/userModel");
const Cart = require("../models/cartModel");
const Category=require("../models/categoryModel")
const asyncHandler = require("express-async-handler");

//=================admin Management======================

const loadCoupon = asyncHandler(async (req, res) => {
    try {
        // Get current date
        const currentDate = new Date();
        // Find all coupons
        const coupons = await Coupon.find();
        // Check each coupon for expiration and update 'isActive' accordingly
        for (let coupon of coupons) {
            if (coupon.expirationDate <= currentDate) {
                // If expiration date has passed, set 'isActive' to false
                await Coupon.findByIdAndUpdate(coupon._id, { isActive: false });
            }
        }
        // Fetch updated coupon list
        const updatedCoupons = await Coupon.find();
        res.render("coupon-List", { coupon: updatedCoupons });
    } catch (error) {
        console.error(error);
    }
});

const couponForm = asyncHandler(async (req, res) => {
    try {
        res.render("add-Coupon", { Message: "" });
    } catch (error) {
        console.error(error);
    }
});

const addCoupon = async (req, res) => {
    try {
        const { couponCode, description, minAmount, discAmount, expDate, startDate } = req.body;

        // Check if the coupon code already exists
        const existingCoupon = await Coupon.findOne({ code: couponCode });
        if (existingCoupon) {
            return res.render("add-Coupon", { Message: "Coupon Code already exists" });
        }
        // Create a new coupon if the code doesn't already exist
        const newCoupon = new Coupon({
            code: couponCode,
            description: description,
            discount: discAmount,
            minOrderAmount: minAmount,
            expirationDate: expDate,
            createdOn: new Date(),
        });
        // Save the new coupon to the database
        const savedCoupon = await newCoupon.save();
        res.render("add-Coupon", { Message: "Coupon Added Successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to add the coupon" });
    }
};

const couponStatus = asyncHandler(async (req, res) => {
    try {
        const couponId = req.query.couponId;
        const findCoupon = await Coupon.findById(couponId);

        if (!findCoupon) {
            return res.status(404).json({ error: "Coupon not found" });
        }

        const currentDate = new Date();
        if (findCoupon.expirationDate < currentDate) {
            return res.status(400).json({ error: "Coupon has expired. Status cannot be changed." });
        }

        const newStatus = !findCoupon.isActive;
        const changeStatus = await Coupon.findByIdAndUpdate(couponId, { isActive: newStatus }, { new: true });

        res.status(200).json({ message: "Coupon status updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update the coupon status" });
    }
});

//==========================user Management=================

const myCoupon = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        const userCart = await Cart.findOne({ userId: user._id });
        const couponData = await Coupon.find();
        const category = await Category.find();
        const userCartCount = userCart ? userCart.products.reduce((acc, product) => acc + product.quantity, 0) : 0;
        const cartCount = userCartCount;
        if(user){
        res.render("coupons", { user, couponData,cartCount, Message: "" ,category});
        }
    } catch (error) {
        console.error("error");
    }
});




const applyCoupon = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        const user_id = user._id;
        //console.log("user:", user);
        const couponCode = req.query.couponCode.trim();
        //console.log("couponCode", couponCode);
        const cart = await Cart.find({ userId: user_id }).populate("products.productId");
       // console.log("cart", cart);
        let grandTotal = 0;
        cart.forEach((cartItem) => {
            cartItem.products.forEach((product) => {
                grandTotal += product.total;
            });
        });
        //console.log("totalAmt:", grandTotal);
        const couponData = await Coupon.findOne({ code: couponCode });

        if (!couponData) {
            res.json({ status: "error", message: "Invalid Coupon Code" });
        } else if (couponData.minOrderAmount > grandTotal) {
            res.json({ status: "error", message: "Cannot apply this coupon" });
        } else if (!couponData.isActive) {
            res.json({ status: "error", message: "Coupon Code is expired" });
        } else {
            let userUsedCoupons = await UsedCoupon.findOne({ userId: user_id });
            // console.log("userUsedCoupon:", userUsedCoupons);
            if (!userUsedCoupons) {
                userUsedCoupons = new UsedCoupon({
                    userId: user_id,
                    userCoupons: [],
                });
                await userUsedCoupons.save();
            }
            //console.log("userUsedCoupon:", userUsedCoupons);
            if (userUsedCoupons) {
                const findCoupon = userUsedCoupons.userCoupons.filter(
                    (coupon) => coupon.couponId.toString() === couponData._id.toString()
                );
                //console.log("findCoupon", findCoupon);
                if (!findCoupon.length) {
                    const discountAmount = couponData.discount;
                    let actualValue;
                    if (discountAmount) {
                        actualValue = grandTotal - discountAmount;
                    }
                    // console.log(actualValue);
                    //console.log(couponData._id);
                    res.json({
                        status: "success",
                        message: "Coupon Applied",
                        discountAmount,
                        actualValue,
                        couponId: couponData._id,
                    });
                } else {
                    res.json({ status: "error", message: "Coupon Already Used" });
                }
            }
        }
    } catch (error) {
        console.error(error);
    }
});

const removeCoupon = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        const user_id = user._id;
        const couponCode = req.query.couponCode.trim();
        const couponData = await Coupon.findOne({ code: couponCode });
        //console.log("coupondata in remove",couponData);
        const cart = await Cart.find({ userId: user_id }).populate("products.productId");
        let grandTotal = 0;
        cart.forEach((cartItem) => {
            cartItem.products.forEach((product) => {
                grandTotal += product.total;
            });
        });
        if(couponData){ 
   
        res.json({ status: "success", message: "Coupon Removed" ,actualValue:grandTotal});
        }else{
            res.json({status:"error",message:"Cpupon not found"})
        }
        
    } catch (error) {
        console.error(error);
        res.json({ status: "error", message: "Internal Server Error" });
    }
});

module.exports = { loadCoupon, couponForm, addCoupon, couponStatus,myCoupon,applyCoupon ,removeCoupon};
