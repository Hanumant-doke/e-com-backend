const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema


const subSchema = new mongoose.Schema({
    name:
    {
        type: String,
        trim: true,
        required: "Name is Required",
        minLength: [2, "TO Short"],
        maxLength: [32, "To Long"]
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        index: true
    },
    parent: { type: ObjectId, ref: "Category", required: true },
},
    { timestamps: true }
)


module.exports = mongoose.model("Sub", subSchema)
