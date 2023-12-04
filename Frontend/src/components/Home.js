import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Heading, Text, Button, Flex, Image } from '@chakra-ui/react';
import fitnessImage from './fitness.jpg';

const Home = () => {
  const navigate = useNavigate();

  const navigateToClasses = () => {
    navigate('/classes');
  };

  const navigateToCoaches = () => {
    navigate('/coaches');
  };

  return (
    <Box maxW="lg" mx="auto" mt={8} p={4} borderWidth="1px" borderRadius="md">
      <Flex flexDirection="column" alignItems="center" justifyContent="center">
        <Heading as="h1" size="xl" align="center" mb={4}>
          Welcome to Class Registration App
        </Heading>
        <Text fontSize="lg" textAlign="center" mb={6}>
          Explore classes, meet coaches, and manage your fitness journey!
        </Text>
        <Image src={fitnessImage} alt="Fitness"  mb={4} />
        <Button colorScheme="teal" onClick={navigateToClasses} mb={2}>
          Explore Classes
        </Button>
        <Button colorScheme="teal" onClick={navigateToCoaches} mb={2}>
          Meet Our Coaches
        </Button>
          <Button colorScheme="blue" onClick={() => navigate('/admin-home')} mb={2}>
            Admin Dashboard
          </Button>
      </Flex>
    </Box>
  );
};

export default Home;
