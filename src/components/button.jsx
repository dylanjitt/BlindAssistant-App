import React, { useState, useRef, useEffect } from "react";
import { StyleSheet, TouchableOpacity, View, Animated, PanResponder,Pressable } from "react-native";
import { DollarIcon } from "./DollarIcon";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';

const PhotoShutter = ({ takePhoto, taken, backToPhoto, listModes, setMode, mode, loading }) => {
  // Animation values
  const leftIconAnim = useRef(new Animated.Value(1)).current;
  const centerIconAnim = useRef(new Animated.Value(1)).current;
  const rightIconAnim = useRef(new Animated.Value(1)).current;

  const leftPositionAnim = useRef(new Animated.Value(0)).current;
  const centerPositionAnim = useRef(new Animated.Value(0)).current;
  const rightPositionAnim = useRef(new Animated.Value(0)).current;

  // Get icon component based on mode
  const getIcon = (modeType) => {
    switch (modeType) {
      case 'money':
        return <DollarIcon />;
      case 'minibus':
        return <FontAwesome5 name="car" size={55} color="black" />;
      case 'vision':
        return <Ionicons name="eye" size={55} color="black" />;
      default:
        return <DollarIcon />;
    }
  };

  // Get current mode index
  const currentModeIndex = listModes.indexOf(mode || listModes[0]);

  // Get modes for left, center, right positions
  const getModesForPositions = () => {
    const leftIndex = currentModeIndex === 0 ? listModes.length - 1 : currentModeIndex - 1;
    const rightIndex = currentModeIndex === listModes.length - 1 ? 0 : currentModeIndex + 1;

    return {
      left: listModes[leftIndex],
      center: listModes[currentModeIndex],
      right: listModes[rightIndex]
    };
  };

  const modes = getModesForPositions();

  // Pan responder for swipe detection
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > 15 && Math.abs(gestureState.dy) < 100;
    },
    // onPanResponderGrant: () => {
    //   // Prevent multiple animations from running
    // },
    // onPanResponderMove: (evt, gestureState) => {
    //   console.log(mode)
    //   // Optional: Add real-time movement feedback here
    // },
    onPanResponderRelease: (evt, gestureState) => {
      if (Math.abs(gestureState.dx) > 40) {
        if (gestureState.dx > 0) {
          // Swipe right - move to previous mode
          animateToNextMode('right');
        } else {
          // Swipe left - move to next mode
          animateToNextMode('left');
        }
      }
    },
  });

  const animateToNextMode = (direction) => {
    const duration = 250;
    const moveDistance = 90;

    // Reset all animations to start position before starting new animation
    Animated.parallel([
      Animated.timing(leftPositionAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      Animated.timing(centerPositionAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      Animated.timing(rightPositionAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      Animated.timing(leftIconAnim, { toValue: 1, duration: 0, useNativeDriver: true }),
      Animated.timing(centerIconAnim, { toValue: 1, duration: 0, useNativeDriver: true }),
      Animated.timing(rightIconAnim, { toValue: 1, duration: 0, useNativeDriver: true }),
    ]).start(() => {
      if (direction === 'left') {
        // Swipe left: move to next mode
        Animated.parallel([
          // Center icon moves left and fades
          Animated.timing(centerPositionAnim, {
            toValue: -moveDistance,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(centerIconAnim, {
            toValue: 0.6,
            duration: duration,
            useNativeDriver: true,
          }),

          // Right icon moves to center
          Animated.timing(rightPositionAnim, {
            toValue: -moveDistance,
            duration: duration,
            useNativeDriver: true,
          }),

          // Left icon moves to right
          Animated.timing(leftPositionAnim, {
            toValue: moveDistance * 2,
            duration: duration,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Update mode
          const newModeIndex = currentModeIndex === listModes.length - 1 ? 0 : currentModeIndex + 1;
          setMode(listModes[newModeIndex]);
          resetAnimations();

        });
      } else {
        // Swipe right: move to previous mode
        Animated.parallel([
          // Center icon moves right and fades
          Animated.timing(centerPositionAnim, {
            toValue: moveDistance,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(centerIconAnim, {
            toValue: 0.6,
            duration: duration,
            useNativeDriver: true,
          }),

          // Left icon moves to center
          Animated.timing(leftPositionAnim, {
            toValue: moveDistance,
            duration: duration,
            useNativeDriver: true,
          }),

          // Right icon moves to left
          Animated.timing(rightPositionAnim, {
            toValue: -moveDistance * 2,
            duration: duration,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Update mode
          const newModeIndex = currentModeIndex === 0 ? listModes.length - 1 : currentModeIndex - 1;
          setMode(listModes[newModeIndex]);
          resetAnimations();
        });
      }
    });
  };

  const resetAnimations = () => {
    // Use immediate reset with duration 0
    Animated.parallel([
      Animated.timing(leftPositionAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      Animated.timing(centerPositionAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      Animated.timing(rightPositionAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      Animated.timing(leftIconAnim, { toValue: 1, duration: 0, useNativeDriver: true }),
      Animated.timing(centerIconAnim, { toValue: 1, duration: 0, useNativeDriver: true }),
      Animated.timing(rightIconAnim, { toValue: 1, duration: 0, useNativeDriver: true }),
    ]).start();
  };

  const takePicture = () => {
    takePhoto();
  };

  const backToCamera = () => {
    backToPhoto();
  };

  return (
    <View style={styles.container} {...(!taken ? panResponder.panHandlers : {})}>
      {!taken ? (
        <>
          {/* Left button */}
          <Animated.View style={[
            styles.button2,
            {
              transform: [
                { translateX: leftPositionAnim },
                { scale: leftIconAnim }
              ]
            }
          ]}>
            <TouchableOpacity
              style={styles.buttonTouchable}
              onPress={() => animateToNextMode('right')}
            >
              {getIcon(modes.left)}
            </TouchableOpacity>
          </Animated.View>

          {/* Center main button - container stays fixed */}
          <View style={styles.mainButton}>
            <TouchableOpacity onPress={takePicture} style={styles.button}>
              <Animated.View style={{
                transform: [
                  { translateX: centerPositionAnim },
                  { scale: centerIconAnim }
                ]
              }}>
                {getIcon(modes.center)}
              </Animated.View>
            </TouchableOpacity>
          </View>

          {/* Right button */}
          <Animated.View style={[
            styles.button2,
            {
              transform: [
                { translateX: rightPositionAnim },
                { scale: rightIconAnim }
              ]
            }
          ]}>
            <TouchableOpacity
              style={styles.buttonTouchable}
              onPress={() => animateToNextMode('left')}
            >
              {getIcon(modes.right)}
            </TouchableOpacity>
          </Animated.View>
        </>
      ) : (
        <View style={styles.mainButton}>
          <Pressable
            onPress={backToCamera}
            disabled={loading}
            style={({ pressed }) => [
              styles.button,
              {
                opacity: loading ? 0.3 : (pressed ? 0.4 : 1),
              }
            ]}
          >
            <AntDesign name="closecircle" size={55} color="black" />
          </Pressable>

        </View>
      )}
    </View>
  );
};

export default PhotoShutter;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: '100%',
    paddingBottom: 20
  },
  mainButton: {
    height: 94,
    width: 162,
    backgroundColor: '#000',
    borderWidth: 5,
    borderColor: '#d9d9d9',
    borderRadius: 50,
    display: 'flex',
    alignItems: "center",
    justifyContent: "center"
  },
  button: {
    height: 87,
    width: 154,
    backgroundColor: '#d9d9d9',
    borderWidth: 5,
    borderRadius: 60,
    display: 'flex',
    alignItems: "center",
    justifyContent: "center"
  },
  button2: {
    height: 75,
    width: 75,
    backgroundColor: '#d9d9d9',
    display: 'flex',
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
    margin: 10
  },
  buttonTouchable: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  }
});