const Address = require("../models/addressModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Cart = require("../models/cartModel");
const Wallet = require("../models/walletModel");
const Coupon = require("../models/couponModel");
const asyncHandler = require("express-async-handler");
const categoryModel = require("../models/categoryModel");
const Order = require("../models/orderModel");

const loadCart = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        const user_Id = user._id;
        const userCart = await Cart.findOne({ userId: user_Id });
        const category = await Category.find();
        if (userCart && userCart.products && userCart.products.length > 0) {
            const userCartCount = userCart.products.reduce((acc, product) => {
                return (acc += product.quantity);
            }, 0);
            let cart = await Cart.findOne({ userId: user_Id }).populate("products.productId");
            if (!cart) {
                cart = new Cart({ userId: user_Id, products: [] });
                await cart.save();
            }
            cart.total = cart.products.reduce((total, product) => {
                return total + product.total;
            }, 0);
            //console.log("pageload cart total", cart.total);
            const cartRegularPriceTotal = cart.products.reduce((total, product) => {
                return total + product.regularprice;
            }, 0);
            // console.log('cart.products',cart.products);

            const totalDiscount = cartRegularPriceTotal - cart.total;

            res.render("cart", {
                user,
                cart: cart.products,
                cartTotal: cart.total,
                cartCount: userCartCount,
                cartRegularPriceTotal,
                totalDiscount,
                message: "",
                category
            });
        } else {
            // If the user cart doesn't exist or is empty, render the cart page without products
            res.render("cart", { user, cart: [], cartTotal: 0, cartCount: 0, message: "Cart is empty",category });
        }
    } catch (error) {
        console.error(error);
        res.render("error", { errorMessage: "Error loading the cart" });
    }
});

const addtocart = asyncHandler(async (req, res) => {
    try {
        const productid = req.query.productId;
        const user = await User.findById(req.session.userId);
        if(!user){
            return res.json({status:"nouser"})
        }
        const user_Id = user._id;
        let cart = await Cart.findOne({ userId: user_Id });
        if (!cart) {
            let newCart = new Cart({ userId: user_Id, products: [] });
            await newCart.save();
            cart = newCart;
        }
        const product = await Product.findById(productid).lean();

        if (product.stock === 0) {
            return res.json({ status: "nostock" });
        } else{
            const productIndex = cart.products.findIndex((product) => {
                return product.productId.toString() === productid;
            });

            if (productIndex === -1) {
                const totalSalePrice = product.salePrice;
                const totalRegularPrice = product.regularPrice;

                cart.products.push({
                    productId: productid,
                    quantity: 1,
                    total: totalSalePrice,
                    regularprice: totalRegularPrice,
                });
            } else {
                cart.products[productIndex].quantity++;
                cart.products[productIndex].total = cart.products[productIndex].quantity * product.salePrice;
                cart.products[productIndex].regularprice = cart.products[productIndex].quantity * product.regularPrice;
            }

            cart.total = cart.products.reduce((total, product) => {
                return total + product.total;
            }, 0);

            const cartRegularPriceTotal = cart.products.reduce((total, product) => {
                return total + product.regularprice;
            }, 0);

            const userCartCount = cart.products.reduce((acc, product) => {
                return acc + product.quantity;
            }, 0);

            const cartCount = userCartCount;
            await cart.save();
            //console.log("totalRegularPriceInCart", totalRegularPriceInCart);
            return res.json({ status: "success", cartTotal: cart.total, cartCount, cartRegularPriceTotal });
        }
    } catch (error) {
        console.error(error);
    }
});

