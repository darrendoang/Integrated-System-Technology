import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Heading, Input, Stack, Button, Text, FormControl, FormLabel, Link
} from '@chakra-ui/react';

import api from './axiosInstance';
import { useUserContext } from './UserContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { updateUserRole } = useUserContext(); // Use the context

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.axiosInstance.post('/login', { username, password });
      console.log("Login response:", response.data);

      if (response.status === 200) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('userId', response.data.user_id);
        localStorage.setItem('userRole', response.data.role);

        api.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;

        updateUserRole(response.data.role); // Update the user role in context

        // Navigate based on role
        if (response.data.role === 'admin') {
          navigate('/admin-home');  // Navigate to admin route
        } else {
          navigate('/home');  // Navigate to home for regular users
        }
      } else {
        setError('Login failed');
      }
    } catch (err) {
      setError(err.response ? err.response.data.detail : 'An unknown error occurred');
      console.error("Login error:", err.response || err);
    }
  };


  return (
    <Box maxW="md" mx="auto" mt={8} p={4} borderWidth="1px" borderRadius="md">
      <Heading as="h1" size="xl" mb={4}>
        Log In
      </Heading>
      <form onSubmit={handleLogin}>
        <Stack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Username:</FormLabel>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Password:</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>
          {error && (
            <Text color="red.500" fontSize="sm">
              {error}
            </Text>
          )}
          <Button type="submit" colorScheme="teal" size="lg" fontSize="md">
            Log In
          </Button>
          <Link onClick={() => navigate('/register')} color="teal.500" fontSize="sm">
            Register
          </Link>
        </Stack>
      </form>
    </Box>
  );
};

export default Login;
