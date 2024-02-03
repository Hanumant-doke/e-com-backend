const Category = require('../models/category')
const Product = require('../models/product')
const Sub = require('../models/sub')
const slugify = require('slugify')

exports.create = async (req, res) => {
    try {
        const { name } = req.body
        const category = await new Category({ name, slug: slugify(name) }).save();
        res.json(category);
    } catch (err) {
        // console.log();
        res.status(400).send("create category failed")
    }
}

exports.list = async (req, res) => {
    try {
        const listCatogory = await Category.find({}).sort({ createdAt: -1 }).exec();
        res.json(listCatogory)
    } catch (err) {
        res.status(400).send("category list failed")
    }
}

exports.read = async (req, res) => {
    try {
        let categoryRead = await Category.findOne({ slug: req.params.slug }).exec();

        if (!categoryRead) {
            return res.status(404).json({ error: 'Category not found' });
        }
        const product = await Product.find({ categoryRead })
            .populate('category')
            .populate('postedBy', '_id name')
            .exec()

        // console.log(categoryRead, 'categoryRead');
        res.json({ categoryRead, product });
    } catch (err) {
        res.status(400).send("Category read failed");
    }
};


exports.update = async (req, res) => {
    try {
        const { name } = req.body
        const categoryUpdate = await Category.findOneAndUpdate({ slug: req.params.slug }, { name, slug: slugify(name) }, { new: true }).exec()
        res.json(categoryUpdate)
    } catch (err) {
        res.status(400).send("category update failed")
    }
}

exports.remove = async (req, res) => {
    try {
        const categoryDelete = await Category.findOneAndDelete({ slug: req.params.slug });
        res.json(categoryDelete)
    } catch (err) {
        res.status(400).send("category deleted failed")
    }
}

exports.getSubs = async (req, res) => {
    try {
        const subs = await Sub.find({ parent: req.params._id }).exec();
        res.json(subs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
