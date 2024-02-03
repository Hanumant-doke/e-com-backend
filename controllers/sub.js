const Product = require('../models/product');
const Sub = require('../models/sub')
const slugify = require('slugify')

exports.create = async (req, res) => {
    try {
        const { name, parent } = req.body
        const sub = await new Sub({ name, parent, slug: slugify(name) }).save();
        res.json(sub);
    } catch (err) {
        // console.log();
        res.status(400).send("create sub failed")
    }
}

exports.list = async (req, res) => {
    try {
        const listSub = await Sub.find({}).sort({ createdAt: -1 }).exec();
        res.json(listSub)
    } catch (err) {
        res.status(400).send("sub list failed")
    }
}

exports.read = async (req, res) => {
    try {
        let subRead = await Sub.findOne({ slug: req.params.slug }).exec();

        if (!subRead) {
            return res.status(404).json({ error: 'sub not found' });
        }
        const product = await Product.find({ subRead: subRead })
            .populate('category')
            .exec()

        res.json({ subRead, product });
    } catch (err) {
        res.status(400).send("sub read failed");
    }
};


exports.update = async (req, res) => {
    try {
        const { name, parent } = req.body
        const subUpdate = await Sub.findOneAndUpdate(
            { slug: req.params.slug },
            { name, parent, slug: slugify(name) },
            { new: true })
        res.json(subUpdate)
    } catch (err) {
        res.status(400).send("sub update failed")
    }
}

exports.remove = async (req, res) => {
    try {
        const subDelete = await Sub.findOneAndDelete({ slug: req.params.slug });
        res.json(subDelete)
    } catch (err) {
        res.status(400).send("sub deleted failed")
    }
}