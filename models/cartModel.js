const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                default: 1,
            },
            total: {
                type: Number,
                default: 0,
            },
            regularprice: {
                type: Number,
                default: 0,
            },
        },
    ],
});

module.exports = mongoose.model('Cart', cartSchema);
