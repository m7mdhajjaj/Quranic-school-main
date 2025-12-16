import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import { useAuth } from "@/hooks/useAuth";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  Phone,
} from "lucide-react-native";

export const Footer: React.FC = () => {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      icon: <Facebook size={20} color="#ffffff" />,
      url: "https://facebook.com",
      name: "Facebook",
    },
    {
      icon: <Instagram size={20} color="#ffffff" />,
      url: "https://instagram.com",
      name: "Instagram",
    },
    {
      icon: <Twitter size={20} color="#ffffff" />,
      url: "https://twitter.com",
      name: "Twitter",
    },
    {
      icon: <Youtube size={20} color="#ffffff" />,
      url: "https://youtube.com",
      name: "YouTube",
    },
  ];

  const handleSocialPress = (url: string) => {
    Linking.openURL(url);
  };

  const handleEmailPress = () => {
    Linking.openURL("mailto:info@quranschool.com");
  };

  const handlePhonePress = () => {
    Linking.openURL("tel:+1234567890");
  };

  return (
    <View style={styles.container}>
      {/* Main Content */}
      <View style={styles.content}>
        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>مدرسة القرآن الكريم</Text>
          <Text style={styles.description}>
            أكاديمية مدرسة المهاجرين - منارة العلم والمعرفة في تعليم القرآن
            الكريم
          </Text>

          {/* Contact Info */}
          <View style={styles.contactContainer}>
            <TouchableOpacity
              style={styles.contactItem}
              onPress={handleEmailPress}
              activeOpacity={0.7}>
              <Mail size={16} color="rgba(255, 255, 255, 0.9)" />
              <Text style={styles.contactText}>info@quranschool.com</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactItem}
              onPress={handlePhonePress}
              activeOpacity={0.7}>
              <Phone size={16} color="rgba(255, 255, 255, 0.9)" />
              <Text style={styles.contactText}>+962 XX XXX XXXX</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Social Links */}
        <View style={styles.socialSection}>
          <Text style={styles.sectionTitle}>تواصل معنا</Text>
          <View style={styles.socialLinks}>
            {socialLinks.map((link, index) => (
              <TouchableOpacity
                key={index}
                style={styles.socialButton}
                onPress={() => handleSocialPress(link.url)}
                activeOpacity={0.7}>
                {link.icon}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Bottom Section */}
      <View style={styles.bottom}>
        <Text style={styles.copyText}>© {currentYear} مدرسة القرآن الكريم</Text>
        <Text style={styles.rightsText}>جميع الحقوق محفوظة</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#10b981",
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  content: {
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 20,
  },
  contactContainer: {
    gap: 8,
    marginTop: 8,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  contactText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
  },
  socialSection: {
    gap: 12,
  },
  socialLinks: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginVertical: 20,
  },
  bottom: {
    alignItems: "center",
    gap: 4,
  },
  copyText: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "600",
  },
  rightsText: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
  },
});
