/**
 * Profile Screen
 * User settings and achievements
 */

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
import { colors, spacing, borderRadius } from "../../src/constants";
import { useAppStore } from "../../src/store/appStore";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { scheduleWordReminders } from "../../src/services/notificationService";
import { getRandomWords } from "../../src/data/wordList";
import { getWords } from "../../src/services/dictionaryApi";

export default function ProfileScreen() {
  const router = useRouter();
  const {
    userName,
    userEmail,
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
    updateProfile,
    logout,
  } = useAppStore();

  const [darkMode, setDarkMode] = useState(false);
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
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editCurrentPassword, setEditCurrentPassword] = useState('');
  const [editNewPassword, setEditNewPassword] = useState('');
  const [editConfirmPassword, setEditConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState(false);

  const openEditProfile = () => {
    setEditName(userName ?? '');
    setEditEmail(userEmail ?? '');
    setEditAge(userAge != null ? String(userAge) : '');
    setEditCurrentPassword('');
    setEditNewPassword('');
    setEditConfirmPassword('');
    setEditError('');
    setEditSuccess(false);
    setShowEditProfile(true);
  };

  const handleSaveProfile = () => {
    setEditError('');
    if (!editName.trim()) return setEditError('Name cannot be empty.');
    if (editEmail && !/\S+@\S+\.\S+/.test(editEmail)) return setEditError('Enter a valid email.');
    if (editAge && (isNaN(Number(editAge)) || Number(editAge) < 1 || Number(editAge) > 120)) {
      return setEditError('Enter a valid age.');
    }
    if (editNewPassword && editNewPassword.length < 6) return setEditError('New password must be at least 6 characters.');
    if (editNewPassword && editNewPassword !== editConfirmPassword) return setEditError('Passwords do not match.');
    if (!editCurrentPassword) return setEditError('Enter your current password to save changes.');

    const result = updateProfile({
      name: editName.trim(),
      email: editEmail.trim() || undefined,
      age: editAge ? Number(editAge) : undefined,
      newPassword: editNewPassword || undefined,
      currentPassword: editCurrentPassword,
    });

    if (!result.success) return setEditError(result.error ?? 'Update failed.');
    setEditSuccess(true);
    setTimeout(() => setShowEditProfile(false), 800);
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/auth');
        },
      },
    ]);
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

  // Request image picker permissions on mount
  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access media library denied");
      }
    })();
  }, []);

  // Schedule notifications when reminder settings change
  useEffect(() => {
    if (reminderEnabled) {
      scheduleNotifications();
    }
  }, [dailyGoal, reminderTime, reminderEnabled]);

  const scheduleNotifications = async () => {
    try {
      setIsSchedulingNotifications(true);
      const randomWords = getRandomWords(dailyGoal);
      const words = await getWords(randomWords);
      await scheduleWordReminders(words, dailyGoal, reminderTime);
    } catch (error) {
      console.error("Error scheduling notifications:", error);
    } finally {
      setIsSchedulingNotifications(false);
    }
  };

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
          base64: true,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
          base64: true,
        });
      }

      if (!result.canceled && result.assets && result.assets[0]) {
        const base64Data = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setUserAvatar(base64Data);
      }
    } catch (error) {
      console.error("Error picking image:", error);
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
              // Show options to pick image or take photo
              Alert.alert(
                "Choose avatar source",
                "",
                [
                  {
                    text: "Camera",
                    onPress: () => handlePickImage(true),
                  },
                  {
                    text: "Photo Library",
                    onPress: () => handlePickImage(false),
                  },
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                ],
                { cancelable: true },
              );
            }}
          >
            {userAvatar ? (
              <Image source={{ uri: userAvatar }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarLarge}>
                {userName ? (
                  <Text style={{ fontSize: 32, color: colors.primary }}>
                    {userName.charAt(0)}
                  </Text>
                ) : (
                  <Ionicons name="person" size={36} color={colors.primary} />
                )}
              </View>
            )}
            <View style={styles.cameraIconBadge}>
              <Ionicons name="camera" size={12} color={colors.white} />
            </View>
          </TouchableOpacity>
          <Text variant="h3" color="heading" style={styles.userName}>
            {userName || "Learner"}
          </Text>
          <Text variant="body" color="muted">
            Vocabulary enthusiast
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text variant="h4" color="primary">
                {totalWordsLearned}
              </Text>
              <Text variant="caption" color="muted">
                Words
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text variant="h4" color="primary">
                {currentStreak}
              </Text>
              <Text variant="caption" color="muted">
                Streak
              </Text>
            </View>
            <View style={styles.statDivider} />
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

          <View style={[styles.settingItem, styles.settingBorder]}>
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
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={darkMode ? colors.primary : colors.textMuted}
            />
          </View>

          <TouchableOpacity
            style={[styles.settingItem, styles.settingBorder]}
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
            style={[styles.settingItem, styles.settingBorder]}
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
                Reminder Time
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
        </Card>

        {/* Account */}
        <Text variant="h4" color="heading" style={styles.sectionTitle}>
          Account
        </Text>
        <Card>
          <TouchableOpacity style={styles.settingItem} onPress={openEditProfile}>
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
            style={[styles.settingItem, styles.settingBorder]}
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
            style={[styles.settingItem, styles.settingBorder]}
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
          <View style={styles.editProfileContent}>
            <View style={styles.modalHeader}>
              <Text variant="h4" color="heading">Edit Profile</Text>
              <Pressable onPress={() => setShowEditProfile(false)}>
                <Ionicons name="close" size={24} color={colors.textHeading} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {!!editError && (
                <View style={styles.editErrorBox}>
                  <Ionicons name="alert-circle-outline" size={15} color={colors.wrong} />
                  <Text variant="bodySmall" style={styles.editErrorText}>{editError}</Text>
                </View>
              )}
              {editSuccess && (
                <View style={styles.editSuccessBox}>
                  <Ionicons name="checkmark-circle-outline" size={15} color={colors.correct} />
                  <Text variant="bodySmall" style={styles.editSuccessText}>Profile updated!</Text>
                </View>
              )}

              <Text variant="label" color="muted" style={styles.editLabel}>Full Name</Text>
              <View style={styles.editInputRow}>
                <Ionicons name="person-outline" size={17} color={colors.textMuted} style={styles.editInputIcon} />
                <TextInput
                  style={styles.editInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Full name"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="words"
                />
              </View>

              <Text variant="label" color="muted" style={styles.editLabel}>Email</Text>
              <View style={styles.editInputRow}>
                <Ionicons name="mail-outline" size={17} color={colors.textMuted} style={styles.editInputIcon} />
                <TextInput
                  style={styles.editInput}
                  value={editEmail}
                  onChangeText={setEditEmail}
                  placeholder="Email address"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <Text variant="label" color="muted" style={styles.editLabel}>Age</Text>
              <View style={styles.editInputRow}>
                <Ionicons name="calendar-outline" size={17} color={colors.textMuted} style={styles.editInputIcon} />
                <TextInput
                  style={styles.editInput}
                  value={editAge}
                  onChangeText={setEditAge}
                  placeholder="Age"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                />
              </View>

              <Text variant="label" color="muted" style={styles.editLabel}>New Password (optional)</Text>
              <View style={styles.editInputRow}>
                <Ionicons name="lock-closed-outline" size={17} color={colors.textMuted} style={styles.editInputIcon} />
                <TextInput
                  style={[styles.editInput, styles.editInputFlex]}
                  value={editNewPassword}
                  onChangeText={setEditNewPassword}
                  placeholder="Leave blank to keep current"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showNewPw}
                />
                <TouchableOpacity onPress={() => setShowNewPw(!showNewPw)} style={styles.eyeBtn}>
                  <Ionicons name={showNewPw ? "eye-off-outline" : "eye-outline"} size={17} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              {!!editNewPassword && (
                <>
                  <Text variant="label" color="muted" style={styles.editLabel}>Confirm New Password</Text>
                  <View style={styles.editInputRow}>
                    <Ionicons name="lock-closed-outline" size={17} color={colors.textMuted} style={styles.editInputIcon} />
                    <TextInput
                      style={[styles.editInput, styles.editInputFlex]}
                      value={editConfirmPassword}
                      onChangeText={setEditConfirmPassword}
                      placeholder="Confirm new password"
                      placeholderTextColor={colors.textMuted}
                      secureTextEntry={!showNewPw}
                    />
                  </View>
                </>
              )}

              <View style={styles.editDivider} />

              <Text variant="label" color="muted" style={styles.editLabel}>Current Password (required to save)</Text>
              <View style={styles.editInputRow}>
                <Ionicons name="key-outline" size={17} color={colors.textMuted} style={styles.editInputIcon} />
                <TextInput
                  style={[styles.editInput, styles.editInputFlex]}
                  value={editCurrentPassword}
                  onChangeText={setEditCurrentPassword}
                  placeholder="Enter current password"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showCurrentPw}
                />
                <TouchableOpacity onPress={() => setShowCurrentPw(!showCurrentPw)} style={styles.eyeBtn}>
                  <Ionicons name={showCurrentPw ? "eye-off-outline" : "eye-outline"} size={17} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}>
                <Text variant="button" color="white">Save Changes</Text>
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
          <View style={styles.modalContent}>
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
                    dailyGoal === goal && styles.goalButtonActive,
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
          <View style={styles.modalContent}>
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
                        selectedHour === item && styles.timeOptionActive,
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
                        selectedMinute === item && styles.timeOptionActive,
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
              style={styles.confirmButton}
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 50,
  },
  header: {
    paddingVertical: spacing[4],
  },
  profileCard: {
    alignItems: "center",
    paddingVertical: spacing[6],
    marginBottom: spacing[6],
  },
  avatarContainer: {
    position: "relative",
    marginBottom: spacing[3],
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  cameraIconBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
  userName: {
    marginBottom: spacing[1],
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing[4],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
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
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing[2],
  },
  achievementLocked: {
    opacity: 0.4,
  },
  achievementName: {
    marginTop: spacing[1],
    textAlign: "center",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  settingBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingIcon: {
    marginRight: spacing[3],
  },
  settingValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[1],
  },
  schedulingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing[4],
    gap: spacing[2],
  },
  schedulingText: {
    marginLeft: spacing[2],
  },
  bottomSpacer: {
    height: spacing[20],
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius["3xl"],
    borderTopRightRadius: borderRadius["3xl"],
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    paddingBottom: spacing[6],
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing[4],
  },
  modalDescription: {
    marginBottom: spacing[6],
  },
  goalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[3],
    justifyContent: "center",
  },
  goalButton: {
    width: "22%",
    aspectRatio: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    overflow: "hidden",
  },
  goalButtonInner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  goalButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  goalButtonText: {
    lineHeight: 20,
    includeFontPadding: false,
  },
  timePickerContainer: {
    flexDirection: "row",
    gap: spacing[4],
    marginBottom: spacing[6],
    height: 200,
  },
  pickerColumn: {
    flex: 1,
  },
  pickerLabel: {
    textAlign: "center",
    marginBottom: spacing[2],
  },
  pickerList: {
    flex: 1,
  },
  timeOption: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    marginVertical: spacing[1],
  },
  timeOptionActive: {
    backgroundColor: colors.primary,
  },
  confirmButton: {
    height: 44,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },

  // Edit Profile Modal
  editProfileContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius["3xl"],
    borderTopRightRadius: borderRadius["3xl"],
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    paddingBottom: spacing[8],
    maxHeight: "90%",
  },
  editErrorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    backgroundColor: colors.wrongLight,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    marginBottom: spacing[3],
  },
  editErrorText: {
    color: colors.wrong,
    flex: 1,
  },
  editSuccessBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    backgroundColor: colors.correctLight,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    marginBottom: spacing[3],
  },
  editSuccessText: {
    color: colors.correct,
    flex: 1,
  },
  editLabel: {
    marginBottom: spacing[1],
    marginTop: spacing[3],
  },
  editInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing[3],
    height: 48,
  },
  editInputIcon: {
    marginRight: spacing[2],
  },
  editInput: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    color: colors.textHeading,
  },
  editInputFlex: {
    flex: 1,
  },
  eyeBtn: {
    padding: spacing[1],
  },
  editDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: spacing[5],
    marginBottom: spacing[1],
  },
  saveBtn: {
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing[5],
  },
});
