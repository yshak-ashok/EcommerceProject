const asyncHandler=require('express-async-handler')
const User=require("../models/userModel")


const isLogin = asyncHandler(async (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/'); 
  }
  const user = await User.findById(req.session.userId);
  if (!user || user.isBlocked) {
    
    return res.redirect('/logout'); 
  }
  if(req.session.userId){
    next();
  }
 
  
});


const isLogout=asyncHandler(async(req,res,next)=>{
  const user = await User.findById(req.session.userId);
  if(user && ! user.isBlocked){
    res.redirect('/')
  }else{
    next()
  }
})








module.exports={isLogin,isLogout}