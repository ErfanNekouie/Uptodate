import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Modal, Alert, Pressable, Picker } from 'react-native';
import axios from 'axios';
import { FontAwesome } from '@expo/vector-icons';

axios.defaults.withCredentials = true;

export default function Users() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const response = await axios.get('http://127.0.0.1:5000/users');
    setUsers(response.data);
  };

  const addUser = async () => {
    if (!name || !username || !email || !password || !role) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    await axios.post('http://127.0.0.1:5000/users', {
      name,
      username,
      email,
      password,
      role,
    });
    fetchUsers();
    setModalVisible(false);
  };

  const updateUser = async () => {
    if (!name || !username || !email || !role) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    await axios.put(`http://127.0.0.1:5000/users/${editingUser.id}`, {
      name,
      username,
      email,
      role,
      ...(password && { password }),
    });
    fetchUsers();
    setModalVisible(false);
    setEditingUser(null);
  };

  const deleteUser = async (id) => {
    await axios.delete(`http://127.0.0.1:5000/users/${id}`);
    fetchUsers();
  };

  const openModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setName(user.name);
      setUsername(user.username);
      setEmail(user.email);
      setRole(user.role);
    } else {
      setEditingUser(null);
      setName('');
      setUsername('');
      setEmail('');
      setRole('');
      setPassword('');
    }
    setModalVisible(true);
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search Users..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <Pressable style={styles.addButton} onPress={() => openModal()}>
        <FontAwesome name="plus" size={24} color="white" />
      </Pressable>
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text>{item.name} - {item.username} - {item.email} - {item.role}</Text>
            <View style={styles.actionsContainer}>
              <Pressable onPress={() => openModal(item)}>
                <FontAwesome name="edit" size={24} color="blue" />
              </Pressable>
              <Pressable onPress={() => deleteUser(item.id)}>
                <FontAwesome name="trash" size={24} color="red" />
              </Pressable>
            </View>
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} />
          <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
          <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
          <Picker selectedValue={role} onValueChange={(itemValue) => setRole(itemValue)} style={styles.picker}>
            <Picker.Item label="Select role" value="" />
            <Picker.Item label="Admin" value="admin" />
            <Picker.Item label="User" value="user" />
          </Picker>
          <View style={styles.modalButtonContainer}>
            <Pressable style={styles.modalButton} onPress={editingUser ? updateUser : addUser}>
              <FontAwesome name={editingUser ? "save" : "plus"} size={24} color="white" />
              <Text style={styles.modalButtonText}>{editingUser ? "Update" : "Add"}</Text>
            </Pressable>
            <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
              <FontAwesome name="times" size={24} color="white" />
              <Text style={styles.modalButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1,
  },
  itemContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    boxShadow: '0 2px 2px rgba(0,0,0,0.2)',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    borderRadius: 10,
    boxShadow: '0 2px 2px rgba(0,0,0,0.2)',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  picker: {
    height: 50,
    marginBottom: 12,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ff0000',
  },
  modalButtonText: {
    color: '#fff',
    marginLeft: 10,
  },
});
