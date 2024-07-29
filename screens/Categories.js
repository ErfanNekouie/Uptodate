import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Modal, Alert, Pressable } from 'react-native';
import axios from 'axios';
import { FontAwesome } from '@expo/vector-icons';

axios.defaults.withCredentials = true;

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const response = await axios.get('http://157.90.234.109:5000/categories');
    setCategories(response.data);
  };

  const addCategory = async () => {
    if (!name) {
      Alert.alert('Error', 'Name is required.');
      return;
    }

    await axios.post('http://157.90.234.109:5000/categories', { name });
    fetchCategories();
    setModalVisible(false);
  };

  const updateCategory = async () => {
    if (!name) {
      Alert.alert('Error', 'Name is required.');
      return;
    }

    await axios.put(`http://157.90.234.109:5000/categories/${editingCategory.id}`, { name });
    fetchCategories();
    setModalVisible(false);
    setEditingCategory(null);
  };

  const deleteCategory = async (id) => {
    await axios.delete(`http://157.90.234.109:5000/categories/${id}`);
    fetchCategories();
  };

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setName(category.name);
    } else {
      setEditingCategory(null);
      setName('');
    }
    setModalVisible(true);
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search Categories..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <Pressable style={styles.addButton} onPress={() => openModal()}>
        <FontAwesome name="plus" size={24} color="white" />
      </Pressable>
      <FlatList
        data={filteredCategories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text>{item.name}</Text>
            <View style={styles.actionsContainer}>
              <Pressable onPress={() => openModal(item)}>
                <FontAwesome name="edit" size={24} color="blue" />
              </Pressable>
              <Pressable onPress={() => deleteCategory(item.id)}>
                <FontAwesome name="trash" size={24} color="red" />
              </Pressable>
            </View>
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
          <View style={styles.modalButtonContainer}>
            <Pressable style={styles.modalButton} onPress={editingCategory ? updateCategory : addCategory}>
              <FontAwesome name={editingCategory ? "save" : "plus"} size={24} color="white" />
              <Text style={styles.modalButtonText}>{editingCategory ? "Update" : "Add"}</Text>
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
