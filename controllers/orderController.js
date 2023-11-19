const Order = require('../models/orderModel');
const Address = require('../models/addressModel');
const Cart = require('../models/cartModel');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const UsedCoupon = require('../models/usedCouponModel');
const Wallet = require('../models/walletModel');
const Category=require("../models/categoryModel")
const asyncHandler = require('express-async-handler');
const RazorpayHelper = require('../razorpay/razorpay');
// const { response } = require("../routes/userRouter");

const placeOrder = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        const user_Id = user._id;
        const cart = await Cart.findOne({ userId: user_Id }).populate('products.productId');
        //console.log('cartData from placeOrder:',cart);
        const { totalAmount, actualAmount, discountAmount, paymentMethod, addressId, couponId } = req.body;
        //console.log('totalamount from placeorder',totalAmount);
        //console.log("paymentMethod", paymentMethod);
        //console.log('addressid',addressId);
        //console.log('Couponid from checkout:',couponId);
        //=== Coupon Mangement=====
        if (couponId) {
            const usedCoupons = await UsedCoupon.findOne({ userId: user_Id });
            //console.log('userdCoupnsbefore',usedCoupons);
            if (!usedCoupons) {
                usedCoupons = new UsedCoupon({
                    userId: user_Id,
                    userCoupons: [{ couponId: couponId }],
                });
            } else {
                usedCoupons.userCoupons.push({ couponId });
            }
            await usedCoupons.save();
            //console.log('userdCoupnsafter',usedCoupons);
        }

        const productData = cart.products;
        //console.log('productdata',productData);
        let orderedProducts = [];
        productData.forEach(async (product) => {
            const products = {
                productId: product.productId._id,
                quantity: product.quantity,
                salePrice: product.productId.salePrice,
                total: product.total,
            };
            //console.log("ordered details full", products);
            orderedProducts.push(products);
        });
        const userAddress = await Address.findOne({ userId: user_Id });
        const shippingAddress = userAddress.address.find((address) => address._id.toString() === addressId);
        //console.log(shippingAddress);
        const grandTotal = cart.products.reduce((total, product) => {
            return total + product.total;
        }, 0);
        //console.log("grandTotal from placeOrder", grandTotal);
        const address = {
            name: shippingAddress.name,
            mobile: shippingAddress.mobile,
            homeAddress: shippingAddress.homeAddress,
            city: shippingAddress.city,
            street: shippingAddress.street,
            postalCode: shippingAddress.postalCode,
        };
        const orderDetails = new Order({
            userId: user_Id,
            totalAmount: grandTotal,
            actualTotalAmount: actualAmount,
            couponDiscountAmount: discountAmount,
            paymentMethod: paymentMethod,
            products: orderedProducts,
            address: address,
        });
        // console.log('address: ',address);
        //console.log('orderdetails',orderDetails);
        const placeorder = await orderDetails.save();
        console.log("total checking :",orderDetails.totalAmount);
        //console.log('placedorder', placeorder);
    if(orderDetails.totalAmount){
        if (placeorder.paymentMethod === 'COD') {
            for (const product of orderedProducts) {
                product.productStatus = 'Order Placed';
            }
            placeorder.orderStatus = 'Order Placed';
            placeorder.products = orderedProducts;
            await placeorder.save();
            if (cart) {
                cart.products = [];
                await cart.save();
            }
            productData.forEach(async (product) => {
                product.productId.stock -= product.quantity;
                await product.productId.save();
            });
            res.json({ status: 'COD', placedOrderId: placeorder._id });
        } else if (placeorder.paymentMethod === 'ONLINE') {
            const orderId = placeorder._id;
            const totalAmount = placeorder.totalAmount;
            RazorpayHelper.generateRazorpay(orderId, totalAmount).then((response) => {
                res.json({ status: 'ONLINE', response });
            });
        } else if (placeorder.paymentMethod === 'WALLET') {
            console.log('payement method:', placeorder.paymentMethod);
            const userWallet = await Wallet.findOne({ userId: user_Id });
            const userWalletAmount = userWallet.walletAmount;
            if (userWalletAmount) {
                userWallet.walletAmount = userWalletAmount - actualAmount;

                userWallet.transactionHistory.push({
                    description: 'Shopping',
                    addedAmount: actualAmount,
                    debitOrCredit: 'Debit',
                });
                await userWallet.save();

                for (const product of orderedProducts) {
                    product.productStatus = 'Order Placed';
                }
                placeorder.orderStatus = 'Order Placed';
                placeorder.products = orderedProducts;
                await placeorder.save();
                if (cart) {
                    cart.products = [];
                    await cart.save();
                }
                productData.forEach(async (product) => {
                    product.productId.stock -= product.quantity;
                    await product.productId.save();
                });
                res.json({ status: 'WALLET', placedOrderId: placeorder._id });
            }
        }
    }else{
        res.json({status:"cart-issue",placedOrderId: placeorder._id})
    }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

