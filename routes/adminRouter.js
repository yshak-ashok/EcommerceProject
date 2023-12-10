const express = require('express');
const adminRouter = express();

//------multer------------
const { upload } = require('../multer/multer');

//----------engine---------
adminRouter.use(express.static('public'));
adminRouter.set('view engine', 'ejs');
adminRouter.set('views', './views/admin');

//----------middleware-----------
const { isLogin, isLogout } = require('../middleware/adminAuth');

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
    generatePdf,
    dateWiseSales,
} = require('../controllers/adminController');

//-----------admin user management------------
adminRouter.get('/', isLogout, adminLogin);
adminRouter.post('/', isLogout, adminVerifyLogin);
adminRouter.get('/dashboard', isLogin, adminDashboard);
adminRouter.get('/userManagement', isLogin, userManagement);
adminRouter.get('/block', isLogin, blockUser);
adminRouter.get('/unblock', isLogin, unBlockUser);
adminRouter.get('/logout', adminLogout);

//-----------------admin sales report--------
adminRouter.get('/salesReport', isLogin, loadSalesReport);
adminRouter.get('/filterSales', isLogin, filterSales);
adminRouter.post('/generate-pdf', isLogin, generatePdf);
adminRouter.post('/datewise-filter', dateWiseSales);

//------------admin category management
const {
    loadAddCategory,
    createCategory,
    viewCategory,
    listCategory,
    unListCategory,
    editCategory,
    updateCategory,
} = require('../controllers/categoryController');

adminRouter.get('/loadAddCategory', isLogin, loadAddCategory);
adminRouter.post('/createCategory', upload.single('images'), createCategory);
adminRouter.get('/viewCategory', isLogin, viewCategory);
adminRouter.get('/listCategory', isLogin, listCategory);
adminRouter.get('/unListCategory', isLogin, unListCategory);
adminRouter.get('/editCategory', isLogin, editCategory);
adminRouter.post('/updateCategory', upload.single('image'), updateCategory);

//----------admin product management------------
const {
    loadAddProduct,
    addProducts,
    productList,
    unListProduct,
    loadEditProduct,
    updateProduct,
    deleteImage,
} = require('../controllers/productController');

adminRouter.get('/addproduct', isLogin, loadAddProduct);
adminRouter.post('/addproduct', upload.array('images'), addProducts);
adminRouter.get('/productList', isLogin, productList);
// adminRouter.get('/listproduct',isLogin,listProduct)
adminRouter.get('/unlistproduct', isLogin, unListProduct);
adminRouter.get('/editProduct', isLogin, loadEditProduct);
adminRouter.post('/updateProduct', upload.array('images'), updateProduct);
adminRouter.post('/deleteImage', isLogin, deleteImage);

//  --------------admin order management------------
const {
    loadOrderList,
    loadOrderDetails,
    returnApporval,
    filterOrder,
    returnConfirmed,
    delivered,
    shipped,
} = require('../controllers/orderController');

adminRouter.get('/orderList', isLogin, loadOrderList);
adminRouter.get('/orderDetails', isLogin, loadOrderDetails);
adminRouter.post('/shipped', isLogin, shipped);
adminRouter.post('/delivered', isLogin, delivered);
adminRouter.post('/returnApporval', isLogin, returnApporval);
adminRouter.post('/returnConfirmed', isLogin, returnConfirmed);
adminRouter.get('/filterOrder', isLogin, filterOrder);

// ----------------admin coupon management--------------
const { loadCoupon, couponForm, addCoupon, couponStatus } = require('../controllers/couponController');

adminRouter.get('/coupon', isLogin, loadCoupon);
adminRouter.get('/addCoupon', isLogin, couponForm);
adminRouter.post('/addCoupon', isLogin, addCoupon);
adminRouter.get('/couponStatus', couponStatus);

//===================banner management================
const { loadAddBanner, addBanner, bannerList, bannerStatus } = require('../controllers/bannerController');

adminRouter.get('/addBanner', isLogin, loadAddBanner);
adminRouter.post('/addBanner', upload.single('images'), addBanner);
adminRouter.get('/banner', isLogin, bannerList);
adminRouter.get('/bannerStatus', isLogin, bannerStatus);

//==================offer management=======================
const { loadOffer, updateOffer, offerList } = require('../controllers/offerController');

adminRouter.get('/offer', isLogin, loadOffer);
adminRouter.post('/updateOffer', isLogin, updateOffer);
adminRouter.get('/offerList', isLogin, offerList);

module.exports = adminRouter;
