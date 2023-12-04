import React, { useState, useEffect } from 'react';
import api from './axiosInstance';
import { Box, Heading, Text, List, ListItem, CircularProgress, UnorderedList } from '@chakra-ui/react';

const AdminRegistrations = () => {
  const [classes, setClasses] = useState([]);
  const [users, setUsers] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch classes
        const classesResponse = await api.axiosInstance.get('/classes');
        setClasses(classesResponse.data);

        // Fetch users
        const usersResponse = await api.axiosInstance.get('/users');
        setUsers(usersResponse.data);

        // Fetch all registrations
        const registrationsResponse = await api.axiosInstance.get('/all-registrations');
        setRegistrations(registrationsResponse.data);
      } catch (error) {
        setError('Could not fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getUsername = (userId) => {
    const user = users.find(u => u.user_id === userId);
    return user ? user.username : 'Unknown User';
  };

  return (
    <Box mt={8} maxW="lg" mx="auto">
      <Heading as="h1" size="xl" textAlign="center" mb={4}>Class Registrations</Heading>
      {isLoading ? (
        <CircularProgress isIndeterminate color="teal.300" />
      ) : error ? (
        <Text color="red.500">{error}</Text>
      ) : (
        <List spacing={4}>
          {classes.map(classItem => (
            <ListItem key={classItem.class_id}>
              <Box borderWidth="1px" p={4} borderRadius="lg" boxShadow="md" bg="white" mb={4}>
                <Heading as="h3" size="lg" mb={2}>{classItem.class_type}</Heading>
                <Text fontWeight="semibold" mb={2} color="gray.600">Users Registered:</Text>
                <UnorderedList pl={5} mb={3} style={{ listStyleType: 'circle' }}>
                  {registrations.filter(reg => reg.class_id === classItem.class_id).map(reg => (
                    <ListItem key={reg.user_id}>
                      <Text fontSize="sm">{getUsername(reg.user_id)}</Text>
                    </ListItem>
                  ))}
                </UnorderedList>
              </Box>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default AdminRegistrations;