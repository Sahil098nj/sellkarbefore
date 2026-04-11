import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DebugScreen: React.FC = () => {
  console.log('✅ DebugScreen is rendering');
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debug Screen</Text>
      <Text style={styles.text}>App is running and loading screens</Text>
      <Text style={styles.text}>Background color: #E8E8E8</Text>
      <Text style={styles.text}>Text color: Black</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8E8E8',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: '#000',
    marginVertical: 8,
    textAlign: 'center',
  },
});

export default DebugScreen;
