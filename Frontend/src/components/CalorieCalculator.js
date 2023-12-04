import React, { useState } from 'react';
import { Box, Heading, FormControl, FormLabel, Input, Button, Text, Select, Badge } from '@chakra-ui/react';
import api from './axiosInstance';

const CalorieCalculator = () => {
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    weight_kg: '',
    height_cm: '',
    activity_level: '',
    goal: '',
  });

  const classes = [
    { name: 'MUSCLE Training', type: 'gain' },
    { name: 'Yoga', type: 'maintain' },
    { name: 'HIIT', type: 'loss' },
    { name: 'Abs Training', type: 'maintain' },
    { name: 'Cardio', type: 'loss' },
    { name: 'Pilates', type: 'maintain' },
  ];

  const getClassRecommendation = (goal) => {
    let recommendedClasses = [];
    switch (goal) {
      case 'weight_loss':
        recommendedClasses = classes.filter(cls => cls.type === 'loss');
        break;
      case 'weight_gain':
        recommendedClasses = classes.filter(cls => cls.type === 'gain');
        break;
      default:
        recommendedClasses = classes.filter(cls => cls.type === 'maintain');
    }

    // Return a random class from the filtered list
    return recommendedClasses.length > 0 
           ? recommendedClasses[Math.floor(Math.random() * recommendedClasses.length)].name 
           : 'No class available for this goal';
  };
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    try {
      const requestData = { ...formData, user_id: '1' };
      const response = await api.axiosInstance2.post('/calculate_calories', requestData);

      const recommendedClass = getClassRecommendation(formData.goal);
      setResult({
        ...response.data,
        classRecommendation: recommendedClass
      });
    } catch (err) {
      // Error handling logic
      if (err.response && err.response.data && typeof err.response.data === 'object') {
        setError(JSON.stringify(err.response.data.detail || err.response.data.message));
      } else {
        setError('An unknown error occurred');
      }
    }
  };
  
  

  return (
    <Box p={4}>
      <Heading as="h1" size="lg" mb={4}>
        Calorie and Class Recommendation
      </Heading>
      <form onSubmit={handleSubmit}>
        <FormControl mt={4}>
          <FormLabel>Age</FormLabel>
          <Input type="number" name="age" value={formData.age} onChange={handleChange} required />
        </FormControl>
        <FormControl mt={4}>
          <FormLabel>Gender</FormLabel>
          <Select name="gender" value={formData.gender} onChange={handleChange} placeholder="Select gender" required>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </Select>
        </FormControl>
        <FormControl mt={4}>
          <FormLabel>Weight (kg)</FormLabel>
          <Input type="number" name="weight_kg" value={formData.weight_kg} onChange={handleChange} required />
        </FormControl>
        <FormControl mt={4}>
          <FormLabel>Height (cm)</FormLabel>
          <Input type="number" name="height_cm" value={formData.height_cm} onChange={handleChange} required />
        </FormControl>
        <FormControl mt={4}>
          <FormLabel>Activity Level</FormLabel>
          <Select name="activity_level" value={formData.activity_level} onChange={handleChange} placeholder="Select activity level" required>
            <option value="sedentary">Sedentary</option>
            <option value="light">Light</option>
            <option value="moderate">Moderate</option>
            <option value="active">Active</option>
            <option value="extremely_active">Extremely Active</option>
          </Select>
        </FormControl>
        <FormControl mt={4}>
          <FormLabel>Goal</FormLabel>
          <Select name="goal" value={formData.goal} onChange={handleChange} placeholder="Select goal" required>
            <option value="weight_loss">Weight Loss</option>
            <option value="weight_gain">Weight Gain</option>
            <option value="maintenance">Maintenance</option>
          </Select>
        </FormControl>
        <Button type="submit" colorScheme="blue" mt={4}>
          Calculate
        </Button>
      </form>
      {result && (
        <Box mt={4}>
          <Text>Calories per day: {result.calories_per_day}</Text>
          <Text>Protein (g/day): {result.protein_grams_per_day}</Text>
          <Text>Carbohydrates (g/day): {result.carbohydrate_grams_per_day}</Text>
          <Text>Fat (g/day): {result.fat_grams_per_day}</Text>
          <Text>Fiber (g/day): {result.fiber_grams_per_day}</Text>
        </Box>
      )}
      {result && (
        <Box mt={4}>
          {/* ... (display calorie calculation results) */}
          <Box mt={4} p={4} borderWidth="1px" borderRadius="lg" borderColor="teal.500">
            <Text fontSize="lg" fontWeight="bold">Class Recommendation:</Text>
            <Badge colorScheme="teal" fontSize="md" p={2}>{result.classRecommendation}</Badge>
          </Box>
        </Box>
      )}
      {error && <Text color="red.500" mt={4}>{error}</Text>}
    </Box>
  );
};

export default CalorieCalculator;
