const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema


const couponSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        unique: true,
        uppercase: true,
        required: true,
        minlength: [6, "To short"],
        maxlength: [12, "To long"]
    },
    expiry: {
        type: Date,
        required: true
    },
    discount: {
        type: Number,
        required: true
    }
},
    { timestamps: true }
);

module.exports = mongoose.model('Coupon', couponSchema);


