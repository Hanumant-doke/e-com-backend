const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const { readdirSync } = require('fs')
require('dotenv').config()

const app = express()

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true, 
    useUnifiedTopology: true  
})
    .then(() => console.log("DB CONNECTED"))
    .catch((err) => console.log("DB CONNECTION ERROR", err))

app.use(morgan("dev"))
app.use(bodyParser.json())

app.use(cors())

readdirSync("./routes").map((r) => app.use("/api", require("./routes/" + r)))

const port = process.env.PORT || 8000

app.listen(port, () => console.log(`Server is running on port ${port}`))
