const asyncHandler = require('express-async-handler');
const Admin = require('../models/userModel');
const isLogin = asyncHandler(async (req, res, next) => {
    try {
        if (!req.session.admin) {
            return res.redirect('/admin');
        }
        const admin = await Admin.findById(req.session.admin);
        if (!admin) {
            return res.redirect('/admin/logout');
        }
        if (req.session.admin) {
            next();
        }
    } catch (error) {
        console.error('error');
    }
});
const isLogout = asyncHandler(async (req, res, next) => {
    try {
        const admin = await Admin.findById(req.session.admin);
        if (!admin) {
            // If admin is not found in the session, proceed to the next middleware
            next();
        } else {
            // If admin is found, redirect to the dashboard or another appropriate page
            res.redirect('/admin/dashboard'); // Adjust to the appropriate admin page
        }
    } catch (error) {
        console.error(error);
        // Handle the error appropriately
        res.status(500).send('Internal Server Error');
    }
});

module.exports = { isLogin, isLogout };
