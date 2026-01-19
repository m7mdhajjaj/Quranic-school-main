import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  StatusBar,
} from "react-native";
import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BookOpen, ArrowLeft, ChevronDown } from "lucide-react-native";

const { width, height } = Dimensions.get("window");

const WelcomeScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(1)).current;
  const scrollIndicatorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation sequence
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1.3,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Scroll indicator animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scrollIndicatorAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(scrollIndicatorAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Gradient Background - بدلاً من الفيديو */}
      <LinearGradient
        colors={["#064e3b", "#065f46", "#047857", "#059669"]}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Animated Pattern Overlay */}
      <View style={styles.patternOverlay} />

      {/* Gradient Overlay */}
      <LinearGradient
        colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.5)"]}
        style={styles.overlay}
      />

      {/* Main Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
          },
        ]}>
        {/* Animated Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}>
          {/* Outer Glow Ring */}
          <Animated.View
            style={[
              styles.glowRing,
              {
                transform: [{ scale: glowAnim }],
                opacity: glowAnim.interpolate({
                  inputRange: [1, 1.3],
                  outputRange: [0.3, 0],
                }),
              },
            ]}
          />

          {/* Main Logo Circle */}
          <LinearGradient
            colors={["#10b981", "#14b8a6", "#06b6d4"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoCircle}>
            <View style={styles.logoInner}>
              <BookOpen size={60} color="#ffffff" strokeWidth={2} />
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Welcome Text */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: fadeAnim,
            },
          ]}>
          <LinearGradient
            colors={["#6ee7b7", "#5eead4", "#67e8f9"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.titleGradient}>
            <Text style={styles.mainTitle}>أهلاً وسهلاً</Text>
          </LinearGradient>

          <Text style={styles.subtitle}>
            في <Text style={styles.boldText}>أكاديمية المهاجرين</Text> القرآنية
          </Text>

          <Text style={styles.description}>
            منصة تعليمية متكاملة لتعلم القرآن الكريم وتحفيظه
          </Text>
        </Animated.View>

        {/* CTA Button */}
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity
            style={styles.ctaButton}
            activeOpacity={0.8}>
            <LinearGradient
              colors={["#10b981", "#059669"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaGradient}>
              <Text style={styles.ctaText}>تسجيل الدخول</Text>
              <ArrowLeft size={20} color="#ffffff" />
            </LinearGradient>
          </TouchableOpacity>
        </Link>

        {/* Scroll Indicator - اكتشف المزيد */}
        <Link href="/home" asChild>
          <TouchableOpacity
            style={styles.scrollIndicator}
            activeOpacity={0.6}
            hitSlop={{ top: 20, bottom: 20, left: 40, right: 40 }}>
            <Animated.View
              style={{
                transform: [
                  {
                    translateY: scrollIndicatorAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 10],
                    }),
                  },
                ],
              }}>
              <ChevronDown size={32} color="#d1fae5" />
            </Animated.View>
            <Text style={styles.scrollText}>اكتشف المزيد</Text>
          </TouchableOpacity>
        </Link>
      </Animated.View>
    </View>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#064e3b",
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: width,
    height: height,
  },
  patternOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  logoContainer: {
    marginBottom: 40,
    position: "relative",
    width: 160,
    height: 160,
    justifyContent: "center",
    alignItems: "center",
  },
  glowRing: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  logoCircle: {
    width: 144,
    height: 144,
    borderRadius: 72,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logoInner: {
    width: 136,
    height: 136,
    borderRadius: 68,
    backgroundColor: "rgba(16, 185, 129, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  titleGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
  },
  mainTitle: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 24,
    color: "#d1fae5",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 15,
  },
  boldText: {
    fontWeight: "bold",
    color: "#ffffff",
  },
  description: {
    fontSize: 16,
    color: "#a7f3d0",
    textAlign: "center",
    maxWidth: 320,
    lineHeight: 24,
  },
  ctaButton: {
    marginTop: 20,
    borderRadius: 30,
    overflow: "hidden",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  ctaGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 40,
    gap: 10,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  scrollIndicator: {
    position: "absolute",
    bottom: 40,
    alignItems: "center",
  },
  scrollText: {
    fontSize: 14,
    color: "#d1fae5",
    marginTop: 8,
    fontWeight: "600",
  },
});
