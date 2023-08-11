import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Button, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { requestLocationPermission } from './permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentLocation, calculateDistance } from './location';
import PropTypes from 'prop-types';

const ViewProfile = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [hasPermission, setHasPermission] = useState(null);
  const [location, setLocation] = useState(null);
  const [token, setToken] = useState(null);
  const [sortingOption, setSortingOption] = useState('');

  useEffect(() => {
    const checkPermissionsAndLocation = async () => {
      const locationPermission = await requestLocationPermission();
      setHasPermission(locationPermission);

      if (locationPermission) {
        const loc = await getCurrentLocation();
        setLocation(loc);
      }
    };

    checkPermissionsAndLocation();
  }, []);

  useEffect(() => {
    const checkToken = async () => {
      const jwt = await AsyncStorage.getItem('userToken');
      setToken(jwt);
    };
    checkToken();
  }, []);

  useEffect(() => {
    if (location && token) {
      fetchMyPosts();
    }
  }, [location, token]);

  const fetchMyPosts = async () => {
    try {
      const response = await fetch('http://10.0.2.2:3000/my-posts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'authorization': 'Bearer ' + token,
        },
      });
      const data = await response.json();

      data.posts.forEach((post) => {
        post.distance = calculateDistance(location.latitude, location.longitude, post.latitude, post.longitude);
        // if post was created less than 1 day ago, show in hh:mm without seconds format, if less than a year ago, show in dd/mm, else in dd/mm/yyyy
        const postDate = new Date(post.created_at);
        const now = new Date();
        const diff = now - postDate;
        if (diff < 86400000) {
          post.date = postDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diff < 31536000000) {
          post.date = postDate.toLocaleDateString();
        } else {
          post.date = postDate.toLocaleDateString('en-GB');
        }
      });

     // sort by timestamp most recent first
      data.posts.sort((a, b) => b.created_at - a.created_at);

      setPosts(data.posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (location) {
        fetchMyPosts();
      }
    });
    return unsubscribe;
  }, [navigation]);

  function sortByTime() {
    console.log('sorting by time');
    const sortedPosts = [...posts];
    if (sortingOption === 'time') {
      // just reverse the order
      sortedPosts.reverse();
    } else {
      sortedPosts.sort((a, b) => a.created_at - b.created_at);
      setSortingOption('time');
    }

    setPosts(sortedPosts);
  }

  function sortByDistance() {
    console.log('sorting by distance');
    const sortedPosts = [...posts];
    if (sortingOption === 'distance') {
      // just reverse the order
      sortedPosts.reverse();
    } else {
      sortedPosts.sort((a, b) => a.distance - b.distance);
      setSortingOption('distance');
    }

    setPosts(sortedPosts);
  }

  function handleDelete(id) {
    console.log('deleting post with id', id);
    // Give alert to confirm delete
    Alert.alert(
      'Delete post',
      'Are you sure you want to delete this post?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              const response = await fetch(`http://10.0.2.2:3000/posts/${id}`, { // <-- Corrected the URL
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  'authorization': 'Bearer ' + token,
                },
                body: JSON.stringify({ id }),
              });
              const data = await response.json();
              console.log('data', data);
              if (data.success) {
                fetchMyPosts();
              } else {
                Alert.alert('Error', 'Could not delete post');
              }
            } catch (error) {
              console.error('Error deleting post:', error);
            }
          },
        },
      ],
      { cancelable: false },
    );
  }



  if (!hasPermission) {
    return <View style={styles.container}><Text>No location access</Text></View>;
  }

  if (!location || !token) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {posts.map((post) => (
          <TouchableOpacity key={post.id} style={styles.postContainer} onLongPress={() => handleDelete(post.id)}>
            <Image source={{ uri: post.image_url }} style={styles.postImage} />
            <Text>{post.title}</Text>
            <Text>{post.description}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text>{post.date}</Text>
              <Text>
                {calculateDistance(location.latitude, location.longitude, post.latitude, post.longitude)} km
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.overlay}>
        <View style={styles.leftButton}>
          <Button title="Time" onPress={() => sortByTime()} />
        </View>
        <View style={styles.centerButton}>
          <Button title="Map" onPress={() => navigation.navigate('Map')} />
        </View>
        <View style={styles.rightButton}>
          <Button title="Distance" onPress={() => sortByDistance()} />
        </View>
      </View>
    </View>
  );
};

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollContainer: {
      flexGrow: 1,
      paddingBottom: 60,
      paddingTop: 16,
    },
    postContainer: {
      width: '100%',
      aspectRatio: 1,
      padding: 10,
      marginBottom: 16,
      borderRadius: 5,
      borderColor: '#ddd',
      borderWidth: 1,
      backgroundColor: '#fff',
    },
    postImage: {
      width: '100%',
      height: 200,
      borderRadius: 5,
    },
    overlay: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      paddingHorizontal: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderTopWidth: 1,
      borderTopColor: '#ddd',
    },
    leftButton: {
      flex: 1,
      marginRight: 8,
    },
    rightButton: {
      flex: 1,
      marginLeft: 8,
    },
  });

  ViewProfile.propTypes = {
    navigation: PropTypes.object.isRequired
  };

export default ViewProfile;
