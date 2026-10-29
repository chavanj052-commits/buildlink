import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';

const INITIAL_MESSAGES = [
  {
    id: '1',
    senderId: 1,
    senderName: 'John (Company)',
    role: 'company',
    text: 'Good morning team. We have scheduled the 3rd floor slab inspection for this Thursday at 10 AM.',
    time: '09:15 AM',
  },
  {
    id: '2',
    senderId: 3,
    senderName: 'Ramesh (Contractor)',
    role: 'contractor',
    text: 'Understood. Shuttering work is already 95% complete. Rebar spacing matches the structural engineer drawing.',
    time: '09:22 AM',
  },
  {
    id: '3',
    senderId: 2,
    senderName: 'Sarah (Homeowner)',
    role: 'homeowner',
    text: 'Thanks for the update John & Ramesh! I will be visiting the site on Saturday to review the bathroom tile samples.',
    time: '10:05 AM',
  },
  {
    id: '4',
    senderId: 1,
    senderName: 'John (Company)',
    role: 'company',
    text: 'Perfect Sarah. The Italian marble shipment arrived yesterday and is stored securely in the ground floor unit.',
    time: '10:12 AM',
  },
];

export const MessagesScreen = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMsg = {
      id: String(Date.now()),
      senderId: user?.id || 99,
      senderName: `${user?.name || 'You'} (${user?.role || 'user'})`,
      role: user?.role || 'company',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'homeowner':
        return { bg: '#dbeafe', text: theme.colors.info };
      case 'contractor':
        return { bg: '#fef3c7', text: theme.colors.warning };
      case 'company':
      default:
        return { bg: '#ede9fe', text: '#8b5cf6' };
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <Header title="Project Messages" subtitle="SITE CHANNEL" />

      {/* Channel Header Banner */}
      <View style={styles.channelBanner}>
        <Ionicons name="chatbubbles" size={18} color={theme.colors.accent} />
        <View style={styles.channelInfo}>
          <Text style={styles.channelTitle}>Skyline Luxury Villa — General Thread</Text>
          <Text style={styles.channelSub}>All 3 stakeholders connected</Text>
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        renderItem={({ item }) => {
          const isMe = item.senderId === user?.id || item.senderName.includes(user?.name || '');
          const badgeMeta = getRoleBadgeStyle(item.role);

          return (
            <View
              style={[
                styles.bubbleWrapper,
                isMe ? styles.bubbleWrapperRight : styles.bubbleWrapperLeft,
              ]}
            >
              {!isMe && (
                <View style={styles.senderHeader}>
                  <Text style={styles.senderName}>{item.senderName}</Text>
                  <View style={[styles.roleBadge, { backgroundColor: badgeMeta.bg }]}>
                    <Text style={[styles.roleBadgeText, { color: badgeMeta.text }]}>
                      {item.role.toUpperCase()}
                    </Text>
                  </View>
                </View>
              )}

              <View
                style={[
                  styles.bubble,
                  isMe ? styles.bubbleRight : styles.bubbleLeft,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    isMe ? styles.messageTextRight : styles.messageTextLeft,
                  ]}
                >
                  {item.text}
                </Text>
                <Text
                  style={[
                    styles.timestamp,
                    isMe ? styles.timestampRight : styles.timestampLeft,
                  ]}
                >
                  {item.time}
                </Text>
              </View>
            </View>
          );
        }}
      />

      {/* Input Field Bar */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Message project group..."
          placeholderTextColor={theme.colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim()}
          activeOpacity={0.8}
        >
          <Ionicons name="send" size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  channelBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: 10,
  },
  channelInfo: {
    flex: 1,
  },
  channelTitle: {
    fontSize: theme.fontSize.xs + 1,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  channelSub: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  messageList: {
    padding: theme.spacing.md,
    paddingBottom: 20,
  },
  bubbleWrapper: {
    marginBottom: 14,
    maxWidth: '82%',
  },
  bubbleWrapperLeft: {
    alignSelf: 'flex-start',
  },
  bubbleWrapperRight: {
    alignSelf: 'flex-end',
  },
  senderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  senderName: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  bubble: {
    borderRadius: theme.borderRadius.md,
    padding: 12,
    ...theme.shadows.subtle,
  },
  bubbleLeft: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  bubbleRight: {
    backgroundColor: theme.colors.primary,
    borderTopRightRadius: 2,
  },
  messageText: {
    fontSize: theme.fontSize.xs + 2,
    lineHeight: 20,
  },
  messageTextLeft: {
    color: theme.colors.text,
  },
  messageTextRight: {
    color: '#ffffff',
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timestampLeft: {
    color: theme.colors.textMuted,
  },
  timestampRight: {
    color: 'rgba(255, 255, 255, 0.65)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: theme.colors.inputBg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: theme.fontSize.sm,
    maxHeight: 90,
    color: theme.colors.text,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: theme.colors.textMuted,
    opacity: 0.5,
  },
});

export default MessagesScreen;
