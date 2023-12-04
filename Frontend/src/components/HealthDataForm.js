// src/components/HealthDataForm.js
import React, { useState } from 'react';

const HealthDataForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    age: '',
    gender: '',
    goal: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Weight (kg):</label>
        <input
          type="number"
          name="weight"
          value={formData.weight}
          onChange={handleChange}
          required
        />
      </div>
      {/* Add input fields for height, age, gender, and goal */}
      <div>
        <button type="submit">Get Class Recommendation</button>
      </div>
    </form>
  );
};

export default HealthDataForm;
