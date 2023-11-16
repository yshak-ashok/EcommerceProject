const User = require('../models/userModel');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Address = require('../models/addressModel');
const Cart = require('../models/cartModel');
const Coupon = require('../models/couponModel');
const Wallet = require('../models/walletModel');
const Banner = require('../models/bannerModel');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');

//------user home page------

const home = asyncHandler(async (req, res) => {
    try {
        const productData = await Product.find({ is_listed: true }).populate('category').sort({ date: -1 }).limit(4);
        const allProductData = await Category.find({ status: true });

        const user = await User.findById(req.session.userId);
        const bannerData = await Banner.find({ isActive: true }); // Query only active banners
        console.log('banner:', bannerData);
        if (user && !user.isBlocked) {
            const userCart = await Cart.findOne({ userId: user._id });

            if (userCart) {
                const userCartCount = userCart.products.reduce((acc, product) => {
                    return (acc += product.quantity);
                }, 0);

                res.render('home', {
                    user: user,
                    products: productData,
                    allProducts: allProductData,
                    cartCount: userCartCount,
                    bannerData,
                });
            } else {
                res.render('home', {
                    user: user,
                    products: productData,
                    allProducts: allProductData,
                    cartCount: 0,
                    bannerData,
                });
            }
        } else {
            if (user) {
                await User.findByIdAndUpdate(user, { isActive: false });
            }
            req.session.userId = null;
            res.render('home', {
                user: '',
                products: productData,
                allProducts: allProductData,
                cartCount: 0,
                bannerData,
            });
        }
    } catch (error) {
        console.error(error);
        res.render('error', { errorMessage: 'Something went wrong' });
    }
});

//---------Load LoginPage-------

const userSignIn = asyncHandler(async (req, res) => {
    try {
        res.render('login', { errorMessage: '' });
    } catch (error) {
        console.error(error);
        res.render('error', { errorMessage: 'Something went wrong' });
    }
});

//-------Load Registratiion Page-----

const userSignUp = asyncHandler(async (req, res) => {
    try {
        res.render('register', { errorMessage: '' });
    } catch (error) {
        console.error(error);
        res.render('error', { errorMessage: 'Something went wrong' });
    }
});

//-----------user Login-------

const userLogin = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;
        const findUser = await User.findOne({ email });
        // console.log("Userverified:", findUser);
        // console.log("Userverified:", findUser.isVerified);
        if (!findUser) {
            return res.json({ errorMessage: 'You have to register the account' });
        } else {
            const isPasswordValid = await bcrypt.compare(password, findUser.password);
            if (!isPasswordValid) {
                return res.json({ errorMessage: 'invalid Email or Password' });
            }
            if (!findUser.isVerified) {
                req.session.userEmail = findUser.email;
                await sendOtpEmail(req, email);
                res.json({ notVerified: 'Registration not completed, Please verify OTP' });
            }
            if (findUser.isBlocked) {
                req.session.userId = null;
                return res.json({ errorMessage: 'You are blocked, Contact i Store support team.' });
            }
            if (isPasswordValid && !findUser.isBlocked && findUser.isVerified) {
                //console.log("success");
                req.session.userId = findUser._id;
                await User.findByIdAndUpdate(findUser._id, { isActive: true });
                return res.json({ message: 'Login Successful' });
            }
        }
    } catch (error) {
        console.error(error);
    }
});

const emailOTP = asyncHandler(async (req, res) => {
    try {
        const email = req.session.userEmail;
        if (!email) {
            res.redirect('/login');
            //res.render("emailOTP", { errorMessage: "Cannot find Email." });
        } else {
            //console.log("emailotp userData", userData);
            res.render('emailOTP', { userEmail: email, errorMessage: '' });
        }
    } catch (error) {
        console.error(error);
    }
});

// Resend OTP create user
const resendOtp = asyncHandler(async (req, res) => {
    try {
        const email = req.session.userEmail;
        if (!email) {
            res.render('emailOTP', { errorMessage: 'Cannot find Email.' });
        } else {
            console.log('email', email);
            await sendOtpEmail(req, email);
            res.render('emailOTP', { errorMessage: 'OTP has been resent.' });
        }
    } catch (error) {
        console.error(error);
    }
});

