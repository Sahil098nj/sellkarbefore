import React from 'react';
import { ScrollView, Text, StyleSheet, View, Linking, TouchableOpacity } from 'react-native';

export const AboutUsScreen: React.FC = () => {
  const handlePhonePress = () => {
    Linking.openURL('tel:+917411329292');
  };

  const handleEmailPress = () => {
    Linking.openURL('mailto:info@sellkarindia.com');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>About Us</Text>
        <Text style={styles.subtitle}>SellKar India</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.description}>
            SellKar India is a fast, transparent, and doorstep service for selling used phones, laptops, tablets, Macs, and other gadgets across India. We help individuals and businesses get fair value for their old devices without wasting time on negotiations, fake buyers, or marketplace hassle.
          </Text>
        </View>

        <View style={styles.highlightBox}>
          <Text style={styles.highlightTitle}>What We Do</Text>
          <Text style={styles.highlightText}>
            Pick up your gadget from your location, evaluate it instantly, and pay you on the spot.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why We're Different</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>✓ No hidden cuts</Text>
            <Text style={styles.bulletItem}>✓ No reselling drama</Text>
            <Text style={styles.bulletItem}>✓ No waiting</Text>
            <Text style={styles.bulletItem}>✓ Verified team</Text>
            <Text style={styles.bulletItem}>✓ Transparent pricing</Text>
            <Text style={styles.bulletItem}>✓ Same-day payout</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Who We Serve</Text>
          <Text style={styles.description}>
            Anyone across India who wants to sell electronics quickly — students, professionals, retailers, corporates, and even bulk sellers.
          </Text>
        </View>

        <View style={styles.citiesSection}>
          <Text style={styles.sectionTitle}>Our Reach</Text>
          <Text style={styles.description}>
            From Bangalore to 18 cities and growing, powered by a trusted network of local partners and vendors.
          </Text>
          <Text style={styles.citiesNote}>
            Trusted doorstep pickup service available in your city
          </Text>
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Get In Touch</Text>
          
          <TouchableOpacity onPress={handlePhonePress} style={styles.contactButton}>
            <Text style={styles.contactText}>+91 7411 329 292</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleEmailPress} style={styles.contactButton}>
            <Text style={styles.contactText}>info@sellkarindia.com</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 SellKar India. All rights reserved.</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#1a75ce',
    padding: 24,
    paddingTop: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a75ce',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#555',
    lineHeight: 24,
  },
  highlightBox: {
    backgroundColor: '#e8f4fd',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#1a75ce',
  },
  highlightTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a75ce',
    marginBottom: 8,
  },
  highlightText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  bulletList: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
  },
  bulletItem: {
    fontSize: 15,
    color: '#333',
    lineHeight: 28,
  },
  citiesSection: {
    marginBottom: 24,
  },
  citiesNote: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 12,
  },
  contactSection: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a75ce',
    marginBottom: 16,
  },
  contactButton: {
    backgroundColor: '#1a75ce',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  contactText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});

export default AboutUsScreen;