const verifyPayment = async (req, res) => {
    const user = await User.findById(req.session.userId);
    const user_Id = user._id;
    const cart = await Cart.findOne({ userId: user_Id }).populate('products.productId');
    const data = req.body;
    console.log('payement', data);
    const productData = cart.products;
    //console.log('productdata',productData);
    let orderedProducts = [];
    productData.forEach(async (product) => {
        const products = {
            productId: product.productId._id,
            quantity: product.quantity,
            salePrice: product.productId.salePrice,
            total: product.total,
        };
        //console.log("ordered details full", products);
        orderedProducts.push(products);
    });

    let receiptId = data.order.receipt;
    RazorpayHelper.verifyOnlinePayment(data)
        .then(async () => {
            console.log('Resolved');
            let paymentSuccess = true;
            await RazorpayHelper.updatePaymentStatus(receiptId, paymentSuccess);

            if (cart) {
                cart.products = [];
                await cart.save();
            }
            productData.forEach(async (product) => {
                product.productId.stock -= product.quantity;
                await product.productId.save();
            });
            res.json({ status: 'PAYMENT SUCCESS', placedOrderId: receiptId });
        })
        .catch(async (err) => {
            console.log('Rejected');
            if (err) {
                console.log(err.message);
                let paymentSuccess = false;
                const status = await RazorpayHelper.updatePaymentStatus(receiptId, paymentSuccess);
                // console.log('status:',status);
                if (cart) {
                    await cart.save();
                }

                res.json({ status: 'PAYMENT FAILED', placedOrderId: receiptId });
            }
        });
};