//Refferal code generating
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < length; i++) {
        randomString += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return randomString;
}

// Generate a referral code
function generateReferralCode() {
    const codeLength = 8; // You can adjust the length of the referral code as needed
    return generateRandomString(codeLength);
}

// Update createNewUser to handle OTP resend

const createNewUser = asyncHandler(async (req, res) => {
    const { username, email, mobile, password, refferal } = req.body;
    let validReferral = true; // Boolean to track the validity of the referral code
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        res.render('register', { errorMessage: 'User already exists' });
    } else {
        if (refferal) {
            // Check if referral code is provided
            const findRefferal = await User.findOne({ refferalCode: refferal });
            console.log('refferal', refferal);

            if (findRefferal) {
                try {
                    req.session.refferalUerId = findRefferal._id;
                    console.log('refferUerId:', req.session.refferalUerId);
                } catch (error) {
                    console.error('Error occurred while processing referral:', error);
                }
            } else {
                validReferral = false; // Update the validity of the referral code
                res.render('register', { errorMessage: 'Referral Code is not Valid' });
                // You can render an error message or handle the situation as needed
            }
        }

        if (validReferral) {
            try {
                const refferalCode = generateReferralCode();
                const hashedPassword = await bcrypt.hash(password, 10);
                const userData = new User({
                    username,
                    email,
                    mobile,
                    password: hashedPassword,
                    refferalCode: refferalCode,
                });
                await userData.save();
                req.session.userEmail = userData.email;

                // Attempt to send the email
                try {
                    await sendOtpEmail(req, email);
                    res.render('emailOTP', { errorMessage: '' });
                } catch (emailError) {
                    console.error('Error sending email:', emailError);
                    // Notify the user about the email sending failure
                    res.render('register', { errorMessage: 'Failed to send verification email. Please try again later.' });
                    // You can also log this error or implement further actions, such as retry mechanisms
                }
            } catch (error) {
                console.error('Error creating user:', error);
                // Handle any potential error during user creation (e.g., database errors)
                res.render('register', { errorMessage: 'User creation failed. Please try again.' });
            }
        }
    }
});

// Send OTP email with error handling
async function sendOtpEmail(req, email) {
    try {
        const otp = otpGenerator.generate(4, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.AUTH_EMAIL,
                pass: process.env.AUTH_PASS,
            },
            secure: true,
        });
        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: 'Verify Email',
            text: `Hi Customer, Please enter the OTP ${otp} to create your new istore account.`,
        };
        req.session.emailOTP = otp;
        req.session.otpExpirationTime = Date.now() + 60000; // OTP expires in 1 minute

        await transporter.sendMail(mailOptions);
    } catch (emailError) {
        throw new Error('Email sending error: ' + emailError.message);
    }
}

// after otp generate email verified(from 'emailOTP')

const emailVerified = asyncHandler(async (req, res) => {
    try {
        const emailOTP = req.session.emailOTP;
        const otpExpirationTime = req.session.otpExpirationTime;

        // Check if OTP has expired
        if (Date.now() > otpExpirationTime) {
            return res.json({ errorMessage: 'OTP has expired. Please request a new OTP.' });
        }

        const { num1, num2, num3, num4 } = req.body;
        const userOTP = num1 + num2 + num3 + num4;
        console.log('useremail:', req.session.userEmail);
        if (userOTP == emailOTP) {
            const findUser = await User.findOne({ email: req.session.userEmail });

            if (!findUser) {
                return res.json({ errorMessage: 'Cannot find user. Please Register Again' });
            }

            if (findUser.isVerified) {
                return res.json({ errorMessage: 'Email already Verified' });
            }

            if (findUser && !findUser.isVerified) {
                const user_id = findUser._id;

                let userWallet = await Wallet.findOne({ userId: user_id });
                if (!userWallet) {
                    userWallet = new Wallet({ userId: user_id });
                    await userWallet.save();
                }

                if (req.session.refferalUerId) {
                    let refferalUserWallet = await Wallet.findOne({ userId: req.session.refferalUerId });

                    if (refferalUserWallet && userWallet) {
                        const referralAmount = 50;

                        refferalUserWallet.walletAmount += referralAmount;
                        userWallet.walletAmount += referralAmount;

                        refferalUserWallet.transactionHistory.push({
                            description: 'Referral amount',
                            addedAmount: referralAmount,
                            debitOrCredit: 'Credit',
                        });

                        userWallet.transactionHistory.push({
                            description: 'Referral amount',
                            addedAmount: referralAmount,
                            debitOrCredit: 'Credit',
                        });

                        await refferalUserWallet.save();
                        await userWallet.save();
                    }
                }

                await User.findByIdAndUpdate(findUser._id, { isVerified: true });

                req.session.userEmail = null;
                req.session.refferalUerId = null;

                return res.json({ message: 'OTP verified, Registration Successful' });
            }
        } else {
            return res.json({ errorMessage: 'Invalid OTP. Please try again.' });
        }
    } catch (error) {
        console.error('Error in email verification:', error);
        return res.status(500).json({ errorMessage: 'An error occurred during email verification' });
    }
});

