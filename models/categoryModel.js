const mongoose=require('mongoose')

var categorySchema=new mongoose.Schema({
    image:{
      type:String,
      required:true,
    },
    name:{
      type:String,
      required:true,
    },
    description:{
      type:String,
      required:true,
    },
    status:{
      type:Boolean,
      default:true
    }
    
})

module.exports=mongoose.model('Category',categorySchema)