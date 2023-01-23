// ## GET /books/:bookId

const { default: mongoose } = require("mongoose");
const bookModel = require("../models/books");

exports.getbooks = async (req, res) => {
    try {
        let bookId = req.params.bookId;
        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).json({
                status: false,
                msg: "bookID is invalid enter valid id",
            });
        }
        const book = await bookModel.findById(bookId);
        res.status(200).json({ status: true, data: book });
    } catch (error) {
        res.status(500).json({ status: false, msg: error });
    }
};
