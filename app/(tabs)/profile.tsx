/**
 * Profile Screen
 * User settings and achievements
 */

import { View, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Container, Text, Card } from '../../src/components';
import { colors, spacing, borderRadius } from '../../src/constants';
import { useAppStore } from '../../src/store/appStore';
import { useState } from 'react';

export default function ProfileScreen() {
  const { userName, totalWordsLearned, currentStreak, resetOnboarding } = useAppStore();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const achievements = [
    { id: '1', icon: 'star' as const, name: 'First Word', unlocked: true, color: colors.streak },
    { id: '2', icon: 'flame' as const, name: '7 Day Streak', unlocked: currentStreak >= 7, color: colors.accent },
    { id: '3', icon: 'book' as const, name: '50 Words', unlocked: totalWordsLearned >= 50, color: colors.primary },
    { id: '4', icon: 'trophy' as const, name: '100 Words', unlocked: totalWordsLearned >= 100, color: colors.correct },
  ];

  return (
    <Container>
      <ScrollView 
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="h2" color="heading">
            Profile
          </Text>
        </View>

        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            {userName ? (
              <Text style={{ fontSize: 32, color: colors.primary }}>
                {userName.charAt(0)}
              </Text>
            ) : (
              <Ionicons name="person" size={36} color={colors.primary} />
            )}
          </View>
          <Text variant="h3" color="heading" style={styles.userName}>
            {userName || 'Learner'}
          </Text>
          <Text variant="body" color="muted">
            Vocabulary enthusiast
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text variant="h4" color="primary">{totalWordsLearned}</Text>
              <Text variant="caption" color="muted">Words</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text variant="h4" color="primary">{currentStreak}</Text>
              <Text variant="caption" color="muted">Streak</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text variant="h4" color="primary">
                {Math.floor(totalWordsLearned * 0.85)}
              </Text>
              <Text variant="caption" color="muted">Mastered</Text>
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
                color={achievement.unlocked ? achievement.color : colors.textMuted} 
              />
              <Text 
                variant="caption" 
                color={achievement.unlocked ? 'heading' : 'muted'}
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
              <Ionicons name="notifications" size={20} color={colors.primary} style={styles.settingIcon} />
              <Text variant="body" color="heading">Daily Reminders</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={notifications ? colors.primary : colors.textMuted}
            />
          </View>

          <View style={[styles.settingItem, styles.settingBorder]}>
            <View style={styles.settingInfo}>
              <Ionicons name="moon" size={20} color={colors.primary} style={styles.settingIcon} />
              <Text variant="body" color="heading">Dark Mode</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={darkMode ? colors.primary : colors.textMuted}
            />
          </View>

          <TouchableOpacity style={[styles.settingItem, styles.settingBorder]}>
            <View style={styles.settingInfo}>
              <Ionicons name="flag" size={20} color={colors.primary} style={styles.settingIcon} />
              <Text variant="body" color="heading">Daily Goal</Text>
            </View>
            <View style={styles.settingValue}>
              <Text variant="body" color="muted">5 words</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingItem, styles.settingBorder]}>
            <View style={styles.settingInfo}>
              <Ionicons name="time" size={20} color={colors.primary} style={styles.settingIcon} />
              <Text variant="body" color="heading">Reminder Time</Text>
            </View>
            <View style={styles.settingValue}>
              <Text variant="body" color="muted">9:00 AM</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </View>
          </TouchableOpacity>
        </Card>

        {/* Account */}
        <Text variant="h4" color="heading" style={styles.sectionTitle}>
          Account
        </Text>
        <Card>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="person-outline" size={20} color={colors.primary} style={styles.settingIcon} />
              <Text variant="body" color="heading">Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingItem, styles.settingBorder]}>
            <View style={styles.settingInfo}>
              <Ionicons name="download-outline" size={20} color={colors.primary} style={styles.settingIcon} />
              <Text variant="body" color="heading">Export Data</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.settingItem, styles.settingBorder]}
            onPress={resetOnboarding}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="refresh" size={20} color={colors.accent} style={styles.settingIcon} />
              <Text variant="body" color="accent">Reset Onboarding</Text>
            </View>
          </TouchableOpacity>
        </Card>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingVertical: spacing[4],
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: spacing[6],
    marginBottom: spacing[6],
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  userName: {
    marginBottom: spacing[1],
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[4],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  sectionTitle: {
    marginBottom: spacing[4],
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  achievementCard: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[2],
  },
  achievementLocked: {
    opacity: 0.4,
  },
  achievementName: {
    marginTop: spacing[1],
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  settingBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: spacing[3],
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomSpacer: {
    height: spacing[20],
  },
});
