const mongoose = require('mongoose');

const walletModel = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    walletAmount: {
        type: Number,
        default: 0,
    },
    transactionHistory: [
        {
            description: {
                type: String,
                required: true,
            },
            addedAmount: {
                type: Number,
                required: true,
            },
            debitOrCredit: {
                type: String,
                enum: ['Debit', 'Credit'],
                required: true,
            },
        },
    ],
});

module.exports = mongoose.model('Wallet', walletModel);
