import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Pressable, Alert } from 'react-native';
import axios from 'axios';
import { FontAwesome } from '@expo/vector-icons';

export default function AllArticles() {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState('');
  const [likedArticles, setLikedArticles] = useState({});

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    const response = await axios.get('http://127.0.0.1:5000/all_articles');
    setArticles(response.data);
    response.data.forEach(article => {
      checkIfLiked(article.id);
    });
  };

  const checkIfLiked = async (id) => {
    const response = await axios.get(`http://127.0.0.1:5000/articles/${id}/is_liked`);
    setLikedArticles(prevState => ({ ...prevState, [id]: response.data.is_liked }));
  };

  const toggleLikeArticle = async (id) => {
    await axios.post(`http://127.0.0.1:5000/articles/${id}/like`);
    checkIfLiked(id);
    fetchArticles();
  };

  const downloadArticle = async (id) => {
    try {
      const response = await axios.post(`http://127.0.0.1:5000/articles/${id}/download`, {}, { responseType: 'blob' });
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      console.log(url)
      link.setAttribute('download', 'downloaded_file');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading the file:', error);
      Alert.alert('Error', 'Failed to download the file.');
    }
  };

  const filteredArticles = articles.filter(article => 
    article.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Articles</Text>
      <TextInput 
        style={styles.searchInput} 
        placeholder="Search" 
        value={search} 
        onChangeText={setSearch} 
      />
      <FlatList
        data={filteredArticles}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.articleText}>{item.name} - {item.author} - {item.category} - {item.description}</Text>
            <View style={styles.actionsContainer}>
              <Pressable onPress={() => toggleLikeArticle(item.id)}>
                <FontAwesome 
                  name={likedArticles[item.id] ? 'heart' : 'heart-o'} 
                  size={24} 
                  color={likedArticles[item.id] ? 'red' : 'gray'} 
                />
              </Pressable>
              <Pressable onPress={() => downloadArticle(item.id)}>
                <FontAwesome name="download" size={24} color="black" />
              </Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
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
  itemContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    boxShadow: '0 2px 2px rgba(0,0,0,0.2)',
  },
  articleText: {
    fontSize: 16,
    marginBottom: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
