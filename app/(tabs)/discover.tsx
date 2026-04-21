/**
 * Discover Screen
 * Browse word categories and explore
 */

import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Container, Text, Card } from '../../src/components';
import { colors, spacing, borderRadius } from '../../src/constants';
import { useAppStore } from '../../src/store/appStore';
import { CATEGORY_INFO, CURATED_WORDS } from '../../src/data/wordList';
import { WordCategory } from '../../src/types';

const categories: { id: string; key: WordCategory; name: string; icon: string; color: string }[] = [
  { id: '1', key: 'business', name: 'Business', icon: 'briefcase', color: colors.primary },
  { id: '2', key: 'science', name: 'Science', icon: 'flask', color: colors.correct },
  { id: '3', key: 'literature', name: 'Literature', icon: 'book', color: colors.accent },
  { id: '4', key: 'technology', name: 'Technology', icon: 'laptop', color: colors.streak },
  { id: '5', key: 'arts', name: 'Arts', icon: 'color-palette', color: '#9B59B6' },
  { id: '6', key: 'history', name: 'History', icon: 'time', color: '#34495E' },
  { id: '7', key: 'everyday', name: 'Everyday', icon: 'chatbubbles', color: '#3498DB' },
  { id: '8', key: 'academic', name: 'Academic', icon: 'school', color: '#2C3E50' },
];

export default function DiscoverScreen() {
  const router = useRouter();
  const { 
    searchForWords, 
    searchQuery, 
    searchResults, 
    isSearching,
    clearSearch,
    bookmarkedWords,
    fetchWordDetails,
  } = useAppStore();
  
  const [localQuery, setLocalQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localQuery.trim()) {
        searchForWords(localQuery);
      } else {
        clearSearch();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localQuery]);

  const getCategoryCount = (category: WordCategory) => {
    return CURATED_WORDS.filter(w => w.category === category).length;
  };

  const handleCategoryPress = (category: WordCategory) => {
    router.push(`/category/${category}`);
  };

  const handleWordPress = async (word: string) => {
    const fetchedWord = await fetchWordDetails(word);
    if (fetchedWord) {
      router.push(`/word/${fetchedWord.id}`);
    }
  };

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
            Discover
          </Text>
          <Text variant="body" color="muted">
            Explore new words by category
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for words..."
            placeholderTextColor={colors.textMuted}
            value={localQuery}
            onChangeText={setLocalQuery}
            onFocus={() => setShowSearch(true)}
          />
          {localQuery.length > 0 && (
            <TouchableOpacity onPress={() => {
              setLocalQuery('');
              clearSearch();
            }}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Search Results */}
        {localQuery.length > 0 && (
          <View style={styles.searchResultsContainer}>
            {isSearching ? (
              <View style={styles.searchLoading}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text variant="body" color="muted">Searching...</Text>
              </View>
            ) : searchResults.length > 0 ? (
              <Card>
                {searchResults.slice(0, 5).map((word, index) => (
                  <TouchableOpacity
                    key={word.id}
                    style={[
                      styles.searchResultItem,
                      index < Math.min(searchResults.length, 5) - 1 && styles.recentItemBorder,
                    ]}
                    onPress={() => router.push(`/word/${word.id}`)}
                  >
                    <View>
                      <Text variant="body" color="heading">{word.word}</Text>
                      <Text variant="caption" color="muted" numberOfLines={1}>
                        {word.definition}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                ))}
              </Card>
            ) : (
              <Card>
                <View style={styles.noResults}>
                  <Ionicons name="search-outline" size={32} color={colors.textMuted} />
                  <Text variant="body" color="muted">No words found for "{localQuery}"</Text>
                </View>
              </Card>
            )}
          </View>
        )}

        {/* Categories Grid */}
        {localQuery.length === 0 && (
          <>
            <Text variant="h4" color="heading" style={styles.sectionTitle}>
              Categories
            </Text>
            <View style={styles.categoriesGrid}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.categoryCard, { borderLeftColor: category.color }]}
                  onPress={() => handleCategoryPress(category.key)}
                >
                  <Ionicons name={category.icon as any} size={28} color={category.color} style={styles.categoryIcon} />
                  <Text variant="h4" color="heading">
                    {category.name}
                  </Text>
                  <Text variant="caption" color="muted">
                    {getCategoryCount(category.key)} words
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Bookmarked Words */}
            {bookmarkedWords.length > 0 && (
              <>
                <Text variant="h4" color="heading" style={styles.sectionTitle}>
                  Your Bookmarks
                </Text>
                <Card>
                  {bookmarkedWords.slice(0, 3).map((word, index) => (
                    <TouchableOpacity
                      key={word.id}
                      style={[
                        styles.recentItem,
                        index < Math.min(bookmarkedWords.length, 3) - 1 && styles.recentItemBorder,
                      ]}
                      onPress={() => router.push(`/word/${word.id}`)}
                    >
                      <View>
                        <Text variant="body" color="heading">
                          {word.word}
                        </Text>
                        <Text variant="caption" color="muted">
                          {word.partOfSpeech}
                        </Text>
                      </View>
                      <View style={styles.bookmarkIcon}>
                        <Ionicons name="bookmark" size={16} color={colors.accent} />
                      </View>
                    </TouchableOpacity>
                  ))}
                  {bookmarkedWords.length > 3 && (
                    <TouchableOpacity style={styles.viewMoreBtn}>
                      <Text variant="label" color="primary">
                        View all {bookmarkedWords.length} bookmarks
                      </Text>
                    </TouchableOpacity>
                  )}
                </Card>
              </>
            )}

            {/* Featured Word */}
            <Text variant="h4" color="heading" style={styles.sectionTitle}>
              Word of the Week
            </Text>
            <Card style={styles.featuredCard}>
              <View style={styles.featuredBadge}>
                <View style={styles.featuredBadgeContent}>
                  <Ionicons name="star" size={12} color={colors.white} />
                  <Text variant="caption" color="white">
                    Featured
                  </Text>
                </View>
              </View>
              <Text variant="h3" color="heading" style={styles.featuredWord}>
                Mellifluous
              </Text>
              <Text variant="body" color="body">
                Sweet or musical; pleasant to hear.
              </Text>
              <TouchableOpacity 
                style={styles.featuredBtn}
                onPress={() => handleWordPress('mellifluous')}
              >
                <Text variant="label" color="primary">Learn more</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.primary} />
              </TouchableOpacity>
            </Card>
          </>
        )}

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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing[4],
    borderRadius: borderRadius.xl,
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textBody,
  },
  searchResultsContainer: {
    marginBottom: spacing[6],
  },
  searchLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
    paddingVertical: spacing[6],
  },
  searchResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: spacing[6],
    gap: spacing[3],
  },
  sectionTitle: {
    marginBottom: spacing[4],
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  categoryCard: {
    width: '47%',
    backgroundColor: colors.surface,
    padding: spacing[4],
    borderRadius: borderRadius.xl,
    borderLeftWidth: 4,
  },
  categoryIcon: {
    marginBottom: spacing[2],
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  recentItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  bookmarkIcon: {
    padding: spacing[2],
  },
  viewMoreBtn: {
    paddingVertical: spacing[3],
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  featuredCard: {
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    marginBottom: spacing[3],
  },
  featuredBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  featuredWord: {
    marginBottom: spacing[2],
  },
  featuredBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[4],
  },
  bottomSpacer: {
    height: spacing[20],
  },
});
