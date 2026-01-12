import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Animated,
  Alert,
  Keyboard,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Send,
  ArrowLeft,
  Sparkles,
  BookOpen,
  RefreshCw,
  MoreVertical,
} from "lucide-react-native";
import api from "@/Api/api";
import type { AiMessage, AiChatResponse } from "@/types/aiChat";

export default function AiChatScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const textInputRef = useRef<TextInput>(null);

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const initialMessage: AiMessage = {
    id: "1",
    role: "assistant",
    content:
      "السلام عليكم ورحمة الله وبركاته! 🌟\n\nأنا مساعدك الذكي لتفسير القرآن الكريم والأحكام الإسلامية.\n\n💡 يمكنك السؤال بأي طريقة:\n• تفسير سورة الإخلاص\n• سورة البقرة آية 255\n• الآية الأولى من سورة طه\n• ما تفسير آية الكرسي\n• اشرح لي سورة الفاتحة\n• أحكام الوضوء\n• فضل قراءة القرآن\n\nأسأل عن أي آية أو حكم تريد معرفته! 📖",
    timestamp: new Date(),
  };

  const [messages, setMessages] = useState<AiMessage[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const clearChat = () => {
    Alert.alert("مسح المحادثة", "هل أنت متأكد من أنك تريد مسح جميع الرسائل؟", [
      {
        text: "إلغاء",
        style: "cancel",
      },
      {
        text: "مسح",
        style: "destructive",
        onPress: () => setMessages([initialMessage]),
      },
    ]);
  };
  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
    // Force scroll with additional attempts
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: false });
    }, 50);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        // Multiple scroll attempts for better positioning
        setTimeout(() => scrollToBottom(), 100);
        setTimeout(() => scrollToBottom(), 300);
        setTimeout(() => scrollToBottom(), 500);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: AiMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Scroll to bottom after adding user message
    setTimeout(() => scrollToBottom(), 100);

    try {
      const response = await api.post("/ai-chat", {
        message: userMessage.content,
      });
      const data = response.data as AiChatResponse;

      if (data.success && data.data?.message) {
        const aiMessage: AiMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.data.message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error(
          data.message || "فشل في الحصول على رد من الذكاء الاصطناعي"
        );
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      let errorText = "عذراً، حدث خطأ. يرجى المحاولة لاحقاً.";

      // Handle specific error cases
      if (error.response?.status === 401) {
        errorText = "يرجى تسجيل الدخول أولاً.";
      } else if (error.response?.status === 429) {
        errorText = "تم تجاوز حد الطلبات. يرجى المحاولة لاحقاً.";
      } else if (error.message?.includes("Network")) {
        errorText = "تحقق من اتصال الإنترنت وحاول مرة أخرى.";
      }

      const errorMessage: AiMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: errorText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidContainer}
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 80}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}>
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <Sparkles size={20} color="#fbbf24" />
            </View>
            <View>
              <Text style={styles.headerTitle}>المساعد الإسلامي</Text>
              <Text style={styles.headerSubtitle}>مدعوم بالذكاء الاصطناعي</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.clearButton} onPress={clearChat}>
            <RefreshCw size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Messages Area */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive">
          {messages.map((message, index) => (
            <View
              key={message.id}
              style={[
                styles.messageWrapper,
                message.role === "user"
                  ? styles.userMessageWrapper
                  : styles.aiMessageWrapper,
              ]}>
              <View
                style={[
                  styles.messageBubble,
                  message.role === "user"
                    ? styles.userMessage
                    : styles.aiMessage,
                ]}>
                {message.role === "assistant" && (
                  <View style={styles.aiHeader}>
                    <Sparkles size={12} color="#10b981" />
                    <Text style={styles.aiLabel}>الذكاء الاصطناعي</Text>
                  </View>
                )}
                <Text
                  style={[
                    styles.messageText,
                    message.role === "user"
                      ? styles.userMessageText
                      : styles.aiMessageText,
                  ]}>
                  {message.content}
                </Text>
                <Text
                  style={[
                    styles.messageTime,
                    message.role === "user"
                      ? styles.userMessageTime
                      : styles.aiMessageTime,
                  ]}>
                  {formatTime(message.timestamp)}
                </Text>
              </View>
            </View>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <View style={[styles.messageWrapper, styles.aiMessageWrapper]}>
              <View style={[styles.messageBubble, styles.aiMessage]}>
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#10b981" />
                  <Text style={styles.loadingText}>جاري تحليل المصادر...</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Helper Tip */}
        <View style={styles.tipContainer}>
          <View style={styles.tipIcon}>
            <BookOpen size={14} color="#10b981" />
          </View>
          <Text style={styles.tipText}>
            للحصول على أدق النتائج، يرجى تحديد السورة ورقم الآية.
          </Text>
        </View>

        {/* Input Area */}
        <View
          style={[
            styles.inputContainer,
            {
              marginBottom:
                Platform.OS === "android"
                  ? Math.max(keyboardHeight * 0.3, 20)
                  : keyboardHeight > 0
                    ? 40
                    : 0,
            },
          ]}>
          <View style={styles.inputWrapper}>
            <TextInput
              ref={textInputRef}
              style={styles.textInput}
              placeholder="اسأل عن آية أو حكم فقهي..."
              placeholderTextColor="#9ca3af"
              value={input}
              onChangeText={setInput}
              multiline
              textAlign="right"
              editable={!isLoading}
              maxLength={500}
              returnKeyType="send"
              blurOnSubmit={false}
              onSubmitEditing={handleSubmit}
              onFocus={() => {
                // Multiple scroll attempts with different delays
                setTimeout(() => scrollToBottom(), 100);
                setTimeout(() => scrollToBottom(), 300);
                setTimeout(() => scrollToBottom(), 600);
                setTimeout(() => scrollToBottom(), 1000);
              }}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!input.trim() || isLoading) && styles.sendButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!input.trim() || isLoading}>
              <Send size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  keyboardAvoidContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10b981",
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 16,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 2,
  },
  clearButton: {
    padding: 8,
    marginLeft: 8,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 150, // Increased padding for better keyboard clearance
  },
  messageWrapper: {
    marginBottom: 12,
  },
  userMessageWrapper: {
    alignItems: "flex-end",
  },
  aiMessageWrapper: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "85%",
    padding: 12,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userMessage: {
    backgroundColor: "#10b981",
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    backgroundColor: "#ffffff",
    borderColor: "#e5e7eb",
    borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 4,
  },
  aiLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#10b981",
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "right",
  },
  userMessageText: {
    color: "#ffffff",
  },
  aiMessageText: {
    color: "#374151",
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    textAlign: "right",
  },
  userMessageTime: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  aiMessageTime: {
    color: "#9ca3af",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: "#6b7280",
  },
  tipContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    margin: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1fae5",
  },
  tipIcon: {
    marginRight: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    color: "#047857",
    fontWeight: "500",
    textAlign: "right",
  },
  inputContainer: {
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    // Ensure input container stays above keyboard
    zIndex: 1000,
    // Add shadow for better separation
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#f9fafb",
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 60, // Increased minimum height
  },
  textInput: {
    flex: 1,
    maxHeight: 120, // Increased max height
    fontSize: 16,
    color: "#374151",
    textAlignVertical: "center",
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: "#9ca3af",
    shadowOpacity: 0,
    elevation: 0,
  },
});
