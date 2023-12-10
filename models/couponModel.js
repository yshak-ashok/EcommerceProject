const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const couponSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
    },
    discount: {
        type: Number,
        required: true,
    },
    minOrderAmount: {
        type: Number,
        required: true,
    },
    createdOn: {
        type: Date,
        required: true,
        default: Date.now,
    },
    expirationDate: {
        type: Date,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
        required: true,
    },
});

module.exports = mongoose.model('Coupon', couponSchema);
