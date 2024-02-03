const admin = require("../firebase");
const User = require("../models/user");

exports.authCheck = async (req, res, next) => {
    // console.log(req.headers);
    try {
        const firebaseUser = await admin.auth().verifyIdToken(req.headers.authtoken)
        console.log("FIREBASE USER IN AUTHCHECK", firebaseUser);
        req.user = firebaseUser;
        next()
    } catch (err) {
        res.status(401).json({
            err: "Invaliad or expired token",
        })
    }
}

exports.adminCheck = async (req, res, next) => {
    const { email } = req.user;

    try {
        const adminUser = await User.findOne({ email }).exec();

        if (adminUser && adminUser.role !== "admin") {
            res.status(403).json({
                err: "Access denied"
            });
        } else {
            next();
        }
    } catch (error) {
        // Handle the error here, e.g., send an error response
        console.error("Error in adminCheck:", error);
        res.status(500).json({
            err: "Internal server error"
        });
    }
};
