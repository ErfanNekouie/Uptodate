import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Modal, Alert, Pressable } from 'react-native';
import axios from 'axios';
import { FontAwesome } from '@expo/vector-icons';

axios.defaults.withCredentials = true;

export default function Articles() {
  const [articles, setArticles] = useState([]);
  const [name, setName] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, []);

  const fetchArticles = async () => {
    const response = await axios.get('http://127.0.0.1:5000/articles');
    setArticles(response.data);
  };

  const fetchCategories = async () => {
    const response = await axios.get('http://127.0.0.1:5000/categories');
    setCategories(response.data);
  };

  const handleFilePick = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) {
      Alert.alert('Error', 'Please choose a file before adding or updating an article.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('author', author);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('file', file);

    try {
      const url = editingArticle
        ? `http://127.0.0.1:5000/articles/${editingArticle.id}`
        : 'http://127.0.0.1:5000/articles';
      const method = editingArticle ? 'put' : 'post';

      const response = await axios({
        method: method,
        url: url,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200 || response.status === 201) {
        fetchArticles();
        setModalVisible(false);
        resetForm();
      } else {
        Alert.alert('Error', `Failed to ${editingArticle ? 'update' : 'add'} article.`);
      }
    } catch (error) {
      console.error(`Error ${editingArticle ? 'updating' : 'adding'} article:`, error);
      Alert.alert('Error', `Failed to ${editingArticle ? 'update' : 'add'} article.`);
    }
  };

  const deleteArticle = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:5000/articles/${id}`);
      fetchArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
      Alert.alert('Error', 'Failed to delete article.');
    }
  };

  const openModal = (article = null) => {
    if (article) {
      setEditingArticle(article);
      setName(article.name);
      setAuthor(article.author);
      setCategory(article.category);
      setDescription(article.description);
    } else {
      resetForm();
    }
    setModalVisible(true);
  };

  const resetForm = () => {
    setEditingArticle(null);
    setName('');
    setAuthor('');
    setCategory('');
    setDescription('');
    setFile(null);
  };

  const filteredArticles = articles.filter((article) =>
    article.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search Articles..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <Pressable style={styles.addButton} onPress={() => openModal()}>
        <FontAwesome name="plus" size={24} color="white" />
      </Pressable>
      <FlatList
        data={filteredArticles}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text>{item.name} - {item.author} - {item.category} - {item.description}</Text>
            <View style={styles.actionsContainer}>
              <Pressable onPress={() => openModal(item)}>
                <FontAwesome name="edit" size={24} color="blue" />
              </Pressable>
              <Pressable onPress={() => deleteArticle(item.id)}>
                <FontAwesome name="trash" size={24} color="red" />
              </Pressable>
            </View>
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Author" value={author} onChangeText={setAuthor} />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={styles.selectInput}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} />
          <input type="file" onChange={handleFilePick} style={styles.fileInput} />
          {file && (
            <View style={styles.fileInfo}>
              <Text style={styles.fileName}>File Name: {file.name}</Text>
              <Text style={styles.fileSize}>File Size: {(file.size / 1024).toFixed(2)} KB</Text>
            </View>
          )}
          <View style={styles.modalButtonContainer}>
            <Pressable style={styles.modalButton} onPress={handleSubmit}>
              <FontAwesome name={editingArticle ? "save" : "plus"} size={24} color="white" />
              <Text style={styles.modalButtonText}>{editingArticle ? "Update" : "Add"}</Text>
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
  selectInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  fileInput: {
    height: 40,
    marginBottom: 12,
  },
  fileInfo: {
    marginBottom: 12,
  },
  fileName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  fileSize: {
    fontSize: 14,
    color: 'gray',
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
