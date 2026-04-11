import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

type SkeletonBlockProps = {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
};

const SkeletonBlock: React.FC<SkeletonBlockProps> = ({
  width = '100%',
  height = 16,
  borderRadius = 10,
  style,
}) => {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  return (
    <View style={[styles.base, { width, height, borderRadius }, style]}>
      <Animated.View
        style={[
          styles.shimmer,
          {
            opacity: shimmer.interpolate({
              inputRange: [0, 1],
              outputRange: [0.28, 0.6],
            }),
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F8FAFC',
  },
});

export default SkeletonBlock;
