import React from 'react';
import { View, Text, TouchableOpacity, Image, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/components/appThemeProvider';
import { createDiscoverStyles } from '../app/styles/discover.styles';
import { ProductItem, FactItem, NewsItem, FACT_IMAGE_MAP } from '../data/discoverData';

// --- Product Card ---
export const ProductCard = ({ item, isSuitable, colors }: { item: ProductItem; isSuitable: boolean; colors: AppColors }) => {
  const styles = createDiscoverStyles(colors);
  const badgeBg = isSuitable ? '#DCFCE7' : '#FEE2E2';
  const badgeBorder = isSuitable ? '#22C55E' : '#EF4444';
  const badgeColor = isSuitable ? '#16A34A' : '#DC2626';

  return (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <View style={[styles.badge, { backgroundColor: badgeBg, borderColor: badgeBorder }]}>
          <Text style={[styles.badgeText, { color: badgeColor }]}>
            {isSuitable ? 'Suitable' : 'Not recommended'}
          </Text>
        </View>
      </View>
      <Text style={styles.description}>{item.description}</Text>

      {item.avoidFor.length > 0 && (
        <Text style={styles.allergens}>Not recommended for: {item.avoidFor.join(', ')}</Text>
      )}
      {item.recommendedFor.length > 0 && (
        <Text style={styles.recommended}>Recommended for: {item.recommendedFor.join(', ')}</Text>
      )}
    </View>
  );
};

// --- Fact Card ---
export const FactCard = ({ item, colors }: { item: FactItem; colors: AppColors }) => {
  const styles = createDiscoverStyles(colors);
  const src = item.imageKey && FACT_IMAGE_MAP[item.imageKey] ? FACT_IMAGE_MAP[item.imageKey] : undefined;

  return (
    <View style={styles.card}>
      {src && <Image source={src} style={styles.factImage} resizeMode="cover" />}
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.description}>{item.text}</Text>
    </View>
  );
};

// --- News Card ---
export const NewsCard = ({ item, colors }: { item: NewsItem; colors: AppColors }) => {
  const styles = createDiscoverStyles(colors);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.newsMeta}>{item.source} • {item.date}</Text>
      <Text style={styles.description}>{item.summary}</Text>
      <TouchableOpacity style={styles.newsLinkBtn} onPress={() => Linking.openURL(item.url)} activeOpacity={0.9}>
        <Ionicons name="open-outline" size={16} color="#0F172A" />
        <Text style={styles.newsLinkText}>Open article</Text>
      </TouchableOpacity>
    </View>
  );
};

// --- Empty State ---
export const EmptyState = ({ colors }: { colors: AppColors }) => {
  const styles = createDiscoverStyles(colors);
  return (
    <View style={styles.emptyBox}>
      <Ionicons name="document-text-outline" size={24} color={colors.subtitle} />
      <Text style={styles.emptyText}>No products found. Try another search.</Text>
    </View>
  );
};