const Coupon = require('../models/coupon')
const slugify = require('slugify')

// create, remove, list 
exports.create = async (req, res) => {
    try {
        const { name, expiry, discount } = req.body.coupon;
        if (!name || !expiry || !discount) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        let createCoupon = await new Coupon({ name, expiry, discount }).save();
        res.status(201).json(createCoupon);
    } catch (error) {
        console.error("Error in create coupon:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


exports.remove = async (req, res) => {
    try {
        let removeCoupon = await Coupon.findByIdAndDelete(req.params.couponId).exec();
        res.json(removeCoupon)
    } catch (error) {
        console.error("Error in remove coupen:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

exports.list = async (req, res) => {
    try {
        let listAllCoupon = await Coupon.find({}).sort({ createdAt: -1 }).exec();

        res.json(listAllCoupon)
    } catch (error) {
        console.error("Error in list coupon:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}


