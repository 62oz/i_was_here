/* eslint-disable react/prop-types */
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, Button, TouchableOpacity } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { requestLocationPermission } from './permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentLocation } from './location';
import Animated, { useAnimatedStyle, useAnimatedGestureHandler, useSharedValue } from 'react-native-reanimated';
import { formatPostsDate, generatePostsPositions, generatePostsSizes } from './functions';
import PropTypes from 'prop-types';

const Dashboard = ({navigation}) => {
  const [posts, setPosts] = useState([]);
  const [hasPermission, setHasPermission] = useState(null);  // State to track location permission
  const [location, setLocation] = useState(null);
  const [token, setToken] = useState(null);
  const [lastPressPost, setLastPressPost] = useState(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const accumulatedTranslateX = useSharedValue(0);
  const accumulatedTranslateY = useSharedValue(0);

  const onGestureEvent = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startX = translateX.value;
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      translateX.value = ctx.startX + event.translationX;
      translateY.value = ctx.startY + event.translationY;
    },
    onEnd: () => {
      accumulatedTranslateX.value += translateX.value;
      accumulatedTranslateY.value += translateY.value;
      translateX.value = 0;
      translateY.value = 0;
    }
  });


  ///// Fetch posts from server /////
  const fetchNearbyPosts = useCallback(async (latitude, longitude) => {
    try {
      if (!token) {
        const jwt = await AsyncStorage.getItem('userToken');
        setToken(jwt);
        if (!token) {
          navigation.navigate('Login');
        }
      }
      const response = await fetch('http://10.0.2.2:3000/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        authorization: 'Bearer ' + token,
        body: JSON.stringify({ latitude, longitude }),
      });

      const data = await response.json();

      // format date
      data.posts = formatPostsDate(data.posts, location);

     // sort by timestamp most recent first
      data.posts.sort((a, b) => b.created_at - a.created_at);

      setPosts(data.posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  }, [token, location, navigation]);

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
}, [navigation, fetchNearbyPosts, location]);

// Fetch nearby posts whenever location changes
useEffect(() => {
  if (location) {
      fetchNearbyPosts(location.latitude, location.longitude);
  }
}, [location, fetchNearbyPosts]);

const animatedStyle = useAnimatedStyle(() => {
  return {
    transform: [
      { translateX: translateX.value + accumulatedTranslateX.value },
      { translateY: translateY.value + accumulatedTranslateY.value },
    ],
  };
});

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

// Sort posts by distance
const sortedPosts = [...posts].sort((a, b) => a.distance - b.distance);

const circleSizes = generatePostsSizes(sortedPosts);
const circlePositions = generatePostsPositions(sortedPosts, circleSizes);


// Logging to ensure consistency and inspect values
console.log("Circle Sizes:", circleSizes);
console.log("Circle Positions:", circlePositions);
console.log("Number of sortedPosts:", sortedPosts.length);

return (
  <View style={styles.container}>
    <PanGestureHandler
      maxPointers={1}
      avgTouches={true}
      activeOffsetX={[-20, 20]}
      activeOffsetY={[-20, 20]}
      onGestureEvent={onGestureEvent}
    >
      <Animated.View style={[styles.panContainer, animatedStyle]}>
        <View style={styles.postContainer}>
          {sortedPosts.map((post, index) => (
            <TouchableOpacity
              key={post.id}
              style={{
                ...styles.circle,
                backgroundColor: 'red',
                width: circleSizes[index] || 100,
                height: circleSizes[index] || 100,
                top: (circlePositions[index]?.top || 0) - (circleSizes[index]/2),
                left: (circlePositions[index]?.left || 0) - (circleSizes[index]/2),
              }}
              onPress={() => handlePressPost(post.id)}
            >
              <Image source={{ uri: post.image_url }} style={styles.postImage} />
              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postDescription}>{post.description}</Text>
              <View style={styles.postDetails}>
                <Text>{post.date}</Text>
                <Text>{post.distance}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </PanGestureHandler>

    <View style={styles.overlay}>
      <Button title="Create" onPress={() => navigation.navigate('Create')} />
    </View>
  </View>
);


};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  panContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postContainer: {
    width: '100%',
    height: '100%',
    position: 'relative', // so the absolute positioned children can be positioned relative to this
  },
  circle: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'red', // you used red in your code
    borderRadius: 999,
    padding: 10, // Add some padding inside the circle for better appearance
  },
  postImage: {
    width: '80%', // Fill most of the circle, but leave some padding
    height: '40%', // Take up about 40% of the circle's height
    borderRadius: 999, // To make it circular
    marginBottom: 5, // A little space below the image
  },
  postTitle: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  postDescription: {
    fontSize: 12,
    textAlign: 'center',
  },
  postDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5, // Space above the details
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


Dashboard.propTypes = {
  navigation: PropTypes.object.isRequired
};

export default Dashboard;
