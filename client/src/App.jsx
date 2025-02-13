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
