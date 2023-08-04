import React, { useRef } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { RNCamera } from 'react-native-camera';

const CameraScreen = () => {
  const cameraRef = useRef(null);

  const takePicture = async () => {
    if (cameraRef.current) {
      const options = { quality: 0.5, base64: true };
      const data = await cameraRef.current.takePictureAsync(options);
      console.log(data.uri);
      // Handle the captured image here (e.g., upload to your server)
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <RNCamera
        ref={cameraRef}
        style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}
      />
      <TouchableOpacity onPress={takePicture} style={{ padding: 20 }}>
        <Text>Take Photo</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CameraScreen;
