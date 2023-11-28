// src/components/Classes.js
import React, { useState, useEffect } from 'react';
import axiosInstance from './axiosInstance';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axiosInstance.get('/classes');
        setClasses(response.data);
        setIsLoading(false);
      } catch (error) {
        setError('Could not fetch classes');
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, []);

  if (isLoading) return <p>Loading classes...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Available Classes</h1>
      {classes.length > 0 ? (
        <ul>
          {classes.map((classItem) => (
            <li key={classItem.class_id}>
              <div>
                <h2>{classItem.class_type}</h2>
                <p>Coach: {classItem.coach_id}</p>
                <p>Start Time: {classItem.start_time}</p>
                <p>End Time: {classItem.end_time}</p>
                {/* Add more details as needed */}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No classes available.</p>
      )}
    </div>
  );
};

export default Classes;
