Here is the complete step-by-step guide to creating a full-stack student management application using **React** for the frontend and **Node.js with MongoDB** for the backend. This includes creating, reading, updating, and deleting students.

---

### **Step 1: Set Up Backend**

#### 1.1 **Create Backend Folder**
First, create a folder for your backend code and navigate to it in the terminal:

```bash
mkdir backend
cd backend
```

#### 1.2 **Initialize Node.js Project**
Run the following command to initialize a new Node.js project and install required dependencies:

```bash
npm init -y
npm install express mongoose cors dotenv
```

#### 1.3 **Create `.env` File for Environment Variables**
Create a `.env` file in your `backend` folder to store the MongoDB URI:

```plaintext
MONGO_URI=mongodb+srv://<your_username>:<your_password>@cluster0.grixf.mongodb.net/your_db_name?retryWrites=true&w=majority
```

Replace `<your_username>`, `<your_password>`, and `your_db_name` with your actual MongoDB Atlas credentials.

#### 1.4 **Create `server.js` File**

Now, create a file named `server.js` in the `backend` folder:

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
```

#### 1.5 **Run the Backend**
Now, start the backend server:

```bash
node server.js
```

You should see `Server running on port 5000` and `MongoDB connected`.

---

### **Step 2: Set Up Frontend (Vite React App)**

#### 2.1 **Create React App**
Create a new folder for your frontend (inside the same directory as `backend`):

```bash
mkdir client
cd client
npm create vite@latest . --template react
```

During the setup, choose the **React** template.

#### 2.2 **Install Axios**
Install `axios` for making HTTP requests:

```bash
npm install axios
```

#### 2.3 **Update `App.js` for Student Management**

Now, open the `src/App.js` file and replace its content with the following code:

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

#### 2.4 **Run the Frontend**
Now, start the frontend server:

```bash
npm run dev
```

Your React app should now be running at `http://localhost:3000`.

---

### **Step 3: Testing**

1. **Start the Backend Server:**

   ```bash
   node server.js
   ```

2. **Start the Frontend React App:**

   ```bash
   npm run dev
   ```

3. **Test the Application:**

   - Open `http://localhost:3000` in your browser.
   - You can **add**, **update**, and **delete** students.
   - The student data is stored in MongoDB Atlas.

---

### **Conclusion**

By following these steps, you now have a **full-stack student management application** with the ability to:
- **Add students** (POST request).
- **Display students** (GET request).
- **Update students** (PUT request).
- **Delete students** (DELETE request).

Let me know if you have any further questions or issues!