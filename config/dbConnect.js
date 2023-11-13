const mongoose=require("mongoose")

const dbConnect=()=>{
  try{
    mongoose.connect(process.env.MONGODB_URL)
    console.log(`Database Connected`);
  }catch(error){
    console.error(`Database Connection Failed`);
  }

}
module.exports=dbConnect