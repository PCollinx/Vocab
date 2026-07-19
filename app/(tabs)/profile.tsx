import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
  Modal,
  Pressable,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Container, Text, Card } from "../../src/components";
import { spacing, borderRadius } from "../../src/constants";
import { useAppStore } from "../../src/store/appStore";
import { useTheme } from "../../src/context/ThemeContext";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { auth } from "../../src/services/firebase";
import {
  scheduleWordReminders,
  cancelAllNotifications,
} from "../../src/services/notificationService";

export default function ProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const {
    userName,
    userAge,
    totalWordsLearned,
    currentStreak,
    resetOnboarding,
    userAvatar,
    setUserAvatar,
    dailyGoal,
    setDailyGoal,
    reminderEnabled,
    setReminderEnabled,
    reminderTime,
    setReminderTime,
    notificationInterval,
    setNotificationInterval,
    updateProfile,
    deleteAccount,
    logout,
    isDarkMode,
    toggleDarkMode,
    dailyWords,
    userBio,
  } = useAppStore();

  const [showDailyGoalModal, setShowDailyGoalModal] = useState(false);
  const [showReminderTimeModal, setShowReminderTimeModal] = useState(false);
  const [selectedHour, setSelectedHour] = useState(
    parseInt(reminderTime.split(":")[0]),
  );
  const [selectedMinute, setSelectedMinute] = useState(
    parseInt(reminderTime.split(":")[1]),
  );
  const [isSchedulingNotifications, setIsSchedulingNotifications] =
    useState(false);

  // Edit Profile state
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAge, setEditAge] = useState("");
  const [editCurrentPassword, setEditCurrentPassword] = useState("");
  const [editNewPassword, setEditNewPassword] = useState("");
  const [editConfirmPassword, setEditConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState(false);

  // Delete Account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePw, setShowDeletePw] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const isGoogleUser = auth.currentUser?.providerData[0]?.providerId === 'google.com';

  const openEditProfile = () => {
    setEditName(userName ?? "");
    setEditBio(userBio ?? "");
    setEditAge(userAge != null ? String(userAge) : "");
    setEditCurrentPassword("");
    setEditNewPassword("");
    setEditConfirmPassword("");
    setEditError("");
    setEditSuccess(false);
    setShowEditProfile(true);
  };

  const handleSaveProfile = async () => {
    setEditError("");
    if (!editName.trim()) return setEditError("Name cannot be empty.");
    if (
      editAge &&
      (isNaN(Number(editAge)) || Number(editAge) < 1 || Number(editAge) > 120)
    ) {
      return setEditError("Enter a valid age.");
    }
    if (editNewPassword && editNewPassword.length < 6)
      return setEditError("New password must be at least 6 characters.");
    if (editNewPassword && editNewPassword !== editConfirmPassword)
      return setEditError("Passwords do not match.");
    if (!editCurrentPassword)
      return setEditError("Enter your current password to save changes.");

    const result = await updateProfile({
      name: editName.trim(),
      bio: editBio.trim() || undefined,
      age: editAge ? Number(editAge) : undefined,
      newPassword: editNewPassword || undefined,
      currentPassword: editCurrentPassword,
    });
    if (!result.success) return setEditError(result.error ?? "Update failed.");
    setEditSuccess(true);
    setTimeout(() => setShowEditProfile(false), 800);
  };

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/auth");
        },
      },
    ]);
  };

  const openDeleteModal = () => {
    setDeletePassword("");
    setDeleteError("");
    setShowDeletePw(false);
    setShowDeleteModal(true);
  };

  const handleDeleteAccount = async () => {
    setDeleteError("");
    if (!isGoogleUser && !deletePassword) return setDeleteError("Enter your password to confirm.");
    const result = await deleteAccount(isGoogleUser ? undefined : deletePassword);
    if (!result.success) return setDeleteError(result.error ?? "Deletion failed.");
    setShowDeleteModal(false);
    router.replace("/auth");
  };

  const achievements = [
    {
      id: "1",
      icon: "star" as const,
      name: "First Word",
      unlocked: true,
      color: colors.streak,
    },
    {
      id: "2",
      icon: "flame" as const,
      name: "7 Day Streak",
      unlocked: currentStreak >= 7,
      color: colors.accent,
    },
    {
      id: "3",
      icon: "book" as const,
      name: "50 Words",
      unlocked: totalWordsLearned >= 50,
      color: colors.primary,
    },
    {
      id: "4",
      icon: "trophy" as const,
      name: "100 Words",
      unlocked: totalWordsLearned >= 100,
      color: colors.correct,
    },
  ];

  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        if (__DEV__) console.log("Permission to access media library denied");
      }
    })();
  }, []);

  const scheduleNotifications = async () => {
    if (dailyWords.length === 0) return; // Words not loaded yet — don't cancel existing notifications
    try {
      setIsSchedulingNotifications(true);
      await scheduleWordReminders(dailyWords, reminderTime, notificationInterval);
    } catch (error) {
      if (__DEV__) console.error("Error scheduling notifications:", error);
    } finally {
      setIsSchedulingNotifications(false);
    }
  };

  useEffect(() => {
    if (reminderEnabled) {
      scheduleNotifications();
    } else {
      cancelAllNotifications();
    }
  }, [dailyGoal, reminderTime, reminderEnabled, notificationInterval, dailyWords.length]);

  const handlePickImage = async (useCamera: boolean) => {
    try {
      let result;
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          alert("Camera permission is required");
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }
      if (!result.canceled && result.assets && result.assets[0]) {
        setUserAvatar(result.assets[0].uri);
      }
    } catch (error) {
      if (__DEV__) console.error("Error picking image:", error);
    }
  };

  const handleDailyGoalChange = (goal: number) => {
    setDailyGoal(goal);
    setShowDailyGoalModal(false);
  };

  const handleReminderTimeChange = () => {
    const hour = String(selectedHour).padStart(2, "0");
    const minute = String(selectedMinute).padStart(2, "0");
    setReminderTime(`${hour}:${minute}`);
    setShowReminderTimeModal(false);
  };

  const hourOptions = Array.from({ length: 24 }, (_, i) => i);
  const minuteOptions = [0, 15, 30, 45];

  return (
    <Container>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={() => {
              Alert.alert(
                "Choose avatar source",
                "",
                [
                  { text: "Camera", onPress: () => handlePickImage(true) },
                  {
                    text: "Photo Library",
                    onPress: () => handlePickImage(false),
                  },
                  { text: "Cancel", style: "cancel" },
                ],
                { cancelable: true },
              );
            }}
          >
            {userAvatar ? (
              <Image source={{ uri: userAvatar }} style={styles.avatarImage} />
            ) : (
              <View
                style={[
                  styles.avatarLarge,
                  { backgroundColor: colors.primaryLight },
                ]}
              >
                {userName ? (
                  <Text style={{ fontSize: 32, color: colors.primary }}>
                    {userName.charAt(0)}
                  </Text>
                ) : (
                  <Ionicons name="person" size={36} color={colors.primary} />
                )}
              </View>
            )}
            <View
              style={[
                styles.cameraIconBadge,
                {
                  backgroundColor: colors.primary,
                  borderColor: colors.surface,
                },
              ]}
            >
              <Ionicons name="camera" size={12} color={colors.white} />
            </View>
          </TouchableOpacity>
          <Text variant="h3" color="heading" style={styles.userName}>
            {userName || "Learner"}
          </Text>
          <Text variant="body" color="muted">
            {userBio}
          </Text>

          <View style={[styles.statsRow, { borderTopColor: colors.border }]}>
            <View style={styles.statItem}>
              <Text variant="h4" color="primary">
                {totalWordsLearned}
              </Text>
              <Text variant="caption" color="muted">
                Words
              </Text>
            </View>
            <View
              style={[styles.statDivider, { backgroundColor: colors.border }]}
            />
            <View style={styles.statItem}>
              <Text variant="h4" color="primary">
                {currentStreak}
              </Text>
              <Text variant="caption" color="muted">
                Streak
              </Text>
            </View>
            <View
              style={[styles.statDivider, { backgroundColor: colors.border }]}
            />
            <View style={styles.statItem}>
              <Text variant="h4" color="primary">
                {Math.floor(totalWordsLearned * 0.85)}
              </Text>
              <Text variant="caption" color="muted">
                Mastered
              </Text>
            </View>
          </View>
        </Card>

        {/* Achievements */}
        <Text variant="h4" color="heading" style={styles.sectionTitle}>
          Achievements
        </Text>
        <View style={styles.achievementsGrid}>
          {achievements.map((achievement) => (
            <View
              key={achievement.id}
              style={[
                styles.achievementCard,
                { backgroundColor: colors.surface },
                !achievement.unlocked && styles.achievementLocked,
              ]}
            >
              <Ionicons
                name={achievement.icon}
                size={24}
                color={
                  achievement.unlocked ? achievement.color : colors.textMuted
                }
              />
              <Text
                variant="caption"
                color={achievement.unlocked ? "heading" : "muted"}
                style={styles.achievementName}
              >
                {achievement.name}
              </Text>
            </View>
          ))}
        </View>

        {/* Settings */}
        <Text variant="h4" color="heading" style={styles.sectionTitle}>
          Settings
        </Text>
        <Card>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons
                name="notifications"
                size={20}
                color={colors.primary}
                style={styles.settingIcon}
              />
              <Text variant="body" color="heading">
                Daily Reminders
              </Text>
            </View>
            <Switch
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={reminderEnabled ? colors.primary : colors.textMuted}
            />
          </View>

          <View
            style={[
              styles.settingItem,
              { borderTopWidth: 1, borderTopColor: colors.border },
            ]}
          >
            <View style={styles.settingInfo}>
              <Ionicons
                name="moon"
                size={20}
                color={colors.primary}
                style={styles.settingIcon}
              />
              <Text variant="body" color="heading">
                Dark Mode
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={isDarkMode ? colors.primary : colors.textMuted}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.settingItem,
              { borderTopWidth: 1, borderTopColor: colors.border },
            ]}
            onPress={() => setShowDailyGoalModal(true)}
          >
            <View style={styles.settingInfo}>
              <Ionicons
                name="flag"
                size={20}
                color={colors.primary}
                style={styles.settingIcon}
              />
              <Text variant="body" color="heading">
                Daily Goal
              </Text>
            </View>
            <View style={styles.settingValue}>
              <Text variant="body" color="muted">
                {dailyGoal} words
              </Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textMuted}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.settingItem,
              { borderTopWidth: 1, borderTopColor: colors.border },
            ]}
            onPress={() => setShowReminderTimeModal(true)}
          >
            <View style={styles.settingInfo}>
              <Ionicons
                name="time"
                size={20}
                color={colors.primary}
                style={styles.settingIcon}
              />
              <Text variant="body" color="heading">
                First Reminder
              </Text>
            </View>
            <View style={styles.settingValue}>
              <Text variant="body" color="muted">
                {reminderTime}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textMuted}
              />
            </View>
          </TouchableOpacity>

          <View style={[styles.settingItem, { borderTopWidth: 1, borderTopColor: colors.border, flexDirection: 'column', alignItems: 'flex-start', gap: spacing[3] }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="alarm-outline" size={20} color={colors.primary} style={styles.settingIcon} />
              <Text variant="body" color="heading">Remind every</Text>
            </View>
            <View style={styles.intervalRow}>
              {[1, 2, 3, 4].map(h => (
                <TouchableOpacity
                  key={h}
                  onPress={() => setNotificationInterval(h)}
                  style={[
                    styles.intervalChip,
                    {
                      backgroundColor: notificationInterval === h ? colors.primary : colors.background,
                      borderColor: notificationInterval === h ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text variant="body" style={{ color: notificationInterval === h ? colors.white : colors.textMuted, fontWeight: '600' }}>
                    {h}h
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text variant="caption" color="muted">
              {`Notifications at: ${
                Array.from({ length: Math.min(dailyWords.length || 5, 5) }, (_, i) => {
                  const [sh, sm] = reminderTime.split(':').map(Number);
                  const total = sh * 60 + sm + i * notificationInterval * 60;
                  const hh = Math.floor(total / 60) % 24;
                  const mm = total % 60;
                  return `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`;
                }).join(', ')
              }`}
            </Text>
          </View>
        </Card>

        {/* Account */}
        <Text variant="h4" color="heading" style={styles.sectionTitle}>
          Account
        </Text>
        <Card>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={openEditProfile}
          >
            <View style={styles.settingInfo}>
              <Ionicons
                name="person-outline"
                size={20}
                color={colors.primary}
                style={styles.settingIcon}
              />
              <Text variant="body" color="heading">
                Edit Profile
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textMuted}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.settingItem,
              { borderTopWidth: 1, borderTopColor: colors.border },
            ]}
            onPress={resetOnboarding}
          >
            <View style={styles.settingInfo}>
              <Ionicons
                name="refresh"
                size={20}
                color={colors.accent}
                style={styles.settingIcon}
              />
              <Text variant="body" color="accent">
                Reset Onboarding
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.settingItem,
              { borderTopWidth: 1, borderTopColor: colors.border },
            ]}
            onPress={handleLogout}
          >
            <View style={styles.settingInfo}>
              <Ionicons
                name="log-out-outline"
                size={20}
                color={colors.wrong}
                style={styles.settingIcon}
              />
              <Text variant="body" color="wrong">
                Log Out
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.settingItem,
              { borderTopWidth: 1, borderTopColor: colors.border },
            ]}
            onPress={openDeleteModal}
          >
            <View style={styles.settingInfo}>
              <Ionicons
                name="trash-outline"
                size={20}
                color={colors.wrong}
                style={styles.settingIcon}
              />
              <Text variant="body" color="wrong">
                Delete Account
              </Text>
            </View>
          </TouchableOpacity>
        </Card>

        {isSchedulingNotifications && (
          <View style={styles.schedulingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text variant="caption" color="muted" style={styles.schedulingText}>
              Scheduling notifications...
            </Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditProfile}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEditProfile(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View
            style={[
              styles.modalSheetContent,
              { backgroundColor: colors.surface },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text variant="h4" color="heading">
                Edit Profile
              </Text>
              <Pressable onPress={() => setShowEditProfile(false)}>
                <Ionicons name="close" size={24} color={colors.textHeading} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {!!editError && (
                <View
                  style={[
                    styles.feedbackBox,
                    { backgroundColor: colors.wrongLight },
                  ]}
                >
                  <Ionicons
                    name="alert-circle-outline"
                    size={15}
                    color={colors.wrong}
                  />
                  <Text
                    variant="bodySmall"
                    style={{ color: colors.wrong, flex: 1 }}
                  >
                    {editError}
                  </Text>
                </View>
              )}
              {editSuccess && (
                <View
                  style={[
                    styles.feedbackBox,
                    { backgroundColor: colors.correctLight },
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={15}
                    color={colors.correct}
                  />
                  <Text
                    variant="bodySmall"
                    style={{ color: colors.correct, flex: 1 }}
                  >
                    Profile updated!
                  </Text>
                </View>
              )}

              <Text variant="label" color="muted" style={styles.editLabel}>
                Full Name
              </Text>
              <View
                style={[
                  styles.editInputRow,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={17}
                  color={colors.textMuted}
                  style={styles.editInputIcon}
                />
                <TextInput
                  style={[styles.editInput, { color: colors.textHeading }]}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Full name"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="words"
                />
              </View>

              <Text variant="label" color="muted" style={styles.editLabel}>
                Bio
              </Text>
              <View
                style={[
                  styles.editInputRow,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="pencil-outline"
                  size={17}
                  color={colors.textMuted}
                  style={styles.editInputIcon}
                />
                <TextInput
                  style={[styles.editInput, { color: colors.textHeading }]}
                  value={editBio}
                  onChangeText={setEditBio}
                  placeholder="A short bio"
                  placeholderTextColor={colors.textMuted}
                  maxLength={60}
                />
              </View>

              <Text variant="label" color="muted" style={styles.editLabel}>
                Age
              </Text>
              <View
                style={[
                  styles.editInputRow,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={17}
                  color={colors.textMuted}
                  style={styles.editInputIcon}
                />
                <TextInput
                  style={[styles.editInput, { color: colors.textHeading }]}
                  value={editAge}
                  onChangeText={setEditAge}
                  placeholder="Age"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                />
              </View>

              <Text variant="label" color="muted" style={styles.editLabel}>
                New Password (optional)
              </Text>
              <View
                style={[
                  styles.editInputRow,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={17}
                  color={colors.textMuted}
                  style={styles.editInputIcon}
                />
                <TextInput
                  style={[
                    styles.editInput,
                    styles.editInputFlex,
                    { color: colors.textHeading },
                  ]}
                  value={editNewPassword}
                  onChangeText={setEditNewPassword}
                  placeholder="Leave blank to keep current"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showNewPw}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPw(!showNewPw)}
                  style={styles.eyeBtn}
                >
                  <Ionicons
                    name={showNewPw ? "eye-off-outline" : "eye-outline"}
                    size={17}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>

              {!!editNewPassword && (
                <>
                  <Text variant="label" color="muted" style={styles.editLabel}>
                    Confirm New Password
                  </Text>
                  <View
                    style={[
                      styles.editInputRow,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={17}
                      color={colors.textMuted}
                      style={styles.editInputIcon}
                    />
                    <TextInput
                      style={[
                        styles.editInput,
                        styles.editInputFlex,
                        { color: colors.textHeading },
                      ]}
                      value={editConfirmPassword}
                      onChangeText={setEditConfirmPassword}
                      placeholder="Confirm new password"
                      placeholderTextColor={colors.textMuted}
                      secureTextEntry={!showNewPw}
                    />
                  </View>
                </>
              )}

              <View
                style={[styles.editDivider, { backgroundColor: colors.border }]}
              />

              <Text variant="label" color="muted" style={styles.editLabel}>
                Current Password (required to save)
              </Text>
              <View
                style={[
                  styles.editInputRow,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="key-outline"
                  size={17}
                  color={colors.textMuted}
                  style={styles.editInputIcon}
                />
                <TextInput
                  style={[
                    styles.editInput,
                    styles.editInputFlex,
                    { color: colors.textHeading },
                  ]}
                  value={editCurrentPassword}
                  onChangeText={setEditCurrentPassword}
                  placeholder="Enter current password"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showCurrentPw}
                />
                <TouchableOpacity
                  onPress={() => setShowCurrentPw(!showCurrentPw)}
                  style={styles.eyeBtn}
                >
                  <Ionicons
                    name={showCurrentPw ? "eye-off-outline" : "eye-outline"}
                    size={17}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleSaveProfile}
              >
                <Text variant="button" color="white">
                  Save Changes
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        visible={showDeleteModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View
            style={[
              styles.modalSheetContent,
              { backgroundColor: colors.surface },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text variant="h4" color="heading">
                Delete Account
              </Text>
              <Pressable onPress={() => setShowDeleteModal(false)}>
                <Ionicons name="close" size={24} color={colors.textHeading} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
            <View
              style={[
                styles.feedbackBox,
                { backgroundColor: colors.wrongLight },
              ]}
            >
              <Ionicons
                name="warning-outline"
                size={15}
                color={colors.wrong}
              />
              <Text
                variant="bodySmall"
                style={{ color: colors.wrong, flex: 1 }}
              >
                This will permanently delete your account and all data including bookmarks, progress, and quiz history. This cannot be undone.
              </Text>
            </View>

            {!!deleteError && (
              <View
                style={[
                  styles.feedbackBox,
                  { backgroundColor: colors.wrongLight, marginTop: spacing[2] },
                ]}
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={15}
                  color={colors.wrong}
                />
                <Text
                  variant="bodySmall"
                  style={{ color: colors.wrong, flex: 1 }}
                >
                  {deleteError}
                </Text>
              </View>
            )}

            {isGoogleUser ? (
              <Text variant="bodySmall" color="muted" style={{ marginBottom: spacing[4] }}>
                You'll be asked to sign in with Google to confirm your identity before deletion.
              </Text>
            ) : (
              <>
                <Text variant="label" color="muted" style={styles.editLabel}>
                  Enter your password to confirm
                </Text>
                <View
                  style={[
                    styles.editInputRow,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name="key-outline"
                    size={17}
                    color={colors.textMuted}
                    style={styles.editInputIcon}
                  />
                  <TextInput
                    style={[
                      styles.editInput,
                      styles.editInputFlex,
                      { color: colors.textHeading },
                    ]}
                    value={deletePassword}
                    onChangeText={setDeletePassword}
                    placeholder="Current password"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showDeletePw}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowDeletePw(!showDeletePw)}
                    style={styles.eyeBtn}
                  >
                    <Ionicons
                      name={showDeletePw ? "eye-off-outline" : "eye-outline"}
                      size={17}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              </>
            )}

            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: colors.wrong },
              ]}
              onPress={handleDeleteAccount}
            >
              <Text variant="button" color="white">
                Delete My Account
              </Text>
            </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Daily Goal Modal */}
      <Modal
        visible={showDailyGoalModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDailyGoalModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalSheetContent,
              { backgroundColor: colors.surface },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text variant="h4" color="heading">
                Daily Goal
              </Text>
              <Pressable onPress={() => setShowDailyGoalModal(false)}>
                <Ionicons name="close" size={24} color={colors.textHeading} />
              </Pressable>
            </View>

            <Text variant="body" color="muted" style={styles.modalDescription}>
              Select how many words you want to learn per day (1-10)
            </Text>

            <View style={styles.goalGrid}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((goal) => (
                <Pressable
                  key={goal}
                  style={[
                    styles.goalButton,
                    {
                      backgroundColor:
                        dailyGoal === goal ? colors.primary : colors.background,
                      borderColor:
                        dailyGoal === goal ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => handleDailyGoalChange(goal)}
                >
                  <View style={styles.goalButtonInner}>
                    <Text
                      variant="h4"
                      color={dailyGoal === goal ? "white" : "heading"}
                      style={styles.goalButtonText}
                    >
                      {goal}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Reminder Time Modal */}
      <Modal
        visible={showReminderTimeModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowReminderTimeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalSheetContent,
              { backgroundColor: colors.surface },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text variant="h4" color="heading">
                Reminder Time
              </Text>
              <Pressable onPress={() => setShowReminderTimeModal(false)}>
                <Ionicons name="close" size={24} color={colors.textHeading} />
              </Pressable>
            </View>

            <Text variant="body" color="muted" style={styles.modalDescription}>
              Select the time to start receiving word reminders
            </Text>

            <View style={styles.timePickerContainer}>
              <View style={styles.pickerColumn}>
                <Text
                  variant="label"
                  color="heading"
                  style={styles.pickerLabel}
                >
                  Hour
                </Text>
                <FlatList
                  data={hourOptions}
                  keyExtractor={(item) => item.toString()}
                  scrollEnabled
                  renderItem={({ item }) => (
                    <Pressable
                      style={[
                        styles.timeOption,
                        {
                          backgroundColor:
                            selectedHour === item
                              ? colors.primary
                              : colors.background,
                        },
                      ]}
                      onPress={() => setSelectedHour(item)}
                    >
                      <Text
                        variant="h4"
                        color={selectedHour === item ? "white" : "heading"}
                      >
                        {String(item).padStart(2, "0")}
                      </Text>
                    </Pressable>
                  )}
                  scrollEventThrottle={16}
                  nestedScrollEnabled
                  style={styles.pickerList}
                />
              </View>

              <View style={styles.pickerColumn}>
                <Text
                  variant="label"
                  color="heading"
                  style={styles.pickerLabel}
                >
                  Minute
                </Text>
                <FlatList
                  data={minuteOptions}
                  keyExtractor={(item) => item.toString()}
                  scrollEnabled
                  renderItem={({ item }) => (
                    <Pressable
                      style={[
                        styles.timeOption,
                        {
                          backgroundColor:
                            selectedMinute === item
                              ? colors.primary
                              : colors.background,
                        },
                      ]}
                      onPress={() => setSelectedMinute(item)}
                    >
                      <Text
                        variant="h4"
                        color={selectedMinute === item ? "white" : "heading"}
                      >
                        {String(item).padStart(2, "0")}
                      </Text>
                    </Pressable>
                  )}
                  scrollEventThrottle={16}
                  nestedScrollEnabled
                  style={styles.pickerList}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={handleReminderTimeChange}
            >
              <Text variant="button" color="white">
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Container>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 50 },
  profileCard: {
    alignItems: "center",
    paddingVertical: spacing[6],
    marginBottom: spacing[6],
  },
  avatarContainer: { position: "relative", marginBottom: spacing[3] },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: { width: 80, height: 80, borderRadius: 40 },
  cameraIconBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  userName: { marginBottom: spacing[1] },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing[4],
    paddingTop: spacing[4],
    borderTopWidth: 1,
  },
  statItem: { flex: 1, alignItems: "center" },
  statDivider: { width: 1, height: 30 },
  sectionTitle: {
    marginHorizontal: spacing[4],
    marginTop: spacing[4],
    marginBottom: spacing[4],
  },
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[3],
    marginBottom: spacing[6],
    paddingHorizontal: spacing[4],
  },
  achievementCard: {
    width: "22%",
    aspectRatio: 1,
    borderRadius: borderRadius.xl,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing[2],
  },
  achievementLocked: { opacity: 0.4 },
  achievementName: { marginTop: spacing[1], textAlign: "center" },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  settingInfo: { flexDirection: "row", alignItems: "center" },
  settingIcon: { marginRight: spacing[3] },
  settingValue: { flexDirection: "row", alignItems: "center", gap: spacing[1] },
  intervalRow: { flexDirection: 'row', gap: spacing[2] },
  intervalChip: { paddingHorizontal: spacing[4], paddingVertical: spacing[2], borderRadius: borderRadius.full, borderWidth: 1 },
  schedulingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing[4],
    gap: spacing[2],
  },
  schedulingText: { marginLeft: spacing[2] },
  bottomSpacer: { height: spacing[20] },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalSheetContent: {
    borderTopLeftRadius: borderRadius["3xl"],
    borderTopRightRadius: borderRadius["3xl"],
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    paddingBottom: spacing[6],
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing[4],
  },
  modalDescription: { marginBottom: spacing[6] },
  goalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[3],
    justifyContent: "center",
  },
  goalButton: {
    width: "22%",
    aspectRatio: 1,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    overflow: "hidden",
  },
  goalButtonInner: { flex: 1, justifyContent: "center", alignItems: "center" },
  goalButtonText: { lineHeight: 20, includeFontPadding: false },
  timePickerContainer: {
    flexDirection: "row",
    gap: spacing[4],
    marginBottom: spacing[6],
    height: 200,
  },
  pickerColumn: { flex: 1 },
  pickerLabel: { textAlign: "center", marginBottom: spacing[2] },
  pickerList: { flex: 1 },
  timeOption: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: borderRadius.md,
    marginVertical: spacing[1],
  },
  actionButton: {
    height: 48,
    borderRadius: borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing[5],
  },

  // Edit Profile
  feedbackBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    borderRadius: borderRadius.md,
    padding: spacing[3],
    marginBottom: spacing[3],
  },
  editLabel: { marginBottom: spacing[1], marginTop: spacing[3] },
  editInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing[3],
    height: 48,
  },
  editInputIcon: { marginRight: spacing[2] },
  editInput: { flex: 1, height: "100%", fontSize: 15 },
  editInputFlex: { flex: 1 },
  eyeBtn: { padding: spacing[1] },
  editDivider: { height: 1, marginTop: spacing[5], marginBottom: spacing[1] },
});
