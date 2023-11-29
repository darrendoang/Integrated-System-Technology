import React, { useState, useEffect } from 'react';
import api from './axiosInstance'; // Make sure this is the correct import
import {
  Box,
  Heading,
  Text,
  List,
  ListItem,
  Button,
  CircularProgress,
} from '@chakra-ui/react';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await api.axiosInstance.get('/classes');
        setClasses(response.data);
        setIsLoading(false);
      } catch (error) {
        setError('Could not fetch classes');
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const handleRegister = async (classId) => {
    try {
      // Fetch the current user's data
      const currentUserResponse = await api.axiosInstance.get('/current_user');
      const userId = currentUserResponse.data.user_id;
  
      if (!userId) {
        alert('Unable to retrieve user ID. Please log in again.');
        return;
      }
  
      // Register for the class using the retrieved user ID
      const registerResponse = await api.axiosInstance.post('/register', {
        user_id: userId,
        class_id: classId,
      });
  
      if (registerResponse.status === 200) {
        alert(`Successfully registered for class ${classId}`);
      } else {
        alert('Registration failed');
      }
    } catch (error) {
      alert('Registration failed: ' + error.message);
    }
  };
  


  if (isLoading) {
    return (
      <Box textAlign="center" mt={8}>
        <CircularProgress isIndeterminate color="teal.300" />
        <Text mt={4}>Loading classes...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={8} textAlign="center">
        <Text color="red.500">{error}</Text>
      </Box>
    );
  }

  return (
    <Box mt={8}>
      <Heading as="h1" size="xl" textAlign="center" mb={4}>
        Available Classes
      </Heading>
      {classes.length > 0 ? (
        <List spacing={4} maxW="lg" mx="auto">
          {classes.map((classItem) => (
            <ListItem key={classItem.class_id}>
              <Box
                borderWidth="1px"
                p={4}
                borderRadius="lg"
                boxShadow="md"
                bg="white"
                mb={2}
              >
                <Heading as="h2" size="lg">
                  {classItem.class_type}
                </Heading>
                <Text>Coach: {classItem.coach_id}</Text>
                <Text>Start Time: {classItem.start_time}</Text>
                <Text>End Time: {classItem.end_time}</Text>
                <Button
                  colorScheme="teal"
                  mt={2}
                  onClick={() => handleRegister(classItem.class_id)}
                >
                  Register
                </Button>
              </Box>
            </ListItem>
          ))}
        </List>
      ) : (
        <Text textAlign="center" mt={4}>
          No classes available.
        </Text>
      )}
    </Box>
  );
};

export default Classes;
