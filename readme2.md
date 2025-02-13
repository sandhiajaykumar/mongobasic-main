For an **offline** setup, you will need to configure both the backend and frontend to run locally without using MongoDB Atlas. In this case, we will use a **local MongoDB instance** instead of MongoDB Atlas for the database. Here's how you can set everything up for offline development:

---

### **Step 1: Set Up MongoDB Locally**

#### 1.1 **Install MongoDB**
First, you need to install MongoDB on your local machine.

- **For Windows:**
  - Download MongoDB from the [official MongoDB website](https://www.mongodb.com/try/download/community).
  - Follow the installation instructions.

- **For macOS:**
  - Install MongoDB using Homebrew with the command:
    ```bash
    brew tap mongodb/brew
    brew install mongodb-community@5.0
    ```

- **For Linux:**
  - Follow the installation instructions for your specific Linux distribution from the [MongoDB installation guide](https://www.mongodb.com/docs/manual/installation/).

#### 1.2 **Start MongoDB Locally**
After installing MongoDB, you need to start the MongoDB server on your machine. Open a new terminal window and run:

```bash
mongod
```

This will start the MongoDB server locally on `localhost:27017`.

---

### **Step 2: Set Up the Backend (Offline Mode)**

Now let's configure your **backend server** to use a local MongoDB instance.

#### 2.1 **Update `.env` File**
In the `backend` folder, update your `.env` file with the local MongoDB URI:

```plaintext
MONGO_URI=mongodb://localhost:27017/studentDB
```

This tells the backend to connect to a local MongoDB instance running on the default port (`27017`) and use the `studentDB` database.

#### 2.2 **Update `server.js` for Local MongoDB**

The `server.js` file doesn't require many changes, but just make sure it's configured to connect to the local MongoDB instance:

```js
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

// Connect to MongoDB locally
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
```

#### 2.3 **Run the Backend Locally**

Start the backend server by running:

```bash
node server.js
```

You should now see:

```bash
Server running on port 5000
MongoDB connected
```

Your backend server is running locally and connected to MongoDB.

---

### **Step 3: Set Up the Frontend (React App)**

The frontend setup remains mostly the same as the **online version**, but ensure that the **Axios API calls** point to the locally running backend server.

#### 3.1 **Update API Calls in `App.js`**

Update the `App.js` in your `client` folder to make sure the requests are being sent to `localhost:5000`:

```js
// client/src/App.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [rollNo, setRollNo] = useState('');
    const [students, setStudents] = useState([]);
    const [editId, setEditId] = useState(null); // For editing a student

    // Fetch all students from the backend
    const fetchStudents = async () => {
        try {
            const response = await axios.get('http://localhost:5000/students');
            setStudents(response.data);
        } catch (error) {
            console.log('Error fetching students:', error);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    // Handle form submission to add a new student or update an existing student
    const handleSubmit = async (e) => {
        e.preventDefault();
        const studentData = { name, email, rollNo };

        if (editId) {
            // Update existing student
            try {
                await axios.put(`http://localhost:5000/update-student/${editId}`, studentData);
                alert('Student updated successfully!');
                setEditId(null); // Reset editing state
            } catch (error) {
                console.log(error);
                alert('Error updating student');
            }
        } else {
            // Add new student
            try {
                await axios.post('http://localhost:5000/add-student', studentData);
                alert('Student added successfully!');
            } catch (error) {
                console.log(error);
                alert('Error adding student');
            }
        }
        fetchStudents(); // Re-fetch student list after adding or updating
        setName('');
        setEmail('');
        setRollNo('');
    };

    // Handle the edit student functionality
    const handleEdit = (student) => {
        setName(student.name);
        setEmail(student.email);
        setRollNo(student.rollNo);
        setEditId(student._id); // Set the ID for updating
    };

    // Handle the delete student functionality
    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/delete-student/${id}`);
            alert('Student deleted successfully!');
            fetchStudents(); // Re-fetch the student list after deletion
        } catch (error) {
            console.log(error);
            alert('Error deleting student');
        }
    };

    return (
        <div>
            <h1>Student Registration</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Roll Number"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                />
                <button type="submit">{editId ? 'Update Student' : 'Submit'}</button>
            </form>

            <h2>All Students</h2>
            <ul>
                {students.length > 0 ? (
                    students.map((student) => (
                        <li key={student._id}>
                            <strong>{student.name}</strong> ({student.email}) - Roll No: {student.rollNo}
                            <button onClick={() => handleEdit(student)}>Edit</button>
                            <button onClick={() => handleDelete(student._id)}>Delete</button>
                        </li>
                    ))
                ) : (
                    <p>No students found.</p>
                )}
            </ul>
        </div>
    );
}

export default App;
```

#### 3.2 **Run the Frontend Locally**

Navigate to the `client` folder and run:

```bash
npm run dev
```

Your React app should now be running on `http://localhost:3000`.

---

### **Step 4: Testing Offline Setup**

1. **Start MongoDB locally** by running `mongod` in a terminal.
2. **Start the backend server** by running `node server.js` in the `backend` folder.
3. **Start the frontend React app** by running `npm run dev` in the `client` folder.

Now, your application is completely running offline with a local MongoDB database. You can:
- **Add students** (POST request).
- **View all students** (GET request).
- **Update students** (PUT request).
- **Delete students** (DELETE request).

---

### **Conclusion**

You now have a complete offline setup with:
- **Backend:** Node.js, Express, and MongoDB running locally.
- **Frontend:** React app using Axios to interact with the backend.

Let me know if you need any further clarifications!