const orderList = asyncHandler(async (req, res) => {
    try {
        const filterValue = req.query.identify;
        console.log('filtervalue:', filterValue);
        const user = await User.findById(req.session.userId);
        user_Id = user._id;
        const page = parseInt(req.query.page) || 1;
        const perPage = 8;
        const userCart = await Cart.findOne({ userId: user._id });
        const category = await Category.find();
        const totalOrder = await Order.find({ userId: user_Id }).sort({ date: -1 }).countDocuments();
        //console.log('totalorder:', totalOrder);
        const totalPages = Math.ceil(totalOrder / perPage);
        const userOrders = await Order.find({ userId: user_Id })
            .sort({ date: -1 })
            .skip((page - 1) * perPage)
            .limit(perPage)
            .populate('products.productId');
        // console.log(userOrders);
        const userCartCount = userCart ? userCart.products.reduce((acc, product) => acc + product.quantity, 0) : 0;
        const cartCount = userCartCount;
        if (user) {
            res.render('orderList', { user, userOrders, cartCount, currentPage: page, totalPages,category });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

const orderDetails = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        const orderId = req.query.orderId;
        //console.log('orederID',orderId);
        const orderDetail = await Order.findById(orderId).populate('products.productId');
        const userCart = await Cart.findOne({ userId: user._id });
        const category = await Category.find();
        // console.log('orderDetails', orderDetail);
        const userCartCount = userCart ? userCart.products.reduce((acc, product) => acc + product.quantity, 0) : 0;
        const cartCount = userCartCount;
        if (user) {
            res.render('orderDetail', { user, orderDetail,cartCount,category });
        }
    } catch (error) {
        console.error('Error:', error);
        res.render('404');
    }
});

const cancelOrder = asyncHandler(async (req, res) => {
    try {
        const orderId = req.query.orderId;

        const orderDetails = await Order.findById(orderId).populate('products.productId');
        if (!orderDetails) {
            return res.status(404).json({ status: 'error', message: 'Order not found' });
        }

        // Update order status
        orderDetails.orderStatus = 'Order Cancelled';

        // Update product statuses
        orderDetails.products.forEach(async (product) => {
            product.productStatus = 'Order Cancelled';
            // Assuming you may want to update other fields like stock
            const productDoc = await Product.findById(product.productId);
            if (productDoc) {
                productDoc.stock += product.quantity;
                await productDoc.save();
            }
        });

        await orderDetails.save();

        res.json({ status: 'success', message: 'Order Cancelled' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Something went wrong' });
        console.log(error);
    }
});

const returnItem = asyncHandler(async (req, res) => {
    try {
        const { orderId, selectedProduct, selectedReason } = req.body;
        // console.log("orderId:", orderId);
        // console.log("product:", selectedProduct);//productid
        // console.log("reason:", selectedReason);
        const orderDetails = await Order.findById(orderId);
        // console.log('orderDetails:',orderDetails.returnOrderStatus);

        const productIndex = orderDetails.products.findIndex((product) => product.productId.toString() === selectedProduct);
        //console.log('index:',productIndex);
        const productstatus = orderDetails.products[productIndex].productStatus;
        //console.log("product Status", productstatus);
        if (productstatus === 'Return Requested') {
            res.json({ errorMessage: 'Request already submitted' });
        } else if (productstatus === 'Return Approved') {
            res.json({ errorMessage: 'Your request has already been approved' });
        } else {
            if (productIndex !== -1) {
                orderDetails.products[productIndex].productStatus = 'Return Requested';
                orderDetails.products[productIndex].returnReason = selectedReason;
            }
            orderDetails.returnOrderStatus.status = 'Requested For Return';
            orderDetails.returnOrderStatus.reason = selectedReason;
            const returnData = await orderDetails.save();
            //console.log('returnData:',returnData);
            if (returnData) {
                res.json({ message: 'Your request has been successfully submitted' });
            }
        }
    } catch (error) {
        console.error(error);
    }
});

// -------------Admin Order controller--------------

const loadOrderList = asyncHandler(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const perPage = 10;
        const totalOrder = await Order.countDocuments();
        const category = await Category.find();
        const totalPages = Math.ceil(totalOrder / perPage);
        const orders = await Order.find()
            .skip((page - 1) * perPage)
            .limit(perPage)
            .populate('userId');
        // console.log('page:', page);
        // console.log('totalOrder:', totalOrder);
        // console.log('totalPages:', totalPages);

        //console.log('order:', orders);
        res.render('order-List', { orders, currentPage: page, totalPages,category });
    } catch (error) {
        console.error(error);
    }
});

const filterOrder = asyncHandler(async (req, res) => {
    try {
        const filterValue = req.query.identify;

        let orders;
        let filterQuery = {};

        if (filterValue === 'delivered') {
            filterQuery = { orderStatus: 'Delivered' };
        } else if (filterValue === 'newest') {
            orders = await Order.aggregate([
                { $sort: { date: -1 } }, // Sorting by the most recent orders
            ]);
        } else if (filterValue === 'orderplaced') {
            filterQuery = { orderStatus: 'Order Placed' };
        } else if (filterValue === 'pending') {
            filterQuery = { orderStatus: 'Pending' };
        } else {
            // For 'all' or any other case, fetch all orders
            orders = await Order.find({});
        }

        if (Object.keys(filterQuery).length > 0) {
            orders = await Order.find(filterQuery);
        }

        //console.log("filterlist", orders);
        res.json(orders); // Sending the filtered orders as a response
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const loadOrderDetails = asyncHandler(async (req, res) => {
    try {
        const orderId = req.query.orderId;
        const category = await Category.find();
        //console.log('orderid:',orderId);
        const orderDetail = await Order.findById(orderId).populate('products.productId');
        //console.log('orderDetails:', orderDetail);
        res.render('order-Details', { orderDetail ,category});
    } catch (error) {
        console.error(error);
    }
});

const shipped = asyncHandler(async (req, res) => {
    try {
        const { orderId, orderStatus } = req.body;
        // console.log('orderid:', orderId);
        // console.log('orderstatus', orderStatus);
        const orderDetails = await Order.findById(orderId).populate('products.productId');
        // console.log(orderDetails);
        if (orderStatus == 'Shipped') {
            orderDetails.products.map((product) => {
                return (product.productStatus = 'Shipped');
            });
            orderDetails.orderStatus = orderStatus;
        } else {
            orderDetails.orderStatus = orderStatus;
        }
        await orderDetails.save();
        //console.log(orderDetails);

        res.json({ status: 'success', message: 'Status Updated' });
    } catch (error) {
        console.error(error);
    }
});

const delivered = asyncHandler(async (req, res) => {
    try {
        const { orderId, orderStatus } = req.body;
        // console.log('orderid:',orderId);
        // console.log('orderstatus',orderStatus);
        const orderDetails = await Order.findById(orderId).populate('products.productId');
        console.log(orderDetails);
        if (orderStatus == 'Delivered') {
            orderDetails.products.map((product) => {
                return (product.productStatus = 'Delivered');
            });
            orderDetails.orderStatus = orderStatus;
        } else {
            orderDetails.orderStatus = orderStatus;
        }
        await orderDetails.save();
        //console.log(orderDetails);

        res.json({ status: 'success', message: 'Status Updated' });
    } catch (error) {
        console.error(error);
    }
});

const returnApporval = asyncHandler(async (req, res) => {
    try {
        const { returnStatus, orderId } = req.body;
        console.log('returnStatus', returnStatus);
        console.log('returnId', orderId);
        const orderData = await Order.findById(orderId).populate('products.productId');
        console.log('orderdata:', orderData);
        if (returnStatus === 'Return Approved') {
            orderData.products.map((product) => {
                if (product.productStatus === 'Return Requested') {
                    product.productStatus = returnStatus;
                }
            });
            // const status = orderData.products.filter(product => {
            //     return (product.productStatus !== 'Return Request Processing' && product.productStatus !== 'Return Approved');
            // });
            orderData.returnOrderStatus.status = returnStatus;
            await orderData.save();
            console.log('orderData', orderData);
            // console.log('status:',status);
            res.json({ status: 'success', message: 'Status Updated' });
        }
    } catch (error) {
        console.error(error);
    }
});

const returnConfirmed = asyncHandler(async (req, res) => {
    try {
        const { returnStatus, orderId } = req.body;

        const orderData = await Order.findById(orderId).populate('products.productId');
       // console.log("orderdata:",orderData);
        const userId=orderData.userId
        console.log("UserID..",userId);

        if (returnStatus === 'Product Returned') {
            const returnedProduct = orderData.products.find((product) => product.productStatus === 'Return Approved');

            if (returnedProduct) {
                const productData = await Product.findById(returnedProduct.productId);
                console.log('productdatabefore', productData);
                const returnQuantity = returnedProduct.quantity; // Adjust this based on your data structure
                productData.stock += returnQuantity;
                await productData.save();
                //console.log('productdataafter', productData);
                // Update the status of the returned product in the order
                returnedProduct.productStatus = returnStatus;
                // Update the return order status
                orderData.returnOrderStatus.status = returnStatus;
                await orderData.save();
                res.json({ status: 'success', message: 'Status Updated and Stock Quantity Updated' });
                if(userId){
                    const userWallet=await Wallet.findOne({userId:userId})
                    if (userWallet) {
                        console.log("refund amount",orderData.actualTotalAmount);
                        const refundAmount = orderData.actualTotalAmount;
                        userWallet.walletAmount += refundAmount;
                        userWallet.transactionHistory.push({
                            description: 'Product Refund',
                            addedAmount: refundAmount,
                            debitOrCredit: 'Credit',
                        });
                        await userWallet.save();
                    }

                }
            } else {
                res.json({ status: 'error', message: "No product with 'Return Approved' status found" });
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'An error occurred' });
    }
});

module.exports = {
    placeOrder,
    orderList,
    orderDetails,
    cancelOrder,
    loadOrderList,
    loadOrderDetails,
    shipped,
    delivered,
    returnItem,
    returnApporval,
    verifyPayment,
    filterOrder,
    returnConfirmed,
};
