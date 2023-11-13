const Razorpay=require('razorpay')
const Crypto=require('crypto')
const Order=require('../models/orderModel')
const { resolve } = require('path')

var instance=new Razorpay({
  key_id:process.env.RAZORPAY_KEY_ID,
   key_secret:process.env.RAZORPAY_SECRET_ID
  })

  const generateRazorpay = async(orderId,total)=>{
    return new Promise((resolve,reject)=>{
      var options = {
        amount: total * 100,  // amount in the smallest currency unit
        currency: "INR",
        receipt: orderId
      };
      instance.orders.create(options, function(err, order) {
        console.log("Order form Razorpay",order);
        resolve(order)
      });

    })

  }
  const verifyOnlinePayment = async(details)=>{
    console.log('VerifyOnlinPayment: ',details);
    return new Promise((resolve,reject)=>{
       let hmac = Crypto.createHmac('sha256',process.env.RAZORPAY_SECRET_ID);
       // Merging the two id's that come from the client side
       // console.log('Razorpay order Id : ',details.payment.razorpay_order_id);
       // console.log('Razorpay Payment Id : ',details.payment.razorpay_payment_id);
       hmac.update(details.payment.razorpay_order_id+'|'+details.payment.razorpay_payment_id);
       // Converted to string format
       hmac = hmac.digest('hex');
       // console.log(hmac);
       // Compare the two hex code that come from the razorpay signature and created hex
       // console.log(details.payment.razorpay_signature)
       if(hmac == details.payment.razorpay_signature){
          // If it matches we resolve it 
          resolve();
       }else{
          // Doesn't match we reject
          reject();
       }
    })
 }
 
 const updatePaymentStatus = (orderId,paymentStatus)=>{
    return new Promise(async(resolve,reject)=>{
       try {
          if(paymentStatus){
             const orderUpdate = await Order.findByIdAndUpdate({ _id: new Object(orderId) },{ $set: {orderStatus: 'Order Placed', 'products.$[].productStatus': 'Order Placed' } },{ multi: true }  )
             .then(()=>{
                resolve();
             });
          }else{
             const orderUpdate = await Order.findByIdAndUpdate({_id:new Object(orderId)},{$set:{orderStatus:'Order Failed'}})
             .then(()=>{
                resolve()
             });
          }
       } catch (error) {
          reject(error);
          console.log(error.message);
       }
    })
 }





  module.exports={generateRazorpay,verifyOnlinePayment,updatePaymentStatus}