const updateQuantity = async (req, res) => {
    try {
        const { productId, newQuantity } = req.body;
        if (!productId || !newQuantity || newQuantity < 0) {
            return res.status(400).json({ status: "Invalid request" });
        }
        const user = await User.findById(req.session.userId);
        const user_Id = user._id;
        const cart = await Cart.findOne({ userId: user_Id });

        if (!cart) {
            return res.status(404).json({ status: "Cart not found" });
        }

        const productIndex = cart.products.findIndex((product) => {
            return product.productId.toString() === productId;
        });

        if (productIndex === -1) {
            return res.status(404).json({ status: "Product not found in cart" });
        }

        const product = cart.products[productIndex];
        const productData = await Product.findById(productId).lean();

        if (newQuantity === 0) {
            cart.products.splice(productIndex, 1);
        } else {
            product.quantity = newQuantity;
            product.total = newQuantity * productData.salePrice;
            product.regularprice = newQuantity * productData.regularPrice; // Calculate regular price total
        }

        cart.total = cart.products.reduce((total, product) => {
            return total + product.total;
        }, 0);

        console.log("carttotal", cart.total);

        const cartRegularPriceTotal = cart.products.reduce((total, product) => {
            return total + product.regularprice;
        }, 0);

        const totalDiscount = cartRegularPriceTotal - cart.total;

        const userCartCount = cart.products.reduce((acc, product) => {
            return acc + product.quantity;
        }, 0);

        const cartCount = userCartCount;

        console.log("cartRegularPriceTotal ", cartRegularPriceTotal);

        await cart.save();
        //console.log("cartRegularPriceTotal ", cartRegularPriceTotal);
        res.status(200).json({
            status: "success",
            cartTotal: cart.total,
            productTotal: product.total,
            cartRegularPriceTotal: cartRegularPriceTotal,
            cartCount,
            totalDiscount,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "Error" });
    }
};

const removeProductCart = asyncHandler(async (req, res) => {
    try {
        const productId = req.query.productId;
        const user = await User.findById(req.session.userId);
        const user_Id = user._id;
        const updatedCart = await Cart.findOneAndUpdate(
            { userId: user_Id },
            { $pull: { products: { productId: productId } } },
            { new: true }
        );
        res.redirect("/cart");
    } catch (error) {
        console.error(error);
    }
});

const loadCheckout = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        const user_id = user._id;
        let userAddress = await Address.findOne({ userId: user_id });
        const userCart = await Cart.findOne({ userId: user_id });
        const category = await Category.find();
        if (!userAddress) {
            userAddress = new Address({ userId: user_id, address: [] });
            await userAddress.save();
        }
        const userWallet = await Wallet.findOne({ userId: user_id });

        const cart = await Cart.findOne({ userId: user_id }).populate("products.productId");
        const cartDetails = cart.products;
        const grandTotal = cart.products.reduce((total, product) => total + product.total, 0);
        const address = userAddress.address;

        const userCartCount = userCart.products.reduce((acc, product) => acc + product.quantity, 0);

        cart.total = cart.products.reduce((total, product) => {
            return total + product.total;
        }, 0);

        // Calculate cartRegularPriceTotal
        const cartRegularPriceTotal = cart.products.reduce((total, product) => {
            return total + product.regularprice;
        }, 0);
        console.log("cart");
        const totalDiscountAmount = cartRegularPriceTotal - cart.total;

        res.render("checkout", {
            user,
            address,
            cartDetails,
            grandTotal,
            cartCount: userCartCount,
            userWallet,
            cartRegularPriceTotal,
            totalDiscountAmount,
            category
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred");
    }
});


const loadConfirmation = asyncHandler(async (req, res) => {
    try {
        const orderId = req.query.orderId;
        //console.log("orderid", orderId);
        const user = await User.findById(req.session.userId);
        let cart = await Cart.findOne({ userId: user._id });
        const category = await Category.find();
        const orderDetails = await Order.findById(orderId).populate("products.productId");
        //console.log("orderdetails", orderDetails);
        const userCartCount = cart.products.reduce((acc, product) => {
            return acc + product.quantity;
        }, 0);

        const cartCount = userCartCount;
        if(user){
        res.render("confirmation", { user, orderDetails, cartCount,category });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "An error occurred" });
    }
});

module.exports = { loadCart, addtocart, updateQuantity, removeProductCart, loadCheckout, loadConfirmation };
