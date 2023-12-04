import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Heading, Text, Button, Flex, Switch, FormControl, FormLabel } from '@chakra-ui/react';

const AdminHome = () => {
  const [showCustomerView, setShowCustomerView] = useState(false);
  const navigate = useNavigate();

  const navigateToAdminClasses = () => navigate('/admin-classes');
  const navigateToAdminUsers = () => navigate('/admin-users');
  const navigateToAdminCoaches = () => navigate('/admin-coaches');
  const navigateToAdminRegistrations = () => navigate('/admin-registrations');
  const navigateToClasses = () => navigate('/classes');
  const navigateToCoaches = () => navigate('/coaches');
  const navigateToCalculator = () => navigate('/calorie-calculator');

  return (
    <Box maxW="lg" mx="auto" mt={8} p={4} borderWidth="1px" borderRadius="md">
      <Flex flexDirection="column" alignItems="center" justifyContent="center">
        <Heading as="h1" size="xl" align="center" mb={4}>Admin Dashboard</Heading>
        <Text fontSize="lg" textAlign="center" mb={6}>
          Manage classes, users, and coaches efficiently!
        </Text>

        {/* Admin Buttons */}
        <Button colorScheme="teal" onClick={navigateToAdminClasses} mb={2}>Manage Classes</Button>
        <Button colorScheme="teal" onClick={navigateToAdminUsers} mb={2}>Manage Users</Button>
        <Button colorScheme="teal" onClick={navigateToAdminCoaches} mb={2}>Manage Coaches</Button>
        <Button colorScheme="teal" onClick={navigateToAdminRegistrations} mb={2}>See Registrations</Button>

        {/* Switch for Customer View */}
        <Flex justifyContent="center" width="100%" mb={4}>
          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="customer-view-switch" mb="0" marginLeft = "134px" >
              Show Customer Pages
            </FormLabel>
            <Switch id="customer-view-switch" colorScheme="teal" onChange={() => setShowCustomerView(!showCustomerView)} />
          </FormControl>
        </Flex>

        {/* Conditional Rendering of Customer Buttons */}
        {showCustomerView && (
          <>
            <Button colorScheme="blue" onClick={navigateToClasses} mb={2}>Classes</Button>
            <Button colorScheme="blue" onClick={navigateToCoaches} mb={2}>Coaches</Button>
            <Button colorScheme="blue" onClick={navigateToCalculator} mb={2}>Calorie Calculator</Button>
          </>
        )}
      </Flex>
    </Box>
  );
};

export default AdminHome;
