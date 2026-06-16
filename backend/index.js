const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { authMiddleware } = require("./middleware");
const { todoModel, userModel } = require("./model");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "secret123123";

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "token"]
}));
app.options("*", cors());
app.use(express.json());

// POST /signup
app.post("/signup", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    const existingUser = await userModel.findOne({ username });
    if (existingUser) {
        return res.status(409).json({ message: "Username already taken" });
    }

    const newUser = await userModel.create({ username, password });
    res.status(201).json({ id: newUser._id });
});

// POST /signin
app.post("/signin", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await userModel.findOne({ username, password });
    if (!user) {
        return res.status(403).json({ message: "Incorrect credentials" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET);
    res.json({ token });
});

// POST /todo
app.post("/todo", authMiddleware, async (req, res) => {
    const { title, description } = req.body;

    if (!title) {
        return res.status(400).json({ message: "Title is required" });
    }

    try {
        const newTodo = await todoModel.create({
            title,
            description,
            userId: req.userId
        });
        res.status(201).json({ message: "Todo created", todo: newTodo });
    } catch (error) {
        res.status(500).json({ message: "Error creating todo", error: error.message });
    }
});

// GET /todos
app.get("/todos", authMiddleware, async (req, res) => {
    try {
        const todos = await todoModel.find({ userId: req.userId });
        res.json({ todos });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving todos", error: error.message });
    }
});

// DELETE /todo/:todoId
app.delete("/todo/:todoId", authMiddleware, async (req, res) => {
    const { todoId } = req.params;

    try {
        const todo = await todoModel.findById(todoId);

        if (!todo) {
            return res.status(404).json({ message: "Todo not found" });
        }

        if (todo.userId.toString() !== req.userId.toString()) {
            return res.status(403).json({ message: "Not your todo" });
        }

        await todoModel.findByIdAndDelete(todoId);
        res.json({ message: "Todo deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting todo", error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
