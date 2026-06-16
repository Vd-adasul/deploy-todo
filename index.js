// ============================================
// TODO APPLICATION SERVER (Express.js)
// ============================================
// This is the main server file that handles:
// 1. User authentication (signup/signin with JWT)
// 2. Todo CRUD operations (Create, Read, Delete)
// 3. Connects to MongoDB via models

const express = require("express");
const { authMiddleware } = require("./middleware");
const jwt = require("jsonwebtoken");
const { todoModel, userModel } = require("./model");

const app = express()
app.use(express.json());


// ============================================
// SIGNUP ENDPOINT - POST /signup
// ============================================
// Creates a new user account
// Request body: { username, password }
// Returns: { id: newUser._id } on success
// Prevents duplicate usernames
app.post("/signup", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if user already exists in MongoDB
    const existingUser = await userModel.findOne({
        username: username,
        password: password
    });
    if (existingUser) {
        res.status(403).json({
            message: "User with this username already exists"
        })
        return 
    }
   
    // Create new user document in MongoDB users collection
    const newUser = await userModel.create({
        username: username,
        password: password
    })
    res.json({
        id: newUser._id  // Returns MongoDB's auto-generated ID (use _id, not id)
    })
})


// ============================================
// SIGNIN ENDPOINT - POST /signin
// ============================================
// Authenticates user and returns JWT token
// Request body: { username, password }
// Returns: { token } - JWT token used for authenticated requests
// Token payload includes userId, signed with secret key "secret123123"
app.post("/signin", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Find user in MongoDB with matching credentials
    const userExists = await userModel.findOne({
        username: username,
        password: password
    });
    if (!userExists) {
        res.status(403).json({
            message: "Incorrect credentials"
        })
        return;  // IMPORTANT: Stop execution if user doesn't exist
    }

    // Create JWT token - used to authenticate subsequent requests
    const token = jwt.sign({
        userId: userExists._id  // Embed user ID in token (MongoDB uses _id, not id)
    }, "secret123123");

    res.json({
        token
    })
})

// ============================================
// TODO ENDPOINTS (MIGRATED TO MONGODB)
// ============================================
// These endpoints now use MongoDB for persistent storage

// POST /todo - Create a new todo (requires authentication)
app.post("/todo", authMiddleware, async (req, res) => {
    const userId = req.userId;  // Extracted from JWT token by authMiddleware
    const title = req.body.title;
    const description = req.body.description;

    try {
        // Create new todo in MongoDB
        const newTodo = await todoModel.create({
            title: title,
            description: description,
            userId: userId
        });

        res.json({
            message: "Todo created",
            todo: newTodo
        });
    } catch (error) {
        res.status(500).json({
            message: "Error creating todo",
            error: error.message
        });
    }
})

// DELETE /todo/:todoId - Delete a specific todo (requires authentication)
// Security check: user can only delete their own todos
app.delete("/todo/:todoId", authMiddleware, async (req, res) => {
    const userId = req.userId;  // User attempting to delete
    const todoId = req.params.todoId;  // MongoDB ObjectId

    try {
        // Find the todo by ID
        const todo = await todoModel.findById(todoId);

        // Verify that the todo exists and belongs to the requesting user
        if (!todo) {
            return res.status(404).json({
                message: "Todo not found"
            });
        }

        if (todo.userId.toString() !== userId.toString()) {
            return res.status(411).json({
                message: "This is not your todo"
            });
        }

        // Delete the todo from MongoDB
        await todoModel.findByIdAndDelete(todoId);
        
        res.json({
            message: "Todo deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting todo",
            error: error.message
        });
    }
})

// GET /todos - Retrieve all todos for authenticated user
// Returns only the todos that belong to the requesting user
app.get("/todos", authMiddleware, async (req, res) => {
    const userId = req.userId;  // Extracted from JWT token

    try {
        // Find all todos belonging to the requesting user from MongoDB
        const userTodos = await todoModel.find({ userId: userId });
        
        res.json({
            todos: userTodos
        });
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving todos",
            error: error.message
        });
    }
})

app.listen(3000);