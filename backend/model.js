const mongoose = require("mongoose");
require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://vidhyadharadasul_db_user:Coolrupesh@cluster0.02ou2ml.mongodb.net/trello_db";

mongoose.connect(MONGODB_URI).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
});

const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String
});

const TodoSchema = new mongoose.Schema({
    title: String,
    description: String,
    userId: mongoose.Types.ObjectId
});

const userModel = mongoose.model("users", UserSchema);
const todoModel = mongoose.model("todos", TodoSchema);

module.exports = { userModel, todoModel };
