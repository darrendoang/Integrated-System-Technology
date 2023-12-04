import React, { useState, useEffect } from 'react';
import api from './axiosInstance';
import {
  Box, Heading, Text, List, ListItem, Button, CircularProgress
} from '@chakra-ui/react';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [coaches, setCoaches] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [registeredClasses, setRegisteredClasses] = useState(
    JSON.parse(localStorage.getItem('registeredClasses')) || {}
  );
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
    return date.toLocaleString('en-US', options);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const classesResponse = await api.axiosInstance.get('/classes');
        setClasses(classesResponse.data);

        const coachesResponse = await api.axiosInstance.get('/coaches');
        const coachesMap = coachesResponse.data.reduce((acc, coach) => {
          acc[coach.coach_id] = `${coach.first_name} ${coach.last_name}`;
          return acc;
        }, {});
        setCoaches(coachesMap);

        const registrationsResponse = await api.axiosInstance.get('/registrations');
        const registeredClassesData = registrationsResponse.data.reduce((acc, reg) => {
          acc[reg.class_id] = true;
          return acc;
        }, {});
        setRegisteredClasses(registeredClassesData);
      } catch (error) {
        setError('Could not fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCancelRegistration = async (classId) => {
    try {
      const response = await api.axiosInstance.delete(`/cancel_registration/${classId}`);
      if (response.status === 200) {
        const newRegisteredClasses = {...registeredClasses};
        delete newRegisteredClasses[classId];
        setRegisteredClasses(newRegisteredClasses);
        localStorage.setItem('registeredClasses', JSON.stringify(newRegisteredClasses));
      } else {
        alert('Cancellation failed');
      }
    } catch (error) {
      alert('Cancellation failed');
    }
  };

  const handleRegister = async (classId) => {
    try {
      const currentUserResponse = await api.axiosInstance.get('/current_user');
      const userId = currentUserResponse.data.user_id;

      if (!userId) {
        alert('Unable to retrieve user ID. Please log in again.');
        return;
      }

      const registerResponse = await api.axiosInstance.post('/register', {
        user_id: userId,
        class_id: classId,
      });

      if (registerResponse.status === 200) {
        const newRegisteredClasses = {...registeredClasses, [classId]: true};
        setRegisteredClasses(newRegisteredClasses);
        localStorage.setItem('registeredClasses', JSON.stringify(newRegisteredClasses));
      } else {
        alert('Registration failed');
      }
    } catch (error) {
      alert('Registration failed');
    }
  };

  return (
    <Box mt={8}>
      <Heading as="h1" size="xl" textAlign="center" mb={4}>Available Classes</Heading>
      {isLoading ? (
        <Box textAlign="center" mt={8}>
          <CircularProgress isIndeterminate color="teal.300" />
          <Text mt={4}>Loading classes...</Text>
        </Box>
      ) : error ? (
        <Box mt={8} textAlign="center">
          <Text color="red.500">{error}</Text>
        </Box>
      ) : (
        <List spacing={4} maxW="lg" mx="auto">
        {classes.map((classItem) => (
          <ListItem key={classItem.class_id}>
            <Box borderWidth="1px" p={4} borderRadius="lg" boxShadow="md" bg="white" mb={2}>
              <Heading as="h2" size="lg">{classItem.class_type}</Heading>
              
              <Text><strong>Coach:</strong> {coaches[classItem.coach_id]}</Text>
              <Text><strong>Start Time:</strong> {formatDate(classItem.start_time)}</Text>
              <Text><strong>End Time:</strong> {formatDate(classItem.end_time)}</Text>
                {registeredClasses[classItem.class_id] ? (
                  <>
                    <Button colorScheme="green" mt={2} isDisabled>Registered</Button>
                    <Button colorScheme="red" mt={2} onClick={() => handleCancelRegistration(classItem.class_id)}>Cancel</Button>
                  </>
                ) : (
                  <Button colorScheme="teal" mt={2} onClick={() => handleRegister(classItem.class_id)}>Register</Button>
                )}
              </Box>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default Classes;
