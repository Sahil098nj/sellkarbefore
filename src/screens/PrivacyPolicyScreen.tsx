import React from 'react';
import { ScrollView, Text, StyleSheet, View, Linking, TouchableOpacity } from 'react-native';

export const PrivacyPolicyScreen: React.FC = () => {
  const handleEmailPress = () => {
    Linking.openURL('mailto:info@sellkarindia.com');
  };

  const handlePhonePress = () => {
    Linking.openURL('tel:+917411329292');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.subtitle}>SellKar India</Text>
        <Text style={styles.lastUpdated}>Last Updated: January 9, 2025</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.intro}>
          At SellKar India, your privacy is not just a promise — it's our responsibility. We collect only what's needed to provide a smooth, secure, and professional selling experience, and we never misuse or sell your data.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          <Text style={styles.paragraph}>• <Text style={styles.bold}>Personal Info:</Text> Name, mobile number, email, and address — only to contact and complete your transaction.</Text>
          <Text style={styles.paragraph}>• <Text style={styles.bold}>Device Details:</Text> For accurate price quotes and seamless operations.</Text>
          <Text style={styles.paragraph}>• <Text style={styles.bold}>Payment Details:</Text> For secure and instant payouts (never stored after use).</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. How We Use Your Data</Text>
          <Text style={styles.paragraph}>• To contact you for pick-ups, quote confirmations, and support</Text>
          <Text style={styles.paragraph}>• To verify and secure smooth transactions</Text>
          <Text style={styles.paragraph}>• To improve our service and customer experience</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. We Don't Sell Your Data — Ever</Text>
          <Text style={styles.paragraph}>
            Your personal information is never shared with third parties for marketing, ads, or unrelated purposes. It's only shared with trusted partners when needed for a transaction (like pickups or payments).
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Data Security</Text>
          <Text style={styles.paragraph}>• All data is stored securely on encrypted servers</Text>
          <Text style={styles.paragraph}>• We follow strict internal policies for handling personal details</Text>
          <Text style={styles.paragraph}>• Access is limited to verified and trained team members</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Your Device Data is Always Safe</Text>
          <Text style={styles.paragraph}>
            Before resale or recycling, all gadgets we receive are permanently factory reset and data wiped using certified tools. Even if you forget to format it — we do.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Your Control</Text>
          <Text style={styles.paragraph}>
            You can request to update or delete your stored info anytime by contacting us.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Legal Compliance</Text>
          <Text style={styles.paragraph}>
            We follow all applicable data protection laws in India and update this policy as required.
          </Text>
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Contact Us</Text>
          <Text style={styles.contactSubtitle}>For any privacy-related questions or concerns, reach out at:</Text>
          
          <TouchableOpacity onPress={handlePhonePress} style={styles.contactButton}>
            <Text style={styles.contactText}>+91 7411 329 292</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleEmailPress} style={styles.contactButton}>
            <Text style={styles.contactText}>info@sellkarindia.com</Text>
          </TouchableOpacity>
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
  lastUpdated: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.7,
    marginTop: 8,
  },
  content: {
    padding: 20,
  },
  intro: {
    fontSize: 15,
    color: '#333',
    lineHeight: 24,
    marginBottom: 20,
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
  paragraph: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginBottom: 8,
  },
  bold: {
    fontWeight: '600',
    color: '#333',
  },
  contactSection: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 40,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a75ce',
    marginBottom: 8,
  },
  contactSubtitle: {
    fontSize: 14,
    color: '#666',
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
});

export default PrivacyPolicyScreen;