const mongoose = require('mongoose'); // Erase if already required
const bcrypt = require('bcrypt');

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    mobile:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true,
    },
    is_admin:{
      type:Boolean,
      default:false,
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    isActive: {
        type: Boolean,
        default: false,
    },
    isVerified:{
        type:Boolean,
        default:false,
    },
    refferalCode:{
        type:String,
        unique:true
    }



});

// userSchema.pre('save', async function (next) {
//     const salt = await bcrypt.genSaltSync(10);
//     this.password = await bcrypt.hash(this.password, salt);
// });



userSchema.methods.isPasswordMatched = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};


//Export the model
module.exports = mongoose.model('User', userSchema);