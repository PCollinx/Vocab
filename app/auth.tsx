import { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { GoogleAuthProvider, signInWithCredential, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../src/services/firebase";
import { Text, Button } from "../src/components";
import { spacing, borderRadius } from "../src/constants";
import { useTheme } from "../src/context/ThemeContext";
import { useAppStore } from "../src/store/appStore";

const IOS_CLIENT_ID = "549372255118-0dh043d953silcnikfn2lddcmlabp2fa.apps.googleusercontent.com";
const WEB_CLIENT_ID = "549372255118-d1um0k07t0gn4442n4iakg6afe7vs02e.apps.googleusercontent.com";

GoogleSignin.configure({
  webClientId: WEB_CLIENT_ID,
  iosClientId: IOS_CLIENT_ID,
  offlineAccess: false,
});

export default function AuthScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { signup, login, hasCompletedOnboarding } = useAppStore();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState("");

  const switchMode = (next: "login" | "signup") => {
    setMode(next);
    setError("");
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      await GoogleSignin.signIn();
      const { idToken } = await GoogleSignin.getTokens();
      if (!idToken) throw new Error("No ID token");
      const credential = GoogleAuthProvider.credential(idToken);
      const result = await signInWithCredential(auth, credential);
      if (result.user.displayName) {
        useAppStore.getState().setUserName(result.user.displayName);
      }
      router.replace(hasCompletedOnboarding ? "/(tabs)" : "/onboarding");
    } catch (err: any) {
      if (__DEV__) console.error("Google sign-in error:", err?.code, err?.message, err);
      setError("Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError("");

    if (mode === "signup") {
      if (!name.trim()) return setError("Please enter your name.");
      if (!email.trim() || !/\S+@\S+\.\S+/.test(email))
        return setError("Please enter a valid email.");
      const ageNum = Number(age);
      if (!age.trim() || isNaN(ageNum) || ageNum < 1 || ageNum > 120)
        return setError("Please enter a valid age.");
      if (password.length < 6)
        return setError("Password must be at least 6 characters.");
      if (password !== confirmPassword)
        return setError("Passwords do not match.");

      setLoading(true);
      const result = await signup(
        name.trim(),
        email.toLowerCase().trim(),
        ageNum,
        password,
      );
      setLoading(false);

      if (!result.success) return setError(result.error ?? "Sign up failed.");
      router.replace("/onboarding");
    } else {
      if (!email.trim()) return setError("Please enter your email.");
      if (!password) return setError("Please enter your password.");

      setLoading(true);
      const result = await login(email.toLowerCase().trim(), password);
      setLoading(false);

      if (!result.success) return setError(result.error ?? "Login failed.");
      router.replace(hasCompletedOnboarding ? "/(tabs)" : "/onboarding");
    }
  };

  const handleForgotPassword = async () => {
    setResetError("");
    if (!resetEmail.trim() || !/\S+@\S+\.\S+/.test(resetEmail)) {
      return setResetError("Please enter a valid email address.");
    }
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail.toLowerCase().trim());
      setResetSent(true);
    } catch (err: any) {
      setResetError("No account found with that email.");
    } finally {
      setResetLoading(false);
    }
  };

  const closeForgotPassword = () => {
    setShowForgotPassword(false);
    setResetEmail("");
    setResetSent(false);
    setResetError("");
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View
            style={[styles.logoWrap, { backgroundColor: colors.primaryLight }]}
          >
            <Ionicons name="book-outline" size={34} color={colors.primary} />
          </View>
          <Text variant="h2" color="heading" style={styles.appName}>
            WordWise
          </Text>
          <Text variant="bodySmall" color="muted" style={styles.tagline}>
            Expand your vocabulary, one word at a time
          </Text>
        </View>

        {/* Card */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          {/* Toggle */}
          <View style={[styles.toggle, { backgroundColor: colors.background }]}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                mode === "login" && { backgroundColor: colors.surface },
              ]}
              onPress={() => switchMode("login")}
            >
              <Text
                variant="label"
                style={{
                  color: mode === "login" ? colors.primary : colors.textMuted,
                }}
              >
                Log In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                mode === "signup" && { backgroundColor: colors.surface },
              ]}
              onPress={() => switchMode("signup")}
            >
              <Text
                variant="label"
                style={{
                  color: mode === "signup" ? colors.primary : colors.textMuted,
                }}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          {/* Error */}
          {!!error && (
            <View
              style={[styles.errorBox, { backgroundColor: colors.wrongLight }]}
            >
              <Ionicons
                name="alert-circle-outline"
                size={16}
                color={colors.wrong}
              />
              <Text
                variant="bodySmall"
                style={{ color: colors.wrong, flex: 1 }}
              >
                {error}
              </Text>
            </View>
          )}

          {/* Name (signup) */}
          {mode === "signup" && (
            <View
              style={[
                styles.inputRow,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons
                name="person-outline"
                size={18}
                color={colors.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.textHeading }]}
                placeholder="Full name"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>
          )}

          {/* Email */}
          <View
            style={[
              styles.inputRow,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons
              name="mail-outline"
              size={18}
              color={colors.textMuted}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { color: colors.textHeading }]}
              placeholder="Email address"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          {/* Age (signup) */}
          {mode === "signup" && (
            <View
              style={[
                styles.inputRow,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons
                name="calendar-outline"
                size={18}
                color={colors.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.textHeading }]}
                placeholder="Age"
                placeholderTextColor={colors.textMuted}
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                returnKeyType="next"
              />
            </View>
          )}

          {/* Password */}
          <View
            style={[
              styles.inputRow,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color={colors.textMuted}
              style={styles.inputIcon}
            />
            <TextInput
              style={[
                styles.input,
                styles.inputFlex,
                { color: colors.textHeading },
              ]}
              placeholder="Password"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              returnKeyType={mode === "signup" ? "next" : "done"}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeBtn}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={18}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password (signup) */}
          {mode === "signup" && (
            <View
              style={[
                styles.inputRow,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={colors.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={[
                  styles.input,
                  styles.inputFlex,
                  { color: colors.textHeading },
                ]}
                placeholder="Confirm password"
                placeholderTextColor={colors.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
                returnKeyType="done"
              />
              <TouchableOpacity
                onPress={() => setShowConfirm(!showConfirm)}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showConfirm ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>
          )}

          {mode === "login" && (
            <TouchableOpacity
              style={styles.forgotRow}
              onPress={() => setShowForgotPassword(true)}
            >
              <Text variant="bodySmall" color="primary">Forgot Password?</Text>
            </TouchableOpacity>
          )}

          <Button
            title={mode === "login" ? "Log In" : "Create Account"}
            onPress={handleSubmit}
            loading={loading}
            fullWidth
            style={styles.submitBtn}
          />

          <TouchableOpacity
            style={styles.switchRow}
            onPress={() => switchMode(mode === "login" ? "signup" : "login")}
          >
            <Text variant="bodySmall" color="muted">
              {mode === "login"
                ? "Don't have an account? "
                : "Already have an account? "}
            </Text>
            <Text variant="bodySmall" color="primary">
              {mode === "login" ? "Sign Up" : "Log In"}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View
              style={[styles.dividerLine, { backgroundColor: colors.border }]}
            />
            <Text variant="caption" color="muted" style={styles.dividerText}>
              or
            </Text>
            <View
              style={[styles.dividerLine, { backgroundColor: colors.border }]}
            />
          </View>

          {/* Google Sign-In */}
          <TouchableOpacity
            style={[
              styles.googleBtn,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
            onPress={handleGoogleSignIn}
            disabled={googleLoading || loading}
            activeOpacity={0.8}
          >
            {googleLoading ? (
              <ActivityIndicator size="small" color={colors.textMuted} />
            ) : (
              <AntDesign name="google" size={18} color="#4285F4" />
            )}
            <Text variant="body" color="heading" style={styles.googleBtnText}>
              Continue with Google
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Modal
        visible={showForgotPassword}
        transparent
        animationType="slide"
        onRequestClose={closeForgotPassword}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={closeForgotPassword} />
          <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />

            <Text variant="h4" color="heading" style={styles.modalTitle}>Reset Password</Text>

            {resetSent ? (
              <View style={styles.resetSentContainer}>
                <View style={[styles.resetSentIcon, { backgroundColor: colors.correctLight }]}>
                  <Ionicons name="mail-open-outline" size={32} color={colors.correct} />
                </View>
                <Text variant="body" color="heading" style={styles.resetSentTitle}>Check your email</Text>
                <Text variant="bodySmall" color="muted" style={styles.resetSentSubtext}>
                  We've sent a password reset link to {resetEmail}
                </Text>
                <TouchableOpacity
                  style={[styles.resetDoneBtn, { backgroundColor: colors.primary }]}
                  onPress={closeForgotPassword}
                >
                  <Text variant="button" color="white">Done</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text variant="bodySmall" color="muted" style={styles.modalSubtext}>
                  Enter your email address and we'll send you a link to reset your password.
                </Text>

                {!!resetError && (
                  <View style={[styles.errorBox, { backgroundColor: colors.wrongLight }]}>
                    <Ionicons name="alert-circle-outline" size={16} color={colors.wrong} />
                    <Text variant="bodySmall" style={{ color: colors.wrong, flex: 1 }}>{resetError}</Text>
                  </View>
                )}

                <View style={[styles.inputRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Ionicons name="mail-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.textHeading }]}
                    placeholder="Email address"
                    placeholderTextColor={colors.textMuted}
                    value={resetEmail}
                    onChangeText={setResetEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.resetBtn, { backgroundColor: colors.primary }]}
                  onPress={handleForgotPassword}
                  disabled={resetLoading}
                >
                  {resetLoading
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text variant="button" color="white">Send Reset Link</Text>
                  }
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelBtn} onPress={closeForgotPassword}>
                  <Text variant="bodySmall" color="muted">Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[10],
  },
  hero: { alignItems: "center", marginBottom: spacing[8] },
  logoWrap: {
    width: 76,
    height: 76,
    borderRadius: borderRadius["2xl"],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing[4],
  },
  appName: { marginBottom: spacing[1] },
  tagline: { textAlign: "center" },
  card: {
    borderRadius: borderRadius["2xl"],
    padding: spacing[6],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 3,
  },
  toggle: {
    flexDirection: "row",
    borderRadius: borderRadius.xl,
    padding: spacing[1],
    marginBottom: spacing[5],
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: spacing[2],
    alignItems: "center",
    borderRadius: borderRadius.lg,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    borderRadius: borderRadius.md,
    padding: spacing[3],
    marginBottom: spacing[4],
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing[3],
    marginBottom: spacing[3],
    height: 50,
  },
  inputIcon: { marginRight: spacing[2] },
  input: { flex: 1, height: "100%", fontSize: 16 },
  inputFlex: { flex: 1 },
  eyeBtn: { padding: spacing[1] },
  submitBtn: { marginTop: spacing[2] },
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing[4],
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing[5],
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: spacing[3] },
  forgotRow: {
    alignSelf: "flex-end",
    marginTop: -spacing[1],
    marginBottom: spacing[3],
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  modalSheet: {
    borderTopLeftRadius: borderRadius["3xl"],
    borderTopRightRadius: borderRadius["3xl"],
    padding: spacing[6],
    paddingBottom: spacing[10],
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: borderRadius.full,
    alignSelf: "center", marginBottom: spacing[5],
  },
  modalTitle: { marginBottom: spacing[2] },
  modalSubtext: { marginBottom: spacing[5], lineHeight: 20 },
  resetBtn: {
    height: 50, borderRadius: borderRadius.lg,
    alignItems: "center", justifyContent: "center",
    marginTop: spacing[2],
  },
  cancelBtn: {
    alignItems: "center", marginTop: spacing[4],
  },
  resetSentContainer: { alignItems: "center", paddingVertical: spacing[4] },
  resetSentIcon: {
    width: 72, height: 72, borderRadius: borderRadius.full,
    justifyContent: "center", alignItems: "center",
    marginBottom: spacing[4],
  },
  resetSentTitle: { fontWeight: "700", marginBottom: spacing[2] },
  resetSentSubtext: { textAlign: "center", lineHeight: 20, marginBottom: spacing[6] },
  resetDoneBtn: {
    height: 50, borderRadius: borderRadius.lg,
    alignItems: "center", justifyContent: "center",
    paddingHorizontal: spacing[10],
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[3],
    height: 50,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginTop: spacing[4],
  },
  googleBtnText: { fontWeight: "500" },
});
