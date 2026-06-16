// ============================================
// MONGOOSE DATABASE CONNECTION & MODELS
// ============================================
// This file sets up the MongoDB connection and defines data models for users and todos

const mongoose = require("mongoose");

// Connect to MongoDB using the provided connection string
// This establishes connection to the MongoDB cluster where data will be stored
mongoose.connect("mongodb+srv://vidhyadharadasul_db_user:Coolrupesh@cluster0.02ou2ml.mongodb.net/trello_db");

// ============================================
// USER SCHEMA & MODEL
// ============================================
// Defines the structure of user documents in MongoDB
// Each user will have: username (String) and password (String)
const UserSchema = new mongoose.Schema({
    username: String,  // Unique identifier for user login
    password: String   // Password for user authentication
});

// ============================================
// TODO SCHEMA & MODEL
// ============================================
// Defines the structure of todo documents in MongoDB
// Each todo will have: title, description, and userId (link to which user created it)
const TodoSchema = new mongoose.Schema({
    title: String,                          // Title of the todo item
    description: String,                    // Description/details of the todo
    userId: mongoose.Types.ObjectId         // Reference to the User who owns this todo
});

// Create mongoose models from schemas
// userModel is used to query/create/update user documents in the "users" collection
// todoModel is used to query/create/update todo documents in the "todos" collection
const userModel = mongoose.model("users", UserSchema);
const todoModel = mongoose.model("todos", TodoSchema);

// Export models so other files can use them to interact with MongoDB
module.exports = {
    userModel: userModel,
    todoModel: todoModel
}