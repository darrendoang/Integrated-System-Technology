import React, { useState } from 'react';
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

// Import axios instances
import api from './axiosInstance';

// Then use api.axiosInstance and api.axiosInstance2 to refer to your Axios instances


const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Password and Confirm Password do not match.');
      return;
    }

    try {
      // Register on your API
      const responseYourAPI = await api.axiosInstance.post('/signup', {
        username: formData.username,
        password: formData.password,
        role: 'customer',
      });

      // Prepare data for the external API
      const userForExternalAPI = {
        username: formData.username,
        password: formData.password,
      };

      // Register on the external API
      const responseExternalAPI = await api.axiosInstance2.post('/register', userForExternalAPI);

      // Check if both registrations are successful
      if (responseYourAPI.status === 200 && responseExternalAPI.status === 200) {
        setSuccessMessage('Registration successful. You can now log in.');
        navigate('/login');
      } else {
        setErrorMessage('Registration failed in one of the systems');
      }
    } catch (err) {
      setErrorMessage(err.response ? err.response.data.detail : 'An unknown error occurred');
    }
  };

  return (
    <Box>
      <Heading as="h1" size="xl">
        Register
      </Heading>
      <form onSubmit={handleSubmit}>
        <FormControl mt={4}>
          <FormLabel>Username</FormLabel>
          <Input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </FormControl>
        <FormControl mt={4}>
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </FormControl>
        <FormControl mt={4}>
          <FormLabel>Confirm Password</FormLabel>
          <Input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </FormControl>
        {errorMessage && <Text color="red.500">{errorMessage}</Text>}
        {successMessage && <Text color="green.500">{successMessage}</Text>}
        <Button type="submit" mt={4} colorScheme="teal">
          Register
        </Button>
      </form>
    </Box>
  );
};

export default Register;
