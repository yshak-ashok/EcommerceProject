const express = require("express");
const userRouter = express();
//--------engine-------

userRouter.use(express.static("public"));
userRouter.set("view engine", "ejs");
userRouter.set("views", "./views/users");

//----------------

//--Authentication middleware--

const { isLogin, isLogout } = require("../middleware/auth");

//------user controller----

const {
    userSignIn,
    userSignUp,
    createNewUser,
    userLogin,
    home,
    userLogout,
    emailVerified,
    forgotPassword,
    verifyEmail,
    verifyForgotOTP,
    newPassword,
    loadNewPassword,
    viewProduct,
    resendOtp,
    allProducts,
    searchProducts,
    resendforgotOtp,
    userProfile,
    editUserProfile,
    updateUserProfile,
    changePassword,
    updatePassword,
    userAddress,
    addNewAddress,
    loadAddAddress,
    editAddress,
    updateAddress,
    deleteAddress,
    emailOTP,
    categoryPage,
    walletLoad,
    filterCategory
} = require("../controllers/userController");

//-------user athuentication----

//userRouter.get("/",home);

userRouter.get("/", home);

userRouter.post("/register", createNewUser);

userRouter.get("/register", userSignUp);

userRouter.post("/emailVerified", emailVerified);

userRouter.get("/emailOTP", emailOTP);

userRouter.get("/login", isLogout, userSignIn);

userRouter.post("/login", userLogin);

userRouter.get("/resendOtp", resendOtp);

userRouter.get("/logout", userLogout);

userRouter.get("/forgotPassword", forgotPassword);

userRouter.post("/VerifyEmail", verifyEmail);

userRouter.post("/forgotPassword", verifyForgotOTP);

userRouter.get("/resendforgotOtp", resendforgotOtp);

userRouter.get("/newPassword", loadNewPassword);

userRouter.post("/newPassword", newPassword);

// -----------user product---------

userRouter.get("/viewProduct", viewProduct);

//userRouter.get('/allproduct',isLogout,allProducts)

userRouter.get("/allProducts", allProducts);

userRouter.get("/filter-Category",filterCategory)

userRouter.post("/search", searchProducts);

// userRouter.post("/categories", categories);

userRouter.get("/category", categoryPage);

// ----------user Profile----------

userRouter.get("/userProfile", isLogin, userProfile);

userRouter.get("/editUserProfile", isLogin, editUserProfile);

userRouter.post("/updateUserProfile", isLogin, updateUserProfile);

userRouter.get("/changePassword", isLogin, changePassword);

userRouter.post("/updatePassword", isLogin, updatePassword);

userRouter.get("/wallet", isLogin, walletLoad);

// ----------User address-----------

userRouter.get("/userAddress", isLogin, userAddress);

userRouter.get("/loadAddAddress", isLogin, loadAddAddress);

userRouter.post("/addNewAddress", isLogin, addNewAddress);

userRouter.get("/editAddress", isLogin, editAddress);

userRouter.post("/updateAddress", isLogin, updateAddress);

userRouter.get("/deleteAddress", isLogin, deleteAddress);

//wishlist controller

const { wishlist, 
    addtowishlist, 
    removeWishlist 
    } = require("../controllers/wishlistController");

userRouter.get("/wishlist", isLogin, wishlist);

userRouter.post("/add-to-wishlist", isLogin, addtowishlist);

userRouter.get("/remove-wishlist", removeWishlist);

//cart Controller

const {
    loadCart,
    addtocart,
    updateQuantity,
    removeProductCart,
    loadCheckout,
    loadConfirmation,
} = require("../controllers/cartController");

userRouter.get("/cart", isLogin, loadCart);
userRouter.post("/addtocart", isLogin, addtocart);
userRouter.post("/updateQuantity", isLogin, updateQuantity);
userRouter.get("/remove-product-cart", isLogin, removeProductCart);
userRouter.post("/checkout", isLogin, loadCheckout);
userRouter.get("/checkout", isLogin, loadCheckout);
userRouter.get("/confirmation", isLogin, loadConfirmation);

//order controller

const {
    placeOrder,
    orderList,
    orderDetails,
    cancelOrder,
    returnItem,
    verifyPayment,
} = require("../controllers/orderController");

userRouter.post("/place-order", isLogin, placeOrder);
userRouter.post("/verifyPayment", isLogin, verifyPayment);
userRouter.get("/orderList", isLogin, orderList);
userRouter.get("/orderDetails", isLogin, orderDetails);
userRouter.get("/cancelOrder", isLogin, cancelOrder);
userRouter.post("/returnItem", isLogin, returnItem);

// coupon controller

const { 
    applyCoupon,
     myCoupon 
    } = require("../controllers/couponController");

userRouter.get("/applyCoupon", applyCoupon);
userRouter.get("/myCoupons", isLogin, myCoupon);

module.exports = userRouter;
