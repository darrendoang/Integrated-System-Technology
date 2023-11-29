import React, { useState, useEffect } from 'react';
import axiosInstance from './axiosInstance';
import {
  Box,
  Heading,
  Text,
  List,
  ListItem,
  UnorderedList,
  CircularProgress,
} from '@chakra-ui/react';

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
                transition="transform 0.2s"
                _hover={{ transform: 'scale(1.02)' }}
              >
                <Heading as="h2" size="lg">
                  {classItem.class_type}
                </Heading>
                <Text>Coach: {classItem.coach_id}</Text>
                <Text>Start Time: {classItem.start_time}</Text>
                <Text>End Time: {classItem.end_time}</Text>
                {/* Add more details as needed */}
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
