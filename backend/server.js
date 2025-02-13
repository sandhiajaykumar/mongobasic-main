// backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log(err));

// Define the Student Schema
const studentSchema = new mongoose.Schema({
    name: String,
    email: String,
    rollNo: String,
});

// Create the Model
const Student = mongoose.model('Student', studentSchema);

// API endpoint to add a student
app.post('/add-student', async (req, res) => {
    try {
        const { name, email, rollNo } = req.body;
        const newStudent = new Student({ name, email, rollNo });
        await newStudent.save();
        res.json({ message: "Student added successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error adding student" });
    }
});

// API endpoint to fetch all students
app.get('/students', async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: "Error fetching students" });
    }
});

// API endpoint to update a student
app.put('/update-student/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, rollNo } = req.body;
        const updatedStudent = await Student.findByIdAndUpdate(
            id,
            { name, email, rollNo },
            { new: true } // Return the updated document
        );
        if (!updatedStudent) {
            return res.status(404).json({ message: "Student not found" });
        }
        res.json({ message: "Student updated successfully!", student: updatedStudent });
    } catch (error) {
        res.status(500).json({ message: "Error updating student" });
    }
});

// API endpoint to delete a student
app.delete('/delete-student/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedStudent = await Student.findByIdAndDelete(id);
        if (!deletedStudent) {
            return res.status(404).json({ message: "Student not found" });
        }
        res.json({ message: "Student deleted successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting student" });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
