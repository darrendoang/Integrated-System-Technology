import React from 'react';
import { Box, Link, VStack, Text, Flex } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaDoorOpen, FaCalculator } from 'react-icons/fa'; // Import FaCalculator or any other suitable icon
import './Sidebar.css';

const Sidebar = () => {
  return (
    <Box
      className="sidebar"
      w="250px"
      bg="teal.500"
      h="100vh"
      color="white"
      p={4}
    >
      <Flex mb={4} justifyContent="center">
        <Text fontSize="xl" fontWeight="bold">
          My App
        </Text>
      </Flex>

      <VStack spacing={3} align="stretch">
        <NavLink to="/home" activeClassName="active" className="nav-link">
          <Link as={Flex} align="center" fontSize="md" justifyContent="center">
            <FaHome size="1.2em" style={{ marginRight: '8px' }} /> Home
          </Link>
        </NavLink>
        <NavLink to="/classes" activeClassName="active" className="nav-link">
          <Link as={Flex} align="center" fontSize="md" justifyContent="center">
            <FaDoorOpen size="1.2em" style={{ marginRight: '8px' }} /> Classes
          </Link>
        </NavLink>
        {/* Add NavLink for Calorie Calculator */}
        <NavLink to="/calorie-calculator" activeClassName="active" className="nav-link">
          <Link as={Flex} align="center" fontSize="md" justifyContent="center">
            <FaCalculator size="1.2em" style={{ marginRight: '8px' }} /> Calorie Calculator
          </Link>
        </NavLink>
        {/* Additional Links can be added here */}
      </VStack>
    </Box>
  );
};

export default Sidebar;
