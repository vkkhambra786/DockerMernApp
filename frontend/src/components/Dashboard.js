 

import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Dashboard.css";
import { useLocation, useNavigate } from "react-router-dom";

const useRequireAuth = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      // If token does not exist, redirect to login page
      navigate("/login");
    }
  }, [token, navigate]);

  return token;
};

const Dashboard = () => {
  const [formData, setFormData] = useState({
    name: "", // Default type is income
    age: "",
    email: "",
  });
  const [errors, setErrors] = useState({});
  const location = useLocation();
  const { record } = location.state || {};
  const token = useRequireAuth(); // Custom hook for authentication

  useEffect(() => {
    if (record) {
      // If record data is passed, populate the form fields with it
      setFormData({
        name: record.name,
        age: record.age,
        email: record.email,
      });
    }
  }, [record]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "", // Clear error message when user starts typing
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Perform client-side validation
    const validationErrors = {};
    if (!formData.age) {
      validationErrors.age = "Age is required";
    } else if (!/^\d+(\.\d{1,2})?$/.test(formData.age)) {
      validationErrors.age = "Invalid Age format";
    }
    if (!formData.email) {
      validationErrors.email = "Email is required";
    }
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      // Include token in request headers
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      if (record) {
        // If record data is passed, call the update API (PUT)
        const recordId = record._id; // Ensure you're using the correct field
        console.log(`Updating record with ID: ${recordId}`);
        console.log(`Updating record with ID: ${record.id}`);
        const response = await axios.put(
          `http://localhost:3001/api/recordsUp/${recordId}`,
          formData,
          config
        );
        // Show success message for update
        console.log("Update Response:", response.data);
        alert("Record updated successfully!");
      } else {
        // If no record data is passed, call the create API (POST)
        const response = await axios.post(
          "http://localhost:3001/api/records",
          formData,
          config
        );
        // Show success message for add
        console.log("Response:", response.data);
        alert("Record added successfully!");
      }

      // Reset form data after successful submission
      setFormData({
        name: "",  
        age: "",
        email: "",
      });
    } catch (error) {
      console.error("Error:", error);
      if (error.response && error.response.data && error.response.data.error) {
        alert(error.response.data.error);
      } else {
        alert("An error occurred. Please try again later.");
      }
    }
  };

  return (
    <div className="dashboard-container">
      <h2>{record ? "Update Record" : "Add Record"}</h2>
      <form onSubmit={handleSubmit} className="record-form">
        <div className="form-group">
          <label htmlFor="name">Name:</label>
           
             <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
             {errors.name && (
            <span className="error">{errors.name}</span>
          )}
         
        </div>
        <div className="form-group">
          <label htmlFor="age">age:</label>
          <input
            type="text"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleChange}
            required
          />
          {errors.age && <span className="error">{errors.age}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="email">email:</label>
          <input
            type="text"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && (
            <span className="error">{errors.email}</span>
          )}
        </div>
        <button type="submit">{record ? "Update" : "Submit"}</button>
      </form>
    </div>
  );
};

export default Dashboard;
