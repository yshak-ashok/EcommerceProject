const User = require("../models/userModel");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Address = require("../models/addressModel");
const Cart=require("../models/cartModel")
const Wishlist=require("../models/wishlistModel")
const asyncHandler = require("express-async-handler");


//load wishlist

const wishlist = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    const user_Id = user._id;
    const userCart = await Cart.findOne({ userId: user_Id });
    const category = await Category.find();
    const userCartCount = userCart ? userCart.products.reduce((acc, product) => acc + product.quantity, 0) : 0;
    let wishlist = await Wishlist.findOne({ userId: user_Id }).populate('products.productId');
    if (!wishlist || !wishlist.products || wishlist.products.length === 0) {
      wishlist = new Wishlist({ userId: user_Id, products: [] });
      await wishlist.save();
    }
    res.render('wishlist', { user, wishlist: wishlist.products, cartCount: userCartCount,category });

  } catch (error) {
    console.error(error);
    res.render('error', { errorMessage: 'Error displaying the wishlist' });
  }
});




const addtowishlist = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);

    if (user) {
      const productId = req.query.productId;
      const user_Id = user._id;
      let wishlist = await Wishlist.findOne({ userId: user_Id });

      if (!wishlist) {
        wishlist = new Wishlist({ userId: user_Id, products: [] });
        await wishlist.save();
      }
      if (wishlist) {
        const findProduct = wishlist.products.findIndex(
          (product) => product.productId.toString() === productId
        );
        if (findProduct === -1) {
          wishlist.products.push({
            productId: productId,
            date: Date.now(),
          });
          await wishlist.save();
          res.json({ status: 'success' });
        } else {
          res.json({ status: 'error' });
        }
      }
    } else {
      res.json({ status: 'Login' });
      return; // Add this return statement to exit the function early.
    }
  } catch (error) {
    console.error('error');
  }
});

//remove item from wishlist

const removeWishlist = asyncHandler(async (req, res) => {
  try {
    const productId = req.query.productId; 
    const user = await User.findById(req.session.userId);
    const user_Id = user._id;
    const updatedWishlist = await Wishlist.findOneAndUpdate(
      { userId: user_Id },
      { $pull: { products: { productId: productId } } },
      { new: true }
    );
    
      res.redirect('/wishlist')
   
  } catch (error) {
    console.error(error);
   
  }
});





module.exports={wishlist,addtowishlist,removeWishlist}