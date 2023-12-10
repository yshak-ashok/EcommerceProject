const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const asyncHandler = require('express-async-handler');
const fs = require('fs');
const path = require('path');
const { image } = require('pdfkit');

const loadAddProduct = asyncHandler(async (req, res) => {
    try {
        const category = await Category.find();
        if (category) {
            res.render('add-Products', { categories: category, Message: '' });
        }
    } catch (error) {
        console.log(error.message);
    }
});

// add Products

const addProducts = async (req, res) => {
    try {
        const { productName, description, category, stock, regularPrice, size } = req.body;
        const images = [];
        req.files.forEach((file) => {
            images.push(file.filename);
        });
        const findCategory = await Category.findOne({ name: category });
        const categoryId = findCategory._id;
        const productData = await Product.create({
            productName: productName,
            description: description,
            category: categoryId,
            stock: stock,
            size: size,
            regularPrice: regularPrice,
            salePrice: regularPrice,
            images: images,
        });
        await productData.save();
        const categoryList = await Category.find();
        res.render('add-Products', { categories: categoryList, Message: 'Product Added Successfullly' });
    } catch (error) {
        console.log(error.message);
    }
};

//view poducts

const productList = asyncHandler(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const perPage = 6;
        const totalProduct = await Product.countDocuments();
        const totalPages = Math.ceil(totalProduct / perPage);
        const products = await Product.find({ is_listed: true })
            .skip((page - 1) * perPage)
            .limit(perPage)
            .populate('category');
        // console.log(products);
        res.render('product-List', { products, currentPage: page, totalPages });
    } catch (error) {
        console.error(error); // Log the actual error for debugging
        //res.render('error', { errorMessage: 'Something went wrong' });
    }
});

// const listProduct=asyncHandler(async(req,res)=>{
//    try{
//      const productId=req.query.id
//      const listproduct= await Product.findByIdAndUpdate(productId,{is_listed:true},{new:true})
//      if(listproduct){
//        res.redirect('/admin/productList')
//      }

//    }catch(error){
//      console.error('Error');
//    }
//  })

const unListProduct = asyncHandler(async (req, res) => {
    try {
        const productId = req.query.id;
        const unlistproduct = await Product.findByIdAndUpdate(productId, { is_listed: false }, { new: true });
        if (unlistproduct) {
            res.redirect('/admin/productList');
        }
    } catch (error) {
        console.error('Error');
    }
});

const loadEditProduct = asyncHandler(async (req, res) => {
    try {
        const id = req.query.id;
        //console.log(id);
        const productData = await Product.findById(id).populate('category'); //id= category
        //console.log(productData);
        if (productData) {
            const categories = await Category.find();
            res.render('edit-Product', { productData, categories, message: '' });
        } else {
        }
    } catch (error) {
        res.render('404');
    }
});

const updateProduct = async (req, res) => {
    try {
        const { productName, description, regularPrice, stock, size, categoryId, id } = req.body;
        let images = [];
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                images.push(req.files[i].filename);
            }
        }
        const product = await Product.findById(id);
        if (images.length) {
            const existingImage = product.images.length;
            const uploadingImage = images.length;
            if (existingImage <= 4) {
                const totalImages = existingImage + uploadingImage;
                if (totalImages > 4) {
                    const productData = await Product.findById(id).populate('category');
                    const categories = await Category.find();
                    return res.render('edit-Product', {
                        productData,
                        categories,
                        message: 'Maximum four images are allowed',
                    });
                }
            }
        }
        // Only update images if new images exist
        if (images.length > 0) {
            images = [...product.images, ...images];
        } else {
            images = product.images;
        }
        const existingImage = product.images.length;
        if (existingImage < 2 && images.length < 2) {
            const productData = await Product.findById(id).populate('category');
            const categories = await Category.find();
            return res.render('edit-Product', {
                productData,
                categories,
                message: 'Atleast two images required',
            });
        } else {
            const updateFields = {
                productName,
                description,
                regularPrice,
                salePrice: regularPrice,
                stock,
                size,
                category: categoryId,
                images,
            };
            // Update the product
            const updatedData = await Product.findByIdAndUpdate(id, { $set: updateFields });
            // Check and update sale price if offer exists
            if (product.offer && product.offer > 0) {
                const updatedSalePrice = regularPrice - regularPrice * (product.offer / 100);
                updateFields.salePrice = updatedSalePrice;
                await Product.findByIdAndUpdate(id, { $set: { salePrice: updatedSalePrice } });
            }
            if (updatedData) {
                res.redirect('/admin/productList');
            } else {
                // Handle scenario if the update fails
            }
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'An error occurred' });
    }
};

const deleteImage = async (req, res) => {
    try {
        const { productId, imageIndex } = req.body;
        const indexToRemove = parseInt(imageIndex, 10);
        // Find the product by ID
        const product = await Product.findById(productId);
        if (!product) {
            return res.json({ status: 'fail', message: 'Product not found' });
        }
        if (indexToRemove >= 0 && indexToRemove < product.images.length) {
            const imageNameToRemove = product.images[indexToRemove];
            // Delete the image file from local storage
            const imagePath = path.join('public/admin-assets/imgs/products', imageNameToRemove);
            fs.unlinkSync(imagePath);
            // Update the database by pulling the image name from the array
            const result = await Product.updateOne({ _id: productId }, { $pull: { images: imageNameToRemove } });
            if (result.modifiedCount > 0) {
                res.json({ status: 'success', message: 'Image removed successfully' });
            } else {
                res.json({ status: 'fail', message: 'Image not found or already removed' });
            }
        } else {
            res.json({ status: 'fail', message: 'Invalid image index' });
        }
    } catch (error) {
        console.error(error);
        res.json({ status: 'fail', message: 'Internal server error' });
    }
};

module.exports = { loadAddProduct, addProducts, productList, unListProduct, loadEditProduct, updateProduct, deleteImage };