//------forgotpassword-----

const forgotPassword = asyncHandler(async (req, res) => {
    res.render('verifyEmail', { errorMessage: '' });
});

const loadNewPassword = asyncHandler(async (req, res) => {
    res.render('newPassword', { errorMessage: '' });
});

//------verify email for forgot password---

const verifyEmail = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const findUser = await User.findOne({ email });
    if (!findUser) {
        return res.render('verifyEmail', { errorMessage: 'You are not an existing user' });
    }
    req.session.forgotemail = req.body.email;
    //console.log(req.session.forgotemail);
    await sendOtpEmail(req, email);

    res.render('forgotOTP', { errorMessage: '' });
});

const verifyForgotOTP = asyncHandler(async (req, res) => {
    const storedotp = req.session.emailOTP;
    //console.log("mail", storedotp);
    const otpExpirationTime = req.session.otpExpirationTime;
    const verifiedEmail = req.session.forgotemail;
    // Check if OTP has expired
    if (Date.now() > otpExpirationTime) {
        return res.json({ errorMessage: 'OTP has expired. Please request a new OTP.' });
    }
    const { num1, num2, num3, num4 } = req.body;
    const enteredOtp = num1 + num2 + num3 + num4;
    //console.log("user", enteredOtp);
    if (enteredOtp == storedotp && verifiedEmail) {
        req.session.emailOTP = null;
        return res.json({ message: 'OTP Verified' });
    } else {
        return res.json({ errorMessage: 'invalid your OTP' });
    }
});
// Resend OTP forgot password
const resendforgotOtp = asyncHandler(async (req, res) => {
    const email = req.session.forgotemail;
    await sendOtpEmail(req, email);
    res.render('forgotOTP', { errorMessage: 'OTP has been resent.' });
});

const newPassword = asyncHandler(async (req, res) => {
    try {
        const { newpass, confirmpass } = req.body;
        console.log('newpass:', newpass);
        console.log('confirmpass:', confirmpass);
        const userEmail = req.session.forgotemail;
        //console.log(userEmail);
        const user = await User.findOne({ email: userEmail });
        if (!userEmail) {
            return res.render('newPassword', { errorMessage: 'Email not Verified ' });
        } else {
            if (newpass !== confirmpass) {
                return res.render('newPassword', { errorMessage: 'Passwords do not match' });
            }
            const hashedPassword = await bcrypt.hash(newpass, 10);
            await User.findByIdAndUpdate(user._id, { password: hashedPassword }, { new: true });
            req.session.forgotemail = null;
            return res.redirect('/login');
        }
    } catch (error) {
        console.error(error);

        return res.render('newPassword', { errorMessage: 'Something went wrong' });
    }
});

//----------view product---------

