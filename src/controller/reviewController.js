const { default: mongoose } = require("mongoose");
const reviewModel = require("../models/review");

exports.createReveiw = async (req, res) => {
    let bookId = req.params.bookId;
    if (!bookId) {
        res.status(400).json({ status: false, msg: "please provide bookID" });
    }
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
        return res
            .status(400)
            .json({ status: false, msg: "enter valid bookID" });
    }
    let data = req.body;
    if (!data.rating) {
        return res
            .status(400)
            .json({ status: false, msg: "please provide rating" });
    }
    Date.reviewedAt = Date.now();
    const reveiw = await reviewModel.create(data);
    res.status(201).json({
        status: true,
        msg: "created successfully",
        data: reveiw,
    });
};
