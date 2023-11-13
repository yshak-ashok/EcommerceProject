const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
   ord:{
      type:String,
      default:function(){
         return Math.floor(100000 + Math.random() * 900000).toString();
      }
   },
   userId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'User',
   },
   date:{
      type:Date,
      default:Date.now,
      required:true,
   },
   
   totalAmount:{
      type:Number,
      required:true,
   },
   couponDiscountAmount:{
      type:Number,
      required:true
   },
   actualTotalAmount:{
      type:Number,
      required:true
   },
   paymentMethod:{
      type:String,
   },
   products:[{
      productId:{
         type:mongoose.Types.ObjectId,
         ref:'Product'
      },
      quantity:{
         type:Number,
      },
      salePrice:{
         type:Number,
      },
      total:{
         type:Number,
      },
      productStatus:{
         type:String,
         default:'Pending'
      },
      returnReason:{
         type:String,
         default:'No reason'
      }
   }],
   address:{
      name:{
         type:String,
         required:true,
      },
      mobile:{
         type:Number,
         required:true,
      },
      homeAddress:{
         type:String,
         required:true,
      },
      city:{
         type:String,
         required:true,
      },
      street:{
         type:String,
         required:true,
      },
      postalCode:{
         type:Number,
         required:true
      }
   },
   orderStatus:{
      type:String,
      default:'Pending',
   },
   returnOrderStatus:{
      status:{
         type:String,
         default:'Not requested'
      },
      reason:{
         type:String,
         default:'No reason'
      }
   }
})

module.exports = mongoose.model('Order',orderSchema);