const viewProduct = asyncHandler(async (req, res) => {
    try {
        const productid = req.query.id;
        const user = await User.findById(req.session.userId);

        const productData = await Product.findById(productid).populate('category');
        const categoryId = productData.category._id;
        const similarProducts = await Product.find({ category: categoryId });

        if (productData && user && !user.isBlocked) {
            const userCart = await Cart.findOne({ userId: user._id });

            if (userCart) {
                const userCartCount = userCart.products.reduce((acc, product) => {
                    return (acc += product.quantity);
                }, 0);

                res.render('view-Product', {
                    user: user,
                    products: productData,
                    similarProducts: similarProducts,
                    cartCount: userCartCount,
                });
            } else {
                res.render('view-Product', {
                    user: user,
                    products: productData,
                    similarProducts: similarProducts,
                    cartCount: 0, // Set the cartCount to 0 if the user's cart is empty
                });
            }
        } else {
            if (user) {
                await User.findByIdAndUpdate(user, { isActive: false });
            }
            req.session.userId = null;
            res.render('view-Product', {
                user: '',
                products: productData,
                similarProducts: similarProducts,
                cartCount: 0, // Set the cartCount to 0 if the user is not valid
            });
        }
    } catch (error) {
        console.error(error);
        res.render('404');
    }
});

//---------view all products-------
const allProducts = asyncHandler(async (req, res) => {
    try {
        const categoryId = req.query.id;
        const page = parseInt(req.query.page) || 1;
        const perPage = 6;
        const totalProducts = await Product.countDocuments({ is_listed: true });
        const totalPages = Math.ceil(totalProducts / perPage);
        const category = await Category.find();
        //console.log("category",category);
        const user = await User.findById(req.session.userId);
        const userCart = await Cart.findOne({ userId: user ? user._id : null });
        const userCartCount = userCart ? userCart.products.reduce((acc, product) => acc + product.quantity, 0) : 0;
        const cartCount = userCartCount;

        const products = await Product.find({ is_listed: true })
            .skip((page - 1) * perPage)
            .limit(perPage);

        //console.log("products", products);

        res.render('all-Products', {
            user,
            products,
            currentPage: page,
            totalPages,
            cartCount,
            category,
            categoryId,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

const filterCategory = asyncHandler(async (req, res) => {
    try {
        const categoryId = req.query.id;
        const page = parseInt(req.query.page) || 1;
        const perPage = 6;

        const totalProducts = await Product.countDocuments({ is_listed: true, category: categoryId });
        const totalPages = Math.ceil(totalProducts / perPage);
        const category = await Category.find();
        const user = await User.findById(req.session.userId);
        const userCart = await Cart.findOne({ userId: user ? user._id : null });
        const userCartCount = userCart ? userCart.products.reduce((acc, product) => acc + product.quantity, 0) : 0;
        const cartCount = userCartCount;

        const products = await Product.find({ is_listed: true, category: categoryId })
            .skip((page - 1) * perPage)
            .limit(perPage);
        // console.log("products",products);
        if (products) {
            res.render('all-Products', {
                user,
                products,
                currentPage: page,
                totalPages,
                cartCount,
                category,
                categoryId,
            });
        }
    } catch (error) {
        // Handle the error
        console.error(error);
        res.render('404');
    }
});

const categoryPage = asyncHandler(async (req, res) => {
    try {
        const selectedCategory = req.query.id;
        const findCategory = await Category.find({ _id: selectedCategory });
        const category = findCategory[0].name;
        const user = await User.findById(req.session.userId);
        const productsByCategory = await Product.find({
            category: selectedCategory,
            is_listed: true,
        });

        if (user && !user.isBlocked) {
            const userCart = await Cart.findOne({ userId: user._id });

            if (userCart) {
                const userCartCount = userCart.products.reduce((acc, product) => {
                    return (acc += product.quantity);
                }, 0);
                const cartCount = userCartCount;

                res.render('categorypage', { user, category: category, products: productsByCategory, cartCount });
            } else {
                res.render('categorypage', { user: '', category: category, products: productsByCategory, cartCount: 0 });
            }
        } else {
            res.render('categorypage', { user: '', category: category, products: productsByCategory, cartCount: 0 });
        }
    } catch (error) {
        console.error(error);
        res.render('404');
    }
});

const searchProducts = async (req, res) => {
    try {
        let regex = req.body.regex;
        console.log('searchreult', regex);
        const products = await Product.find({ is_listed: true, productName: { $regex: regex, $options: 'i' } });
        res.json({ products });
    } catch (error) {
        console.log(error.message);
    }
};

//user profile

const userProfile = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        const userCart = await Cart.findOne({ userId: user._id });
        if (user) {
            if (userCart) {
                const userCartCount = userCart.products.reduce((acc, product) => {
                    return (acc += product.quantity);
                }, 0);
                const cartCount = userCartCount;
            
            res.render('user-Profile', { user,cartCount });
            }
        }
    } catch (error) {
        console.error('error');
    }
});

//user edit profile

const editUserProfile = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        const userCart = await Cart.findOne({ userId: user._id });
        if (user) {
            if (userCart) {
                const userCartCount = userCart.products.reduce((acc, product) => {
                    return (acc += product.quantity);
                }, 0);
                const cartCount = userCartCount;
            
            res.render('edit-User-Profile', { user,cartCount });
            }
        }
    } catch (error) {
        console.error('error');
    }
});

