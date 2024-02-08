const Product = require('../models/product');
const User = require('../models/user');
const Cart = require('../models/cart');
const Coupon = require('../models/coupon');
const Order = require('../models/order');
const uniqueid = require('uniqueid')

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
        Cart.findOneAndUpdate({ orderBy: user._id }, { totalAfterDiscount }, { new: true }).exec();

        res.json(totalAfterDiscount)
    } catch (error) {
        console.error("Error in applyCoupon:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}


exports.createOrder = async (req, res) => {
    const { paymentIntent } = req.body.stripeResponse

    const user = await User.findOne({ email: req.user.email }).exec()
    let { products } = await Cart.findOne({ orderBy: user._id }).exec()

    let newOrder = await new Order({
        products,
        paymentIntent,
        orderBy: user._id
    }).save()

    let bulkOption = products.map((item) => {
        return {
            updateOne: {
                filter: { _id: item.product._id },
                update: { $inc: { quantity: -item.count, sold: +item.count } },
            }
        }
    })

    let updated = await Product.bulkWrite(bulkOption, {})
    console.log(updated, 'Product quantity -- and sold ++');
    console.log(newOrder, "New order saved")
    res.json({ ok: true });
}

exports.orders = async (req, res) => {
    try {
        let user = await User.findOne({ email: req.user.email }).exec();

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        let userOrders = await Order.find({ orderBy: user._id }).populate("products.product").exec();

        res.json(userOrders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body
        const user = await User.findOneAndUpdate({ email: req.user.email }, { $addToSet: { wishlist: productId } },

        ).exec()

        res.json({ ok: true })
    } catch (error) {
        console.error("Error in addToWishlist:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

exports.wishlist = async (req, res) => {
    try {
        const list = await User.findOne({ email: req.user.email }).select('whishlist').populate('wishlist').exec()

        res.json(list)
    } catch (error) {
        console.error("Error in wishList:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

exports.removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.body

        const user = await User.findOneAndUpdate({ email: req.user.email },
            { $pull: { wishlist: productId } }).exec()

        res.json({ ok: true })
    } catch (error) {
        console.error("Error in removeFromWishlist:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}


exports.createCashOrder = async (req, res) => {
    const { COD, couponApplied } = req.body

    if (!COD) return res.status(400).send("Create cash order failed");

    const user = await User.findOne({ email: req.user.email }).exec()
    let userCart = await Cart.findOne({ orderBy: user._id }).exec()


    let finalAmount = 0

    if (couponApplied && userCart.totalAfterDiscount) {
        finalAmount = userCart.totalAfterDiscount * 100;
    } else {
        finalAmount = userCart.cartTotal * 100;
    }

    let newOrder = await new Order({
        products: userCart.products,
        paymentIntent: {
            id: uniqueid(),
            amount: finalAmount,
            currency: "usd",
            status: "Cash On Delivery",
            created: Date.now(),
            payment_method_types: ["cash"],
        },
        orderBy: user._id,
        orderStatus: "Cash On Delivery",
    }).save()

    let bulkOption = userCart.products.map((item) => {
        return {
            updateOne: {
                filter: { _id: item.product._id },
                update: { $inc: { quantity: -item.count, sold: +item.count } },
            }
        }
    })

    let updated = await Product.bulkWrite(bulkOption, {})
    console.log(updated, 'Product quantity -- and sold ++');
    console.log(newOrder, "New order saved")
    res.json({ ok: true });
}