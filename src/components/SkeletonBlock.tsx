import React from 'react';
import { StyleSheet, View } from 'react-native';

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
  return (
    <View style={[styles.base, { width, height, borderRadius }, style]}>
      <View style={styles.shimmer} />
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
