import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Heading, Input, Stack, Button, Text, FormControl, FormLabel, Link
} from '@chakra-ui/react';

import api from './axiosInstance';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Login to your API
      const responseYourAPI = await api.axiosInstance.post('/login', {
        username,
        password,
      });

      // Then, login to the external API
      const responseExternalAPI = await api.axiosInstance2.post('/signin', {
        username,
        password,
      });

      // Check if both logins are successful
      if (responseYourAPI.status === 200 && responseExternalAPI.status === 200) {
        // Storing tokens
        localStorage.setItem('token', responseYourAPI.data.access_token);
        localStorage.setItem('token2', responseExternalAPI.data.token);

        // Storing user ID
        localStorage.setItem('userId', responseYourAPI.data.user_id);

        // Update headers for future requests
        api.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${responseYourAPI.data.access_token}`;
        api.axiosInstance2.defaults.headers.common['Authorization'] = `Bearer ${responseExternalAPI.data.token}`;

        // Navigate to the home page
        navigate('/home');
      } else {
        setError('Login failed in one of the systems');
      }
    } catch (err) {
      setError(err.response ? err.response.data.detail : 'An unknown error occurred');
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
