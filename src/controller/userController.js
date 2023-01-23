const userModel = require("../models/user");
const validator = require("validator");

let createUser = async (req, res) => {
    let data = req.body;
    if (Object.keys(data).length == 0)
        return res
            .status(400)
            .send({ status: false, msg: "please provide fields" });
    if (!data.title) {
        return res
            .status(400)
            .send({ status: false, msg: "please provide title" });
    }
    if (!["MR", "MRS", "MISS"].includes(title))
        return res
            .status(400)
            .send({ status: false, msg: "title must be MR,MRS,MISS" });

    if (!data.name) {
        return res
            .status(400)
            .send({ status: false, msg: "please provide name" });
    }
    if (!validator.isAlpha(data.name))
        return res
            .status(400)
            .send({ status: false, msg: "please provide valid name" });
};
if (!data.phone) {
    return res.status(400).send({ status: false, msg: "please provide phone" });
}
if (!/^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/.test(data.phone)) {
    //8880344456 918880344456  //+91 8880344456

    return res
        .status(400)
        .send({ status: false, message: "Enter valid phone number" });
}

if (!data.email)
    return res.status(400).send({ status: false, msg: "please provide email" });

if (!validator.isEmail(data.email))
    return res
        .status(400)
        .send({ status: false, msg: "please provide valid email" });

if (!data.password)
    return res
        .status(400)
        .send({ status: false, msg: "please provide password" });
if (data.password.length < 8 && data.password.length > 15) {
    if (!validator.isStrongPassword(data.password)) {
        return res
            .status(400)
            .send({ status: false, msg: "please provide strong password" });
    }
} else {
    return res
        .status(400)
        .send({ status: false, msg: "password must be of length 8-15" });
}
// Duplicacy
let checkEmail = await userModel.findOne({ email: data.email });
if (checkEmail)
    return res
        .status(400)
        .send({ status: false, msg: "email is already in use" });

let checkPhone = await userModel.findOne({ phone: data.phone });
if (checkPhone)
    return res
        .status(400)
        .send({ status: false, msg: "Phone is already in use" });

let user = await userModel.create(data);

res.status(201).send({ status: true, data: user });

module.exports = { createUser };
