import React, { useState, useEffect } from 'react';
import api from './axiosInstance';
import {
  Box, Heading, Text, List, ListItem, CircularProgress
} from '@chakra-ui/react';

const Coaches = () => {
  const [coaches, setCoaches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCoaches = async () => {
      setIsLoading(true);
      try {
        const response = await api.axiosInstance.get('/coaches');
        setCoaches(response.data);
      } catch (error) {
        setError('Could not fetch coaches');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoaches();
  }, []);

  return (
    <Box mt={8}>
      <Heading as="h1" size="xl" textAlign="center" mb={4}>Our Coaches</Heading>
      {isLoading ? (
        <Box textAlign="center" mt={8}>
          <CircularProgress isIndeterminate color="teal.300" />
          <Text mt={4}>Loading coaches...</Text>
        </Box>
      ) : error ? (
        <Box mt={8} textAlign="center">
          <Text color="red.500">{error}</Text>
        </Box>
      ) : (
        <List spacing={4} maxW="lg" mx="auto">
          {coaches.map((coach) => (
            <ListItem key={coach.coach_id}>
              <Box borderWidth="1px" p={4} borderRadius="lg" boxShadow="md" bg="white" mb={2}>
                <Heading as="h2" size="lg">{coach.first_name} {coach.last_name}</Heading>
                <Text>Email: {coach.email}</Text>
                <Text>Phone: {coach.phone_number}</Text>
                <Text>Experience: {coach.experience_years} years</Text>
                <Text>Hourly Rate: IDR {coach.hourly_rate_idr}</Text>
                <Text>Availability: {coach.availability}</Text>
                <Text>Bio: {coach.bio}</Text>
              </Box>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default Coaches;
