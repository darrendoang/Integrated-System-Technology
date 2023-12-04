import React, { useState, useEffect } from 'react';
import api from './axiosInstance';
import {
  Flex, Box, Heading, Text, List, ListItem, CircularProgress, Button, FormControl, FormLabel, Input, Stack,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure, NumberInput, NumberInputField
} from '@chakra-ui/react';

const AdminCoaches = () => {
  const [coaches, setCoaches] = useState([]);
  const [newCoach, setNewCoach] = useState({ first_name: '', last_name: '', email: '', phone_number: '', experience_years: 0, hourly_rate_idr: 0, availability: '', bio: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCoachId, setEditingCoachId] = useState(null);

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

  const handleInputChange = (e) => {
    setNewCoach({ ...newCoach, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (isEditMode) {
        response = await api.axiosInstance.put(`/coaches/${editingCoachId}`, newCoach);
        setCoaches(coaches.map((c) => (c.coach_id === editingCoachId ? response.data : c)));
      } else {
        response = await api.axiosInstance.post('/coaches', newCoach);
        setCoaches([...coaches, response.data]);
      }
      onClose(); // Close modal
    } catch (error) {
      setError('Failed to process coach');
    } finally {
      setNewCoach({ first_name: '', last_name: '', email: '', phone_number: '', experience_years: 0, hourly_rate_idr: 0, availability: '', bio: '' }); // Reset form
    }
  };

  const openAddModal = () => {
    setNewCoach({ first_name: '', last_name: '', email: '', phone_number: '', experience_years: 0, hourly_rate_idr: 0, availability: '', bio: '' });
    setIsEditMode(false);
    setEditingCoachId(null);
    onOpen();
  };

  const openEditModal = (coach) => {
    setNewCoach({ ...coach });
    setIsEditMode(true);
    setEditingCoachId(coach.coach_id);
    onOpen();
  };

  const handleDeleteCoach = async (coachId) => {
    try {
      await api.axiosInstance.delete(`/coaches/${coachId}`);
      setCoaches(coaches.filter((c) => c.coach_id !== coachId));
    } catch (error) {
      setError('Failed to delete coach');
    }
  };

  return (
    <Box mt={8}>
      <Heading as="h1" size="xl" textAlign="center" mb={4}>Manage Coaches</Heading>

      <Flex justifyContent="center" mb={4}>
        <Button onClick={openAddModal} colorScheme="teal">Add New Coach</Button>
      </Flex>

      {/* Modal for adding/editing a coach */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEditMode ? 'Edit Coach' : 'Add New Coach'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box as="form" onSubmit={handleSubmit}>
              <Stack spacing={4}>
                {/* Form Fields for Coach details */}
                <FormControl>
                  <FormLabel>First Name</FormLabel>
                  <Input type="text" name="first_name" value={newCoach.first_name} onChange={handleInputChange} />
                </FormControl>
                <FormControl>
                  <FormLabel>Last Name</FormLabel>
                  <Input type="text" name="last_name" value={newCoach.last_name} onChange={handleInputChange} />
                </FormControl>
                <FormControl>
                <FormLabel>Email</FormLabel>
                <Input type="email" name="email" value={newCoach.email} onChange={handleInputChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Phone Number</FormLabel>
                <Input type="tel" name="phone_number" value={newCoach.phone_number} onChange={handleInputChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Experience Years</FormLabel>
                <NumberInput min={0}>
                  <NumberInputField name="experience_years" value={newCoach.experience_years} onChange={(e) => handleInputChange(e, 'experience_years')} />
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel>Hourly Rate (IDR)</FormLabel>
                <NumberInput min={0}>
                  <NumberInputField name="hourly_rate_idr" value={newCoach.hourly_rate_idr} onChange={(e) => handleInputChange(e, 'hourly_rate_idr')} />
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel>Availability</FormLabel>
                <Input type="text" name="availability" value={newCoach.availability} onChange={handleInputChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Bio</FormLabel>
                <Input type="text" name="bio" value={newCoach.bio} onChange={handleInputChange} />
              </FormControl>
              </Stack>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>Close</Button>
            <Button type="submit" colorScheme="teal">
              {isEditMode ? 'Save Changes' : 'Add Coach'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Render the list of coaches */}
      {isLoading ? (
        <CircularProgress isIndeterminate color="teal.300" />
      ) : error ? (
        <Text color="red.500">{error}</Text>
      ) : (
        <List spacing={4} maxW="lg" mx="auto">
          {coaches.map((coach) => (
            <ListItem key={coach.coach_id}>
              <Box borderWidth="1px" p={4} borderRadius="lg" boxShadow="md" bg="white" mb={2}>
                {/* Coach details */}
                <Text fontSize="lg"><b>{coach.first_name} {coach.last_name}</b></Text>
              <Text>Email: {coach.email}</Text>
              <Text>Phone: {coach.phone_number}</Text>
              <Text>Experience: {coach.experience_years} years</Text>
              <Text>Rate: {coach.hourly_rate_idr} IDR/hr</Text>
              <Text>Availability: {coach.availability}</Text>
              <Text>Bio: {coach.bio}</Text>
                {/* Add more coach details */}
                <Button colorScheme="red" onClick={() => handleDeleteCoach(coach.coach_id)}>Delete</Button>
                <Button ml={3} colorScheme="teal" onClick={() => openEditModal(coach)}>Edit</Button>
              </Box>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default AdminCoaches;
