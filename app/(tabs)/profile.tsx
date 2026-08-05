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
import * as FileSystem from "expo-file-system/legacy";
import { Text } from "../../src/components";
import { spacing, borderRadius } from "../../src/constants";
import { useAppStore } from "../../src/store/appStore";
import { useTheme } from "../../src/context/ThemeContext";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { auth } from "../../src/services/firebase";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  scheduleWordReminders,
  cancelAllNotifications,
} from "../../src/services/notificationService";
import type { Colors } from "../../src/constants/colors";

const HEADER_BG = "#185FA5";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

function MenuRow({
  icon,
  label,
  value,
  onPress,
  iconBg,
  colors,
  last,
}: {
  icon: IconName;
  label: string;
  value?: string;
  onPress?: () => void;
  iconBg: string;
  colors: Colors;
  last?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.menuRow,
        !last && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuLeft}>
        <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={18} color={colors.textMuted} />
        </View>
        <Text style={[styles.menuLabel, { color: colors.textHeading }]}>
          {label}
        </Text>
      </View>
      <View style={styles.menuRight}>
        {value ? (
          <Text style={[styles.menuValue, { color: colors.textMuted }]}>
            {value}
          </Text>
        ) : null}
        <Ionicons name="chevron-forward" size={15} color={colors.textHint} />
      </View>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
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

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePw, setShowDeletePw] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const isGoogleUser =
    auth.currentUser?.providerData[0]?.providerId === "google.com";

  const iconBg = isDark ? colors.surfaceElevated : "#EDEEF2";
  const dangerIconBg = isDark ? colors.wrongLight : "#FEF0EE";

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
    if (!isGoogleUser && !deletePassword)
      return setDeleteError("Enter your password to confirm.");
    const result = await deleteAccount(
      isGoogleUser ? undefined : deletePassword,
    );
    if (!result.success)
      return setDeleteError(result.error ?? "Deletion failed.");
    setShowDeleteModal(false);
    router.replace("/auth");
  };

  const achievements = [
    {
      id: "1",
      icon: "star" as IconName,
      name: "First Word",
      unlocked: true,
      color: colors.streak,
    },
    {
      id: "2",
      icon: "flame" as IconName,
      name: "7-Day Streak",
      unlocked: currentStreak >= 7,
      color: colors.accent,
    },
    {
      id: "3",
      icon: "book" as IconName,
      name: "50 Words",
      unlocked: totalWordsLearned >= 50,
      color: colors.primary,
    },
    {
      id: "4",
      icon: "trophy" as IconName,
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
    if (dailyWords.length === 0) return;
    try {
      setIsSchedulingNotifications(true);
      await scheduleWordReminders(
        dailyWords,
        reminderTime,
        notificationInterval,
      );
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
  }, [
    dailyGoal,
    reminderTime,
    reminderEnabled,
    notificationInterval,
    dailyWords.length,
  ]);

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
        const pickedUri = result.assets[0].uri;
        const ext = pickedUri.split(".").pop()?.split("?")[0] ?? "jpg";
        const destPath = `${FileSystem.documentDirectory}avatar_${Date.now()}.${ext}`;
        await FileSystem.copyAsync({ from: pickedUri, to: destPath });
        setUserAvatar(destPath);
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

  const notificationPreview = Array.from(
    { length: Math.min(dailyWords.length || 5, 5) },
    (_, i) => {
      const [sh, sm] = reminderTime.split(":").map(Number);
      const total = sh * 60 + sm + i * notificationInterval * 60;
      const hh = Math.floor(total / 60) % 24;
      const mm = total % 60;
      return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
    },
  ).join(", ");

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* ── HEADER ── */}
        <View
          style={[styles.header, { paddingTop: insets.top + spacing[5] }]}
        >
          <TouchableOpacity
            style={styles.avatarWrapper}
            activeOpacity={0.8}
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
              <Image source={{ uri: userAvatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                {userName ? (
                  <Text style={styles.avatarInitial}>
                    {userName.charAt(0).toUpperCase()}
                  </Text>
                ) : (
                  <Ionicons name="person" size={42} color="#fff" />
                )}
              </View>
            )}
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={12} color="#fff" />
            </View>
          </TouchableOpacity>

          <Text style={styles.headerName}>{userName || "Learner"}</Text>
          {userBio || auth.currentUser?.email ? (
            <Text style={styles.headerSub}>
              {userBio || auth.currentUser?.email}
            </Text>
          ) : null}

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{totalWordsLearned}</Text>
              <Text style={styles.statLabel}>Words</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{currentStreak}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>
                {Math.floor(totalWordsLearned * 0.85)}
              </Text>
              <Text style={styles.statLabel}>Mastered</Text>
            </View>
          </View>
        </View>

        {/* ── BODY ── */}
        <View style={styles.body}>
          {/* Achievements */}
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
            ACHIEVEMENTS
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            {achievements.map((a, idx) => (
              <View
                key={a.id}
                style={[
                  styles.achievementRow,
                  idx < achievements.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.border,
                  },
                  !a.unlocked && { opacity: 0.4 },
                ]}
              >
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: iconBg },
                  ]}
                >
                  <Ionicons
                    name={a.icon}
                    size={18}
                    color={a.unlocked ? a.color : colors.textHint}
                  />
                </View>
                <Text
                  style={[
                    styles.menuLabel,
                    {
                      color: a.unlocked
                        ? colors.textHeading
                        : colors.textMuted,
                    },
                  ]}
                >
                  {a.name}
                </Text>
                {a.unlocked && (
                  <View style={styles.unlockedBadge}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={colors.correct}
                    />
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Learning */}
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
            LEARNING
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <MenuRow
              icon="flag-outline"
              label="Daily Goal"
              value={`${dailyGoal} words`}
              onPress={() => setShowDailyGoalModal(true)}
              iconBg={iconBg}
              colors={colors}
            />
            <MenuRow
              icon="time-outline"
              label="First Reminder"
              value={reminderTime}
              onPress={() => setShowReminderTimeModal(true)}
              iconBg={iconBg}
              colors={colors}
            />
            <View
              style={[
                styles.menuRow,
                {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <View style={styles.menuLeft}>
                <View
                  style={[styles.iconCircle, { backgroundColor: iconBg }]}
                >
                  <Ionicons
                    name="alarm-outline"
                    size={18}
                    color={colors.textMuted}
                  />
                </View>
                <Text
                  style={[styles.menuLabel, { color: colors.textHeading }]}
                >
                  Remind every
                </Text>
              </View>
              <View style={styles.chipRow}>
                {[1, 2, 3, 4].map((h) => (
                  <TouchableOpacity
                    key={h}
                    onPress={() => setNotificationInterval(h)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor:
                          notificationInterval === h
                            ? colors.primary
                            : iconBg,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "600",
                        color:
                          notificationInterval === h
                            ? "#fff"
                            : colors.textMuted,
                      }}
                    >
                      {h}h
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.noticeRow}>
              <Text style={[styles.noticeText, { color: colors.textMuted }]}>
                Scheduled at: {notificationPreview}
              </Text>
            </View>
          </View>

          {/* Notifications */}
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
            NOTIFICATIONS
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={[styles.menuRow, styles.menuRowLast]}>
              <View style={styles.menuLeft}>
                <View
                  style={[styles.iconCircle, { backgroundColor: iconBg }]}
                >
                  <Ionicons
                    name="notifications-outline"
                    size={18}
                    color={colors.textMuted}
                  />
                </View>
                <Text
                  style={[styles.menuLabel, { color: colors.textHeading }]}
                >
                  Daily Reminders
                </Text>
              </View>
              <Switch
                value={reminderEnabled}
                onValueChange={setReminderEnabled}
                trackColor={{
                  false: colors.border,
                  true: colors.primaryLight,
                }}
                thumbColor={
                  reminderEnabled ? colors.primary : colors.textMuted
                }
              />
            </View>
          </View>

          {/* Appearance */}
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
            APPEARANCE
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={[styles.menuRow, styles.menuRowLast]}>
              <View style={styles.menuLeft}>
                <View
                  style={[styles.iconCircle, { backgroundColor: iconBg }]}
                >
                  <Ionicons
                    name="moon-outline"
                    size={18}
                    color={colors.textMuted}
                  />
                </View>
                <Text
                  style={[styles.menuLabel, { color: colors.textHeading }]}
                >
                  Dark Mode
                </Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{
                  false: colors.border,
                  true: colors.primaryLight,
                }}
                thumbColor={isDarkMode ? colors.primary : colors.textMuted}
              />
            </View>
          </View>

          {/* Account */}
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
            ACCOUNT
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <MenuRow
              icon="person-outline"
              label="Edit Profile"
              onPress={openEditProfile}
              iconBg={iconBg}
              colors={colors}
            />
            <MenuRow
              icon="refresh-outline"
              label="Reset Onboarding"
              onPress={resetOnboarding}
              iconBg={iconBg}
              colors={colors}
            />
            <TouchableOpacity
              style={[
                styles.menuRow,
                {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.border,
                },
              ]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <View
                  style={[styles.iconCircle, { backgroundColor: iconBg }]}
                >
                  <Ionicons
                    name="log-out-outline"
                    size={18}
                    color={colors.textMuted}
                  />
                </View>
                <Text style={[styles.menuLabel, { color: colors.textHeading }]}>
                  Log Out
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={15}
                color={colors.textHint}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuRow, styles.menuRowLast]}
              onPress={openDeleteModal}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: dangerIconBg },
                  ]}
                >
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={colors.wrong}
                  />
                </View>
                <Text style={[styles.menuLabel, { color: colors.wrong }]}>
                  Delete Account
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={15}
                color={colors.wrong}
              />
            </TouchableOpacity>
          </View>

          {isSchedulingNotifications && (
            <View style={styles.schedulingRow}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textMuted,
                  marginLeft: spacing[2],
                }}
              >
                Scheduling notifications...
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── EDIT PROFILE MODAL ── */}
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
            style={[styles.modalSheet, { backgroundColor: colors.surface }]}
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
                  <Text
                    variant="label"
                    color="muted"
                    style={styles.editLabel}
                  >
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
                style={[
                  styles.editDivider,
                  { backgroundColor: colors.border },
                ]}
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

      {/* ── DELETE ACCOUNT MODAL ── */}
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
            style={[styles.modalSheet, { backgroundColor: colors.surface }]}
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
                  This will permanently delete your account and all data
                  including bookmarks, progress, and quiz history. This cannot
                  be undone.
                </Text>
              </View>

              {!!deleteError && (
                <View
                  style={[
                    styles.feedbackBox,
                    {
                      backgroundColor: colors.wrongLight,
                      marginTop: spacing[2],
                    },
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
                <Text
                  variant="bodySmall"
                  color="muted"
                  style={{ marginBottom: spacing[4] }}
                >
                  You'll be asked to sign in with Google to confirm your
                  identity before deletion.
                </Text>
              ) : (
                <>
                  <Text
                    variant="label"
                    color="muted"
                    style={styles.editLabel}
                  >
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
                        name={
                          showDeletePw ? "eye-off-outline" : "eye-outline"
                        }
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

      {/* ── DAILY GOAL MODAL ── */}
      <Modal
        visible={showDailyGoalModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDailyGoalModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalSheet, { backgroundColor: colors.surface }]}
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
                        dailyGoal === goal
                          ? colors.primary
                          : colors.background,
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

      {/* ── REMINDER TIME MODAL ── */}
      <Modal
        visible={showReminderTimeModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowReminderTimeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalSheet, { backgroundColor: colors.surface }]}
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
              style={[
                styles.actionButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={handleReminderTimeChange}
            >
              <Text variant="button" color="white">
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    backgroundColor: HEADER_BG,
    alignItems: "center",
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[8],
  },
  avatarWrapper: { position: "relative", marginBottom: spacing[4] },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.25)",
  },
  avatarFallback: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.18)",
  },
  avatarInitial: { fontSize: 38, color: "#fff", fontWeight: "700" },
  cameraBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#378ADD",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: HEADER_BG,
  },
  headerName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: spacing[1],
  },
  headerSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
  },
  statsRow: {
    flexDirection: "row",
    marginTop: spacing[5],
    paddingTop: spacing[5],
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    width: "100%",
  },
  statItem: { flex: 1, alignItems: "center" },
  statNum: { fontSize: 22, fontWeight: "700", color: "#FFFFFF" },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignSelf: "center",
  },

  // ── Body ────────────────────────────────────────────────────────────────────
  body: { paddingHorizontal: spacing[4], paddingTop: spacing[5] },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.9,
    marginBottom: spacing[2],
    marginLeft: spacing[1],
  },

  card: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: spacing[1],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },

  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3] + 2,
    minHeight: 54,
  },
  menuRowLast: {},
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    flex: 1,
  },
  menuLabel: { fontSize: 15, fontWeight: "500" },
  menuRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[1],
  },
  menuValue: { fontSize: 14 },

  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  chipRow: { flexDirection: "row", gap: spacing[2] },
  chip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1] + 2,
    borderRadius: 8,
    minWidth: 36,
    alignItems: "center",
  },

  noticeRow: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
  },
  noticeText: { fontSize: 11 },

  achievementRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3] + 2,
    gap: spacing[3],
    minHeight: 54,
  },
  unlockedBadge: { marginLeft: "auto" },

  schedulingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing[4],
  },

  // ── Modals ──────────────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
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
