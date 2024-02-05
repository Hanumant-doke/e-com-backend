const User = require('../models/user')
const Coupon = require('../models/coupon')
const Cart = require('../models/cart')
const Product = require('../models/product')
const stripe = require('stripe')(process.env.STRIPE_SECRETE);

exports.createPaymentIntent = async (req, res) => {

    const { couponApplied } = req.body

    const user = await User.findOne({ email: req.user.email }).exec()

    const { cartTotal, totalAfterDiscount } = await Cart.findOne({ orderBy: user._id }).exec()

    let finalAmount = 0

    if (couponApplied && totalAfterDiscount) {
        finalAmount = totalAfterDiscount * 100;
    } else {
        finalAmount = cartTotal * 100;
    }

    const paymentIntent = await stripe.paymentIntents.create({
        amount: finalAmount,
        currency: 'usd',
        description: 'Software development services',
        customer: user.stripeCustomerId,
        shipping: {
            name: user.name,
            address: {
                line1: 'Shivbagh Colony',
                city: 'Telangana',
                postal_code: '500016',
                state: "TS",
                country: 'IN',
            },
        },
    });

    res.send({
        clientSecret: paymentIntent.client_secret,
        cartTotal,
        totalAfterDiscount,
        payable: finalAmount,
    })
}