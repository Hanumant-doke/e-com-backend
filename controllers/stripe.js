const User = require('../models/user')
const Coupon = require('../models/coupon')
const Cart = require('../models/cart')
const Product = require('../models/product')
const stripe = require('stripe')(process.env.STRIPE_SECRETE);


exports.createPaymentIntent = async (req, res) => {


    const paymentIntent = await stripe.paymentIntents.create({
        amount: 100,
        currency: "usd",
    })
    res.send({
        clientSecret: paymentIntent.client_secret,

    })
}