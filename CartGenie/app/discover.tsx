import React, { useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppColors } from '@/components/appThemeProvider';
import { useDiscoverLogic } from '../hooks/useDiscoverLogic';
import { createDiscoverStyles } from '../app/styles/discover.styles';
import { MODES, FACT_ITEMS, NEWS_ITEMS } from '../data/discoverData';
import { ProductCard, FactCard, NewsCard, EmptyState } from '../components/DiscoverComponents';

export default function Discover() {
  const col = useAppColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createDiscoverStyles(col), [col]);

  const { state, setters, actions } = useDiscoverLogic();
  const { mode, query, filteredProducts } = state;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Discover',
          headerBackVisible: false,
          gestureEnabled: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={actions.goHome}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingVertical: 6,
                paddingHorizontal: 12,
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="home-outline" size={18} color={col.text} />
              <Text style={{ color: col.text, fontSize: 16, fontWeight: '600' }}>Home</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <View style={[styles.screen, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 72 }]}>
        <ScrollView contentContainerStyle={styles.container}>
          {/* Header */}
          <Ionicons
            name="compass-outline"
            size={46}
            color={col.text}
            style={{ alignSelf: 'center', marginBottom: 4 }}
          />
          <Text style={styles.title}>Discover</Text>
          <Text style={styles.subtitle}>
            Explore products, health facts, and nutrition news tailored to your conditions.
          </Text>

          {/* Modes Tabs */}
          <View style={styles.modeRow}>
            {MODES.map((m) => {
              const active = mode === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.modeBtn, active && styles.modeBtnActive]}
                  onPress={() => setters.setMode(m.id)}
                >
                  <Ionicons
                    name={m.icon}
                    size={16}
                    color={active ? '#0F172A' : col.subtitle}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[styles.modeText, active && styles.modeTextActive]}>{m.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Products Mode */}
          {mode === 'products' && (
            <>
              <View style={styles.searchRow}>
                <Ionicons name="search" size={16} color={col.subtitle} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search products…"
                  placeholderTextColor={col.subtitle}
                  value={query}
                  onChangeText={setters.setQuery}
                />
              </View>

              <View style={styles.list}>
                {filteredProducts.map((item) => (
                  <ProductCard key={item.id} item={item} isSuitable={actions.isSuitable(item)} colors={col} />
                ))}
                {filteredProducts.length === 0 && <EmptyState colors={col} />}
              </View>
            </>
          )}

          {/* Facts Mode */}
          {mode === 'facts' && (
            <View style={styles.list}>
              {FACT_ITEMS.map((fact) => (
                <FactCard key={fact.id} item={fact} colors={col} />
              ))}
            </View>
          )}

          {/* News Mode */}
          {mode === 'news' && (
            <View style={styles.list}>
              {NEWS_ITEMS.map((n) => (
                <NewsCard key={n.id} item={n} colors={col} />
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
}
