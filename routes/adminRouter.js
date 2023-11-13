const express = require("express");
const adminRouter = express();

//------multer------------

const { upload } = require("../multer/multer");

// ------------close-------------

//----------engine---------

adminRouter.use(express.static("public"));
adminRouter.set("view engine", "ejs");
adminRouter.set("views", "./views/admin");

// ------------close-------------

//----------middleware-----------

const { isLogin, isLogout } = require("../middleware/adminAuth");


//--------admin controller-------

const {
    adminLogin,
    adminVerifyLogin,
    adminDashboard,
    adminLogout,
    blockUser,
    unBlockUser,
    userManagement,
    loadSalesReport,
    filterSales,
    generatePdf
} = require("../controllers/adminController");


//-----------admin user management------------

//Load admin login page
adminRouter.get("/", isLogout, adminLogin);

//verify admin using email and password
adminRouter.post("/",isLogout, adminVerifyLogin);

//load admin dashboard
adminRouter.get("/dashboard", isLogin, adminDashboard);

//user lists
adminRouter.get("/userManagement", isLogin, userManagement);

//bloack and unbloack users list
adminRouter.get("/block", isLogin, blockUser);

adminRouter.get("/unblock", isLogin, unBlockUser);

//admin logout
adminRouter.get("/logout", adminLogout);


//-----------------admin sales report--------

adminRouter.get('/salesReport',isLogin,loadSalesReport)
adminRouter.get('/filterSales',isLogin,filterSales)
adminRouter.post("/generate-pdf",isLogin,generatePdf)


//------------admin category management

const {
    loadAddCategory,
    createCategory,
    viewCategory,
    listCategory,
    unListCategory,
    editCategory,
    updateCategory,
} = require("../controllers/categoryController");


// load add-category page
adminRouter.get("/loadAddCategory", isLogin, loadAddCategory);

//create category
adminRouter.post("/createCategory", upload.single("images"), createCategory);

//load category list
adminRouter.get("/viewCategory", isLogin, viewCategory);

//list and unlist category
adminRouter.get("/listCategory", isLogin, listCategory);
adminRouter.get("/unListCategory", isLogin, unListCategory);

//edit category
adminRouter.get("/editCategory", isLogin, editCategory);

//update category
adminRouter.post("/updateCategory",upload.single("image"), updateCategory);
//Delete Category

//----------admin product management------------

const {
    loadAddProduct,
    addProducts,
    productList,
    unListProduct,
    loadEditProduct,
    updateProduct,
} = require("../controllers/productController");


//load add product page
adminRouter.get("/addproduct", isLogin, loadAddProduct);

//load add product
adminRouter.post("/addproduct",upload.array("images"), addProducts);

//load products list
adminRouter.get("/productList", isLogin, productList);

// //list product
// adminRouter.get('/listproduct',isLogin,listProduct)

//unliast product
adminRouter.get("/unlistproduct", isLogin, unListProduct);

//edit product
adminRouter.get("/editProduct", isLogin, loadEditProduct);

//edit products
adminRouter.post("/updateProduct",upload.array("images"), updateProduct);


//  --------------admin order management------------

const { loadOrderList, loadOrderDetails, returnApporval,filterOrder, returnConfirmed, delivered,shipped } = require("../controllers/orderController");

adminRouter.get("/orderList", isLogin, loadOrderList);
adminRouter.get("/orderDetails", isLogin, loadOrderDetails);
adminRouter.post("/shipped", isLogin, shipped);
adminRouter.post("/delivered", isLogin, delivered);
adminRouter.post("/returnApporval", isLogin, returnApporval);
adminRouter.post("/returnConfirmed",isLogin,returnConfirmed)
adminRouter.get("/filterOrder",isLogin,filterOrder)


// -----------------------admin coupon management--------------

const {loadCoupon,couponForm,addCoupon,couponStatus}=require("../controllers/couponController")

adminRouter.get('/coupon',isLogin,loadCoupon)
adminRouter.get('/addCoupon',isLogin,couponForm)
adminRouter.post('/addCoupon',isLogin,addCoupon)
adminRouter.get('/couponStatus',couponStatus)




//===================banner management================

const{loadAddBanner,addBanner,bannerList,bannerStatus}=require("../controllers/bannerController")

adminRouter.get("/addBanner",isLogin,loadAddBanner)
adminRouter.post("/addBanner",upload.single('images'),addBanner)
adminRouter.get("/banner",isLogin,bannerList)
adminRouter.get("/bannerStatus",isLogin,bannerStatus)




//==================offer management=======================

const {loadOffer,updateOffer,offerList}=require("../controllers/offerController")
adminRouter.get("/offer",isLogin,loadOffer)
adminRouter.post("/updateOffer",isLogin,updateOffer)
adminRouter.get("/offerList",isLogin,offerList)

module.exports = adminRouter;
