import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Button } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { requestLocationPermission } from './permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentLocation } from './upload';

const Dashboard = ({navigation}) => {
  const [posts, setPosts] = useState([]);
  const [hasPermission, setHasPermission] = useState(null);  // State to track location permission
  const [location, setLocation] = useState(null);
  const [token, setToken] = useState(null);

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

  const fetchNearbyPosts = async (latitude, longitude) => {
    try {
      const response = await fetch('http://10.0.2.2:3000/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        authorization: 'Bearer ' + token,
        body: JSON.stringify({ latitude, longitude }),
      });

      const data = await response.json();
      setPosts(data.posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };


  return (
    <View style={styles.container}>
      <Text>Welcome to the Dashboard!</Text>
      <Button title="Add Post" onPress={() => navigation.navigate('CreatePost')} />
      {posts.map(post => (
        <View key={post.id} style={styles.postContainer}>
{/*             <Text>{post.title}</Text>*/}
        {post.image_url &&
          <Image
            source={{ uri: post.image_url }}
            style={styles.postImage}
            resizeMode="cover"
          />
        }
            {/* Add other post details like description, etc. */}
        </View>
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    postContainer: {
      width: '80%',
      padding: 10,
      marginVertical: 10,
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
  });

export default Dashboard;