//user update profile

const updateUserProfile = asyncHandler(async (req, res) => {
    try {
        const { username, email, mobile } = req.body;
        console.log(username);
        const userId = await User.findById(req.session.userId);
        const updateData = await User.findByIdAndUpdate(userId, {
            $set: { username: username, email: email, mobile: mobile },
        });
        if (updateData) {
            res.redirect('/userProfile');
        }
    } catch (error) {
        console.error('error');
    }
});

//user change password

const changePassword = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        res.render('changePassword', { user, errorMessage: '' });
    } catch (error) {
        console.error('error');
    }
});

//user passwordupdate

const updatePassword = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        console.log('start');
        const { oldpass, newpass, confirmpass } = req.body;
        console.log('oldpassword', oldpass);
        const finduser = await User.findById(user);

        if (!finduser) {
            return res.json({ errorMessage: 'User not found' });
        }
        const checkPassword = await bcrypt.compare(oldpass, finduser.password);
        if (checkPassword) {
            if (newpass === confirmpass) {
                const hashPass = await bcrypt.hash(newpass, 12); // Use a higher number of rounds for stronger security.
                const updatePass = await User.findByIdAndUpdate(user._id, { password: hashPass }, { new: true });
                if (updatePass) {
                    return res.json({ message: 'Password Successfully Updated' });
                } else {
                    return res.json({ errorMessage: 'Password not updated' });
                }
            } else {
                return res.json({ errorMessage: 'Passwords do not match' });
            }
        } else {
            return res.json({ errorMessage: 'Incorrect old password' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
});

//user address
const userAddress = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        let userDetail = await Address.findOne({ userId: user._id });
        const user_Id = user._id;
        const userCart = await Cart.findOne({ userId: user._id });
        if(user){
        if (!userDetail) {
            userDetail = new Address({ userId: user_Id, address: [] });
            await userDetail.save();
        }
        //const userAddress=userDetail.address
        //console.log('useraddress:',userAddress.address);
        //console.log(userAddress[0].name);
        const userCartCount = userCart.products.reduce((acc, product) => {
            return (acc += product.quantity);
        }, 0);
        const cartCount = userCartCount;
        res.render('user-Address', { user, userAddress: userDetail.address, Message: '' ,cartCount});
    }
    } catch (error) {
        console.error('error');
    }
});
const loadAddAddress = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        const userCart = await Cart.findOne({ userId: user._id });
        if(user){
        const userCartCount = userCart.products.reduce((acc, product) => {
            return (acc += product.quantity);
        }, 0);
        const cartCount = userCartCount;
        res.render('add-Address', { user, Message: '',cartCount });
    }
    } catch (error) {
        console.error('error');
    }
});

