const Product = require('../models/product');
const User = require('../models/user');
const Cart = require('../models/cart');
const Coupon = require('../models/coupon');

exports.userCart = async (req, res) => {
    try {
        const { cart } = req.body;

        let products = [];

        const user = await User.findOne({ email: req.user.email }).exec();

        let cartExistingByUser = await Cart.findOne({ orderBy: user._id }).exec();

        if (cartExistingByUser) {
            await Cart.deleteOne({ orderBy: user._id }).exec();
            console.log('removed old cart');
        }

        for (let i = 0; i < cart.length; i++) {
            let object = {};

            object.product = cart[i]._id;
            object.count = cart[i].count;
            object.color = cart[i].color;

            let productFromDb = await Product.findById(cart[i]._id).select("price").exec();
            object.price = productFromDb.price;
            products.push(object);
        }

        let cartTotal = 0;
        for (let i = 0; i < products.length; i++) {
            cartTotal = cartTotal + products[i].price * products[i].count;
        }

        let newCart = await new Cart({
            products,
            cartTotal,
            orderBy: user._id,
        }).save();

        console.log("new cart", newCart);
        res.json({ ok: true });
    } catch (error) {
        console.error("Error in userCart:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


exports.getUserCart = async (req, res) => {
    try {
        // Check if req.user is defined before accessing its properties
        if (!req.user || !req.user.email) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await User.findOne({ email: req.user.email }).exec();

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const cart = await Cart.findOne({ orderBy: user._id })
            .populate("products.product", '_id title price totalAfterDiscount')
            .exec();

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found for the user' });
        }

        const { products, cartTotal, totalAfterDiscount } = cart;

        res.json({ products, cartTotal, totalAfterDiscount });
    } catch (error) {
        console.error("Error in getUserCart:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.emptyCart = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email }).exec();
        const cart = await Cart.findOneAndRemove({ orderBy: user._id }).exec();

        // Check if cart is found and removed successfully
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found for the user' });
        }

        res.json(cart);
    } catch (error) {
        console.error("Error in emptyCart:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


exports.saveAddress = async (req, res) => {
    try {
        const userAddress = await User.findOneAndUpdate({ email: req.user.email },
            { address: req.user.address }).exec()

        res.json({ ok: true })
    } catch (error) {
        console.error("Error in saveAddress:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}


exports.applyCouponToUserCart = async (req, res) => {
    try {
        const { coupon } = req.body;
        const validCoupon = await Coupon.findOne({ name: coupon }).exec()

        if (validCoupon === null) {
            return res.json({
                err: 'Invalid Coupon',
            });
        }

        const user = await User.findOne({ email: req.user.email }).exec()

        let { products, cartTotal } = await Cart.findOne({ orderBy: user._id })
            .populate('products.product', '_id title price').exec()

        let totalAfterDiscount = (cartTotal - (cartTotal * validCoupon.discount) / 100).toFixed(2)
        Cart.findOneAndUpdate({ orderBy: user._id }, { totalAfterDiscount }, { new: true });

        res.json(totalAfterDiscount)
    } catch (error) {
        console.error("Error in applyCoupon:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}