// src/components/AdminAlert.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Heading, Text, Button, Flex } from '@chakra-ui/react';

const AdminAlert = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <Box maxW="lg" mx="auto" mt={8} p={4} borderWidth="1px" borderRadius="md">
      <Flex flexDirection="column" alignItems="center" justifyContent="center">
        <Heading as="h1" size="xl" align="center" mb={4}>
          Admin Access Required
        </Heading>
        <Text fontSize="lg" textAlign="center" mb={6}>
          You need to be logged in as an admin to access this page.
        </Text>
        <Button colorScheme="blue" onClick={handleLogout} mb={2}>
          Logout
        </Button>
      </Flex>
    </Box>
  );
};

export default AdminAlert;