const addNewAddress = asyncHandler(async (req, res) => {
    try {
        const { name, mobile, homeAddress, city, street, postalCode } = req.body;
        // console.log(name);
        // console.log(postalCode);
        // console.log(homeAddress);
        // console.log(mobile);
        // console.log(city);
        // console.log(street);
        const userAddress = {
            name: name,
            mobile: mobile,
            homeAddress: homeAddress,
            city: city,
            street: street,
            postalCode: postalCode,
            isDefault: false,
        };
        //console.log(userAddress);
        const user = await User.findById(req.session.userId);
        const user_Id = user._id;
        // console.log(user_Id);
        let addressID = await Address.findOne({ userId: user_Id });
        //console.log(addressID);
        if (!addressID) {
            userAddress.isDefault = true;
            //console.log(userAddress);
            addressID = new Address({ userId: user_Id, address: [userAddress] });
            //console.log(addressID);
        } else {
            addressID.address.push(userAddress);

            if (addressID.address.length === 1) {
                addressID.address[0].isDefault = true;
            }
        }

        await addressID.save();
        // console.log(userAddress);
        // res.render("user-Address", { user, userAddress: addressID.address, Message: "" });
        return res.json({ message: 'Address Added' });
    } catch (error) {
        console.error('error');
    }
});

//edit address

const editAddress = asyncHandler(async (req, res) => {
    try {
        const addressId = req.query.addressId;
        const user = await User.findById(req.session.userId);
        const user_Id = user._id;
        //console.log('address:',addressId);
        const userDetails = await Address.findOne({ userId: user_Id });

        if (!userDetails) {
            // If userDetails is not found, render the "404" page
            return res.render('404');
        }

        const userAddress = userDetails.address.find((address) => {
            return address._id.toString() === addressId;
        });

        if (!userAddress) {
            // If userAddress is not found, render the "404" page
            return res.render('404');
        }

        res.render('edit-Address', { user, Message: '', userAddress });
    } catch (error) {
        res.render('404');
    }
});

//===============address update==================

const updateAddress = asyncHandler(async (req, res) => {
    try {
        const { name, mobile, homeAddress, city, street, postalCode, addressId } = req.body;
        const user = await User.findById(req.session.userId);
        const user_Id = user._id;
        console.log('addressId:', addressId);
        const updatedAddress = await Address.findOneAndUpdate(
            { userId: user_Id, 'address._id': addressId },
            {
                $set: {
                    'address.$.name': name,
                    'address.$.mobile': mobile,
                    'address.$.homeAddress': homeAddress,
                    'address.$.city': city,
                    'address.$.street': street,
                    'address.$.postalCode': postalCode,
                },
            },
            { new: true },
        );
        //console.log("update address", updateAddress);
        return res.json({ message: 'Address Successfully Updated' });
        //res.redirect("/user/userAddress");
    } catch (error) {
        console.error('error');
    }
});

//==============delete Address==================

const deleteAddress = asyncHandler(async (req, res) => {
    try {
        const addressId = req.query.addressId;
        console.log(addressId);
        const user = await User.findById(req.session.userId);
        const user_Id = user._id;
        const addressID = await Address.findOne({ userId: user_Id });
        //console.log('address id:',addressID);
        if (!addressID) {
            return res.render('user-Address', { user, userAddress: addressID.address, Message: '' });
        }
        const addressToDelete = addressID.address.find((address) => address._id.toString() === addressId);

        if (!addressToDelete) {
            return res.render('user-Address', { user, userAddress: addressID.address, Message: '' }); // Address not found, handle this case
        }
        if (addressToDelete.isDefault) {
            return res.render('user-Address', { user, userAddress: addressID.address, Message: '' }); // Default address cannot be deleted
        }
        // Remove the address from the addressID's address array
        addressID.address = addressID.address.filter((address) => address._id.toString() !== addressId);
        await addressID.save();
        res.redirect('/userAddress');
    } catch (error) {
        console.error('error');
    }
});

//============uer Wallet=======================

const walletLoad = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        const user_id = user._id;
        // Taking the wallet details from db
        let userWallet = await Wallet.findOne({ userId: user_id });
        if (!userWallet) {
        }
        res.render('wallet', { user, userWallet });
    } catch (error) {
        console.error(error);
    }
});

//-----user Logout------

const userLogout = asyncHandler(async (req, res) => {
    try {
        const userId = req.session.userId;
        if (userId) {
            // Set isActive to false when the user logs out
            await User.findByIdAndUpdate(userId, { isActive: false });
            req.session.userId = null;
        }
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.render('error', { errorMessage: 'Something went wrong' });
    }
});

module.exports = {
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
    filterCategory,
};
