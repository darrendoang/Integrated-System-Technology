import React, { useState, useEffect } from 'react';
import api from './axiosInstance';
import {
  Box,Select,  Heading, Text, List, ListItem, CircularProgress, Button, FormControl, FormLabel, Input, Stack,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure, Flex
} from '@chakra-ui/react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await api.axiosInstance.get('/users'); // Make sure you have a GET /users endpoint
        setUsers(response.data);
      } catch (error) {
        setError('Could not fetch users');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (isEditMode) {
        response = await api.axiosInstance.put(`/users/${editingUserId}`, newUser);
        setUsers(users.map((u) => (u.user_id === editingUserId ? response.data : u)));
      } else {
        response = await api.axiosInstance.post('/signup', newUser);
        setUsers([...users, response.data]);
      }
      setNewUser({ username: '', password: '', role: '' }); // Reset form
      onClose(); // Close modal
    } catch (error) {
      setError('Failed to process user');
    }
  };

  const openAddModal = () => {
    setNewUser({ username: '', password: '', role: '' });
    setIsEditMode(false);
    setEditingUserId(null);
    onOpen();
  };

  const openEditModal = (userItem) => {
    setNewUser({ ...userItem, password: '' }); // Don't pre-fill the password
    setIsEditMode(true);
    setEditingUserId(userItem.user_id);
    onOpen();
  };

  const handleDeleteUser = async (userId) => {
    try {
      await api.axiosInstance.delete(`/users/${userId}`); // Make sure you have a DELETE /users/{userId} endpoint
      setUsers(users.filter((userItem) => userItem.user_id !== userId));
    } catch (error) {
      setError('Failed to delete user');
    }
  };

  return (
    <Box mt={8}>
      <Heading as="h1" size="xl" textAlign="center" mb={4}>Manage Users</Heading>

      <Flex justifyContent="center" mb={4}>
        <Button onClick={openAddModal} colorScheme="teal">Add New User</Button>
      </Flex>

      {/* Modal for adding/editing a user */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEditMode ? 'Edit User' : 'Add New User'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box as="form" onSubmit={handleSubmit}>
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Username:</FormLabel>
                  <Input name="username" value={newUser.username} onChange={handleInputChange} />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Password:</FormLabel>
                  <Input name="password" type="password" value={newUser.password} onChange={handleInputChange} />
                </FormControl>
                <FormControl isRequired>
                <FormLabel>Role:</FormLabel>
                <Select name="role" value={newUser.role} onChange={handleInputChange}>
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="customer">Customer</option>
                </Select>
              </FormControl>
              </Stack>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>Close</Button>
            <Button type="submit" colorScheme="teal" onClick={handleSubmit}>
              {isEditMode ? 'Save Changes' : 'Add User'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Render the list of users */}
      {isLoading ? (
        <CircularProgress isIndeterminate color="teal.300" />
      ) : error ? (
        <Text color="red.500">{error}</Text>
      ) : (
        <List spacing={4} maxW="lg" mx="auto">
          {users.map((userItem) => (
            <ListItem key={userItem.user_id}>
              <Box borderWidth="1px" p={4} borderRadius="lg" boxShadow="md" bg="white" mb={2}>
                <Heading as="h2" size="lg">{userItem.username}</Heading>
                <Text>Role: {userItem.role}</Text>
                <Button colorScheme="red" onClick={() => handleDeleteUser(userItem.user_id)}>Delete</Button>
                <Button ml={3} colorScheme="teal" onClick={() => openEditModal(userItem)}>Edit</Button>
              </Box>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default AdminUsers;
