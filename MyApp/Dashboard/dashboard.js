import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Button, ScrollView, TouchableOpacity } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { requestLocationPermission } from './permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentLocation, calculateDistance } from './location';

const Dashboard = ({navigation}) => {
  const [posts, setPosts] = useState([]);
  const [hasPermission, setHasPermission] = useState(null);  // State to track location permission
  const [location, setLocation] = useState(null);
  const [token, setToken] = useState(null);
  const [lastPressPost, setLastPressPost] = useState(0);

  const fetchNearbyPosts = async (latitude, longitude) => {
    try {
      if (!token) {
        const jwt = await AsyncStorage.getItem('userToken');
        setToken(jwt);
        if (!token) {
          navigation.navigate('Auth', { screen: 'Login' });
        }
      }
      const response = await fetch('http://10.0.2.2:3000/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        authorization: 'Bearer ' + token,
        body: JSON.stringify({ latitude, longitude }),
      });

      const data = await response.json();
      data.posts.forEach((post) => {
        post.distance = calculateDistance(location.latitude, location.longitude, post.latitude, post.longitude);
        // if post was created less than 1 hour ago, show xx minutes ago, if less than 1 day ago, show xx hours ago, if less than a year ago, show xx days ago, else in dd/mm/yyyy
        const postDate = new Date(post.created_at);
        const now = new Date();
        const diff = now - postDate;
        if (diff < 3600000) {
          post.date = Math.floor(diff / 60000) + ' minutes ago';
        } else if (diff < 86400000) {
          post.date = Math.floor(diff / 3600000) + ' hours ago';
        } else if (diff < 31536000000) {
          post.date = Math.floor(diff / 86400000) + ' days ago';
        } else {
          post.date = postDate.getDate() + '/' + (postDate.getMonth() + 1) + '/' + postDate.getFullYear();
        }
      });

     // sort by timestamp most recent first
      data.posts.sort((a, b) => b.created_at - a.created_at);
      setPosts(data.posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  // Check for JWT token
useEffect(() => {
  const checkToken = async () => {
    const jwt = await AsyncStorage.getItem('userToken');
    setToken(jwt);
  };

  checkToken();
}, []);

// Check for location permissions and set location if permission is granted
useEffect(() => {
  const checkPermissions = async () => {
    const locationPermission = await requestLocationPermission();

    setHasPermission(locationPermission);

    if (locationPermission) {
      const loc = await getCurrentLocation();
      setLocation(loc);
    }
  };

  checkPermissions();
}, [hasPermission]);

useEffect(() => {
  const unsubscribe = navigation.addListener('focus', () => {
    console.log("Fetching posts...");
    if (location) {
      fetchNearbyPosts(location.latitude, location.longitude);
    } else {
      const checkLocation = async () => {
        const loc = await getCurrentLocation();
        setLocation(loc);
      };

      checkLocation();
    }
  });

  return unsubscribe;
}, [navigation]);


// Fetch nearby posts whenever location changes
useEffect(() => {
  if (location) {
      fetchNearbyPosts(location.latitude, location.longitude);
  }
}, [location]);


  if (!hasPermission) {
    return <View style={styles.container}><Text>No location access</Text></View>;
  } else if (!location) {
    const checkLocation = async () => {
      const loc = await getCurrentLocation();
      setLocation(loc);
    };

    checkLocation();

    return <View style={styles.container}><Text>Loading...</Text></View>;
  } else if (!token) {
    return (
      <View style={styles.container}>
        <Text>You have been logged out. Please log in again.</Text>
        <Button title="Log In" onPress={() => navigation.navigate('Login')} />
      </View>
    );
  }

  const handlePressPost = (id) => () => {
    const now = Date.now();
    if (now - lastPressPost < 300) {
      setLastPressPost(0);
      likePost(id);
    } else {
      setLastPressPost(now);
    }
  };

  const likePost = async (id) => {
    try {
      const response = await fetch('http://10.0.2.2:3000/posts/' + id + '/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
        'authorization': 'Bearer ' + token },
        body: JSON.stringify({id}),
      });

      const data = await response.json();
      if (data.success) {
        //animation
        console.log(data.message);
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };



  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {posts.map((post) => (
          <TouchableOpacity key={post.id} style={styles.postContainer} onPress={handlePressPost(post.id)}>
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
        <Button title="Create" onPress={() => navigation.navigate('Create')} />
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
      marginBottom: 16, // Adjust margin as needed
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
      padding: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });


export default Dashboard;
