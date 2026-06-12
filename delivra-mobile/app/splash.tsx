import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator, Image } from 'react-native';
import { Svg, Path } from 'react-native-svg';

interface Props {
  onComplete: () => void;
}

export default function SplashScreenComponent({ onComplete }: Props) {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Navigate after 2.5s
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* City Skyline Silhouette */}
      <View style={styles.skylineContainer}>
        <Svg width="100%" height="120" viewBox="0 0 400 120" preserveAspectRatio="none">
          <Path
            d="M0 120 L0 80 L20 80 L20 60 L40 60 L40 90 L50 90 L50 50 L70 50 L70 85 L90 85 L90 70 L110 70 L110 95 L130 95 L130 55 L150 55 L150 80 L170 80 L170 65 L190 65 L190 90 L210 90 L210 45 L230 45 L230 85 L250 85 L250 60 L270 60 L270 95 L290 95 L290 70 L310 70 L310 85 L330 85 L330 50 L350 50 L350 90 L370 90 L370 75 L390 75 L390 120 L400 120 L400 120 L0 120 Z"
            fill="#1E4099"
          />
        </Svg>
      </View>

      {/* Logo */}
      <Image
        source={require('../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Tagline */}
      <Text style={styles.tagline}>
        <Text style={styles.white}>Fast delivery, </Text>
        <Text style={styles.orange}>trusted service</Text>
      </Text>

      {/* Wave at bottom */}
      <View style={styles.waveContainer}>
        <Svg width="100%" height="80" viewBox="0 0 400 80" preserveAspectRatio="none">
          <Path
            d="M0 40 Q100 20 200 40 T400 40 L400 80 L0 80 Z"
            fill="#FF6B1A"
          />
          <Path
            d="M0 50 Q100 30 200 50 T400 50 L400 80 L0 80 Z"
            fill="#FFFFFF"
            opacity="0.3"
          />
        </Svg>
      </View>

      {/* Loading indicator */}
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#FFFFFF" />
        <Text style={styles.loading}>Loading...</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A3A8F',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  skylineContainer: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    height: 120,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  tagline: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  white: {
    color: '#FFFFFF',
  },
  orange: {
    color: '#FF6B1A',
  },
  waveContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    height: 80,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loading: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
