const Product = require('../models/productModel');
const asyncHandler = require('express-async-handler');
const Category = require('../models/categoryModel');

const loadOffer = asyncHandler(async (req, res) => {
    try {
        const category = await Category.find();
        res.render('add-Offer', { categories: category, message: '' });
    } catch (error) {
        console.error(error);
    }
});

const updateOffer = asyncHandler(async (req, res) => {
    try {
        const { offerPercentage, category } = req.body;
        const categories = await Category.find();
        const findCategory = await Category.findOne({ name: category });
        const categoryId = findCategory._id;
        // Update products within the selected category with the new offer percentage
        const updateOffer = await Product.updateMany({ category: categoryId }, { $set: { offer: offerPercentage } });
        if (updateOffer) {
            // Update sale price for products in the category
            const products = await Product.find({ category: categoryId });
            products.forEach(async (product) => {
                const updatedSalePrice = product.regularPrice - product.regularPrice * (offerPercentage / 100);
                product.salePrice = updatedSalePrice;
                await product.save();
            });
            res.render('add-Offer', { categories: categories, message: 'Offer Added' });
        }
    } catch (error) {
        console.error(error);
    }
});

const offerList = asyncHandler(async (req, res) => {
    try {
        const productsWithOffer = await Product.find({ offer: { $gt: 0 } }).populate('category');
        const offerList = productsWithOffer.reduce((acc, product) => {
            const existingCategory = acc.find((item) => item.category === product.category.name);
            if (existingCategory) {
            } else {
                acc.push({
                    category: product.category.name,
                    offerPercentage: product.offer,
                });
            }
            return acc;
        }, []);

        //console.log('offerlist', offerList);
        res.render('offer-List', { offerList });
    } catch (error) {
        console.error(error);
    }
});

module.exports = { loadOffer, updateOffer, offerList };
