import React, { useState, useEffect } from 'react';
import api from './axiosInstance';
import {
  Flex, Box, Heading, Text, List, ListItem, CircularProgress, Button, FormControl, FormLabel, Input, Stack,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure
} from '@chakra-ui/react';

const AdminClasses = () => {
  const [classes, setClasses] = useState([]);
  const [newClass, setNewClass] = useState({ class_type: '', coach_id: '', start_time: '', end_time: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingClassId, setEditingClassId] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      setIsLoading(true);
      try {
        const response = await api.axiosInstance.get('/classes');
        setClasses(response.data);
      } catch (error) {
        setError('Could not fetch classes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const handleInputChange = (e) => {
    setNewClass({ ...newClass, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (isEditMode) {
        response = await api.axiosInstance.put(`/classes/${editingClassId}`, newClass);
        setClasses(classes.map((c) => (c.class_id === editingClassId ? response.data : c)));
      } else {
        response = await api.axiosInstance.post('/classes', newClass);
        setClasses([...classes, response.data]);
      }
      setNewClass({ class_type: '', coach_id: '', start_time: '', end_time: '' }); // Reset form
      onClose(); // Close modal
    } catch (error) {
      setError('Failed to process class');
    }
  };

  const openAddModal = () => {
    setNewClass({ class_type: '', coach_id: '', start_time: '', end_time: '' });
    setIsEditMode(false);
    setEditingClassId(null);
    onOpen();
  };

  const openEditModal = (classItem) => {
    setNewClass({ ...classItem });
    setIsEditMode(true);
    setEditingClassId(classItem.class_id);
    onOpen();
  };

  const handleDeleteClass = async (classId) => {
    try {
      await api.axiosInstance.delete(`/classes/${classId}`);
      setClasses(classes.filter((classItem) => classItem.class_id !== classId));
    } catch (error) {
      setError('Failed to delete class');
    }
  };

  return (
    <Box mt={8}>
      <Heading as="h1" size="xl" textAlign="center" mb={4}>Manage Classes</Heading>

      <Flex justifyContent="center" mb={4}>
      <Button onClick={openAddModal} colorScheme="teal">Add New Class</Button>
    </Flex>

      {/* Modal for adding/editing a class */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEditMode ? 'Edit Class' : 'Add New Class'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* Form inside the modal */}
            <Box as="form" onSubmit={handleSubmit}>
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Class Type:</FormLabel>
                  <Input name="class_type" value={newClass.class_type} onChange={handleInputChange} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Coach ID:</FormLabel>
                  <Input name="coach_id" type="number" value={newClass.coach_id} onChange={handleInputChange} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Start Time:</FormLabel>
                  <Input name="start_time" type="datetime-local" value={newClass.start_time} onChange={handleInputChange} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>End Time:</FormLabel>
                  <Input name="end_time" type="datetime-local" value={newClass.end_time} onChange={handleInputChange} />
                </FormControl>
              </Stack>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>Close</Button>
            <Button type="submit" colorScheme="teal" onClick={handleSubmit}>
              {isEditMode ? 'Save Changes' : 'Add Class'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ... rest of your component ... */}
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
                <Text>Coach ID: {classItem.coach_id}</Text>
                <Text>Start Time: {classItem.start_time}</Text>
                <Text>End Time: {classItem.end_time}</Text>
                <Button colorScheme="red" onClick={() => handleDeleteClass(classItem.class_id)}>Delete</Button>
                <Button ml={3} colorScheme="teal" onClick={() => openEditModal(classItem)}>Edit</Button>
              </Box>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default AdminClasses;
