import React from 'react';
import { Stack, useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  ScrollView,
  Linking,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIllnesses } from '@/hooks/useIllnesses';
import { useAppColors, AppColors } from '@/components/appThemeProvider';

type Mode = 'products' | 'facts' | 'news';

type ProductItem = {
  id: string;
  name: string;
  description: string;
  recommendedFor: string[];
  avoidFor: string[];
  tags: string[];
};

type FactItem = {
  id: string;
  title: string;
  text: string;
  imageKey?: keyof typeof FACT_IMAGE_MAP;
};

type NewsItem = {
  id: string;
  title: string;
  source: string;
  date: string;
  summary: string;
  url: string;
};

const CARD_MAX = 520;
const ACCENT = '#0096c7';

// ---------- IMAGES FOR FUN FACTS ----------
const FACT_IMAGE_MAP = {
  fact1: require('../assets/images/facts/fact1.png'),
  fact2: require('../assets/images/facts/fact2.png'),
  fact3: require('../assets/images/facts/fact3.png'),
  fact4: require('../assets/images/facts/fact4.png'),
  fact5: require('../assets/images/facts/fact5.png'),
  fact6: require('../assets/images/facts/fact6.png'),
  fact7: require('../assets/images/facts/fact7.png'),
  fact8: require('../assets/images/facts/fact8.png'),
  fact9: require('../assets/images/facts/fact9.png'),
  fact10: require('../assets/images/facts/fact10.png'),
} as const;

// ---------- DATA: PRODUCTS ----------
const PRODUCT_ITEMS: ProductItem[] = [
  {
    id: 'p1',
    name: 'Oatmeal (unsweetened)',
    description: 'Rich in fiber, helps control blood sugar and cholesterol levels.',
    recommendedFor: ['Diabetes Type 2', 'High cholesterol', 'Obesity'],
    avoidFor: ['Celiac disease (Gluten intolerance)'],
    tags: ['fiber', 'breakfast', 'whole-grain'],
  },
  {
    id: 'p2',
    name: 'Grilled salmon',
    description: 'Excellent source of omega-3 fats, supports heart health.',
    recommendedFor: ['Heart disease (Cardiovascular)', 'High cholesterol'],
    avoidFor: ['Gout (Uric acid buildup)'],
    tags: ['fish', 'protein', 'omega-3'],
  },
  {
    id: 'p3',
    name: 'White bread',
    description: 'Refined carbohydrate that can spike blood sugar levels.',
    recommendedFor: [],
    avoidFor: ['Diabetes Type 2', 'Obesity', 'Celiac disease (Gluten intolerance)'],
    tags: ['refined', 'bread'],
  },
  {
    id: 'p4',
    name: 'Low-fat yogurt',
    description: 'Contains probiotics and calcium but includes dairy.',
    recommendedFor: ['Irritable bowel syndrome (IBS)', 'Osteoporosis'],
    avoidFor: ['Lactose intolerance'],
    tags: ['dairy', 'probiotic'],
  },
  {
    id: 'p5',
    name: 'Red meat (steak)',
    description: 'High in protein and iron but may raise uric acid and cholesterol.',
    recommendedFor: ['Anemia (Iron deficiency)'],
    avoidFor: ['Gout (Uric acid buildup)', 'High cholesterol'],
    tags: ['protein', 'iron'],
  },
  {
    id: 'p6',
    name: 'Brown rice',
    description: 'Whole grain source of complex carbs and fiber.',
    recommendedFor: ['Diabetes Type 2', 'Obesity'],
    avoidFor: ['Irritable bowel syndrome (IBS)'],
    tags: ['whole-grain', 'fiber'],
  },
  {
    id: 'p7',
    name: 'Banana',
    description: 'Rich in potassium, supports heart and blood pressure control.',
    recommendedFor: [
      'High blood pressure (Hypertension)',
      'Depression / Anxiety (affecting appetite)',
    ],
    avoidFor: ['Diabetes Type 2'],
    tags: ['fruit', 'potassium'],
  },
  {
    id: 'p8',
    name: 'Coffee (black)',
    description: 'May boost alertness but can irritate stomach and raise blood pressure.',
    recommendedFor: [],
    avoidFor: ['High blood pressure (Hypertension)', 'Gastric ulcer (Stomach ulcer)'],
    tags: ['caffeine', 'drink'],
  },
  {
    id: 'p9',
    name: 'Olive oil (extra virgin)',
    description: 'Healthy fat that supports cardiovascular health.',
    recommendedFor: ['Heart disease (Cardiovascular)', 'High cholesterol'],
    avoidFor: [],
    tags: ['healthy fat', 'oil'],
  },
  {
    id: 'p10',
    name: 'Processed sausage',
    description: 'High in salt and saturated fat, increases cardiovascular risk.',
    recommendedFor: [],
    avoidFor: ['Heart disease (Cardiovascular)', 'High blood pressure (Hypertension)'],
    tags: ['processed', 'fatty'],
  },
];

// ---------- DATA: FUN FACTS ----------
const FACT_ITEMS: FactItem[] = [
  {
    id: 'f1',
    title: 'Healthy fats can protect your heart',
    text: 'Olive oil, nuts, and fatty fish provide omega-3 and omega-9 fatty acids that lower inflammation and improve heart function.',
    imageKey: 'fact3',
  },
  {
    id: 'f2',
    title: 'Complex carbs release energy slowly',
    text: 'Whole grains and legumes help stabilize blood sugar and prevent energy crashes during the day.',
    imageKey: 'fact6',
  },
  {
    id: 'f3',
    title: 'Stay hydrated for kidney health',
    text: 'Water helps the kidneys filter waste effectively and prevent kidney stones.',
    imageKey: 'fact9',
  },
];

// ---------- DATA: NEWS ----------
const NEWS_ITEMS: NewsItem[] = [
  {
    id: 'n1',
    title: 'Dietary changes reduce risk of type 2 diabetes',
    source: 'The Lancet',
    date: '2024',
    summary:
      'Research shows that replacing refined carbs with high-fiber foods can lower the risk of developing type 2 diabetes.',
    url: 'https://www.thelancet.com/',
  },
  {
    id: 'n2',
    title: 'Omega-3 intake improves mental well-being',
    source: 'Nature Medicine',
    date: '2023',
    summary:
      'Studies indicate that higher omega-3 intake supports brain health and reduces symptoms of depression and anxiety.',
    url: 'https://www.nature.com/',
  },
];

// ---------- MODES ----------
const MODES: { id: Mode; label: string; icon: keyof typeof Ionicons.glyphMap }[] =
  [
    { id: 'products', label: 'Products', icon: 'cart-outline' },
    { id: 'facts', label: 'Health Facts', icon: 'bulb-outline' },
    { id: 'news', label: 'News', icon: 'newspaper-outline' },
  ];

// ---------- SCREEN ----------
export default function Discover() {
  const col = useAppColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { selected } = useIllnesses([]);
  const selectedIllnesses = React.useMemo(
    () => new Set(Array.from(selected)),
    [selected],
  );

  const [mode, setMode] = React.useState<Mode>('products');
  const [query, setQuery] = React.useState('');

  const styles = React.useMemo(() => makeStyles(col), [col]);

  const filteredProducts = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRODUCT_ITEMS.filter((item) =>
      item.name.toLowerCase().includes(q),
    );
  }, [query]);

  const isSuitable = (item: ProductItem) => {
    const hasConflict = item.avoidFor.some((ill) => selectedIllnesses.has(ill));
    return !hasConflict;
  };

  const renderProducts = () => (
    <>
      <View style={styles.searchRow}>
        <Ionicons name="search" size={16} color={col.subtitle} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products…"
          placeholderTextColor={col.subtitle}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <View style={styles.list}>
        {filteredProducts.map((item) => {
          const suitable = isSuitable(item);
          const badgeBg = suitable ? '#DCFCE7' : '#FEE2E2';
          const badgeBorder = suitable ? '#22C55E' : '#EF4444';
          const badgeColor = suitable ? '#16A34A' : '#DC2626';

          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: badgeBg, borderColor: badgeBorder },
                  ]}
                >
                  <Text style={[styles.badgeText, { color: badgeColor }]}>
                    {suitable
                      ? 'Suitable for your health profile'
                      : 'Not recommended'}
                  </Text>
                </View>
              </View>
              <Text style={styles.description}>{item.description}</Text>

              {item.avoidFor.length > 0 && (
                <Text style={styles.allergens}>
                  Not recommended for: {item.avoidFor.join(', ')}
                </Text>
              )}
              {item.recommendedFor.length > 0 && (
                <Text style={styles.recommended}>
                  Recommended for: {item.recommendedFor.join(', ')}
                </Text>
              )}
            </View>
          );
        })}

        {filteredProducts.length === 0 && (
          <View style={styles.emptyBox}>
            <Ionicons
              name="document-text-outline"
              size={24}
              color={col.subtitle}
            />
            <Text style={styles.emptyText}>
              No products found. Try another search.
            </Text>
          </View>
        )}
      </View>
    </>
  );

  const renderFacts = () => (
    <View style={styles.list}>
      {FACT_ITEMS.map((fact) => {
        const src =
          fact.imageKey && FACT_IMAGE_MAP[fact.imageKey]
            ? FACT_IMAGE_MAP[fact.imageKey]
            : undefined;
        return (
          <View key={fact.id} style={styles.card}>
            {src && (
              <Image source={src} style={styles.factImage} resizeMode="cover" />
            )}
            <Text style={styles.cardTitle}>{fact.title}</Text>
            <Text style={styles.description}>{fact.text}</Text>
          </View>
        );
      })}
    </View>
  );

  const renderNews = () => (
    <View style={styles.list}>
      {NEWS_ITEMS.map((n) => (
        <View key={n.id} style={styles.card}>
          <Text style={styles.cardTitle}>{n.title}</Text>
          <Text style={styles.newsMeta}>
            {n.source} • {n.date}
          </Text>
          <Text style={styles.description}>{n.summary}</Text>
          <TouchableOpacity
            style={styles.newsLinkBtn}
            onPress={() => Linking.openURL(n.url)}
            activeOpacity={0.9}
          >
            <Ionicons name="open-outline" size={16} color="#0F172A" />
            <Text style={styles.newsLinkText}>Open article</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Discover',
          headerBackVisible: false,
          gestureEnabled: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/homePage')}
              style={{ paddingHorizontal: 12 }}
            >
              <Ionicons name="home-outline" size={22} color={col.text} />
            </TouchableOpacity>
          ),
        }}
      />
      <View
        style={[
          styles.screen,
          {
            paddingTop: insets.top + 8,
            paddingBottom: insets.bottom + 72,
          },
        ]}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Ionicons
            name="compass-outline"
            size={46}
            color={col.text}
            style={{ alignSelf: 'center', marginBottom: 4 }}
          />
          <Text style={styles.title}>Discover</Text>
          <Text style={styles.subtitle}>
            Explore products, health facts, and nutrition news tailored to your
            conditions.
          </Text>

          <View style={styles.modeRow}>
            {MODES.map((m) => {
              const active = mode === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.modeBtn, active && styles.modeBtnActive]}
                  onPress={() => setMode(m.id)}
                >
                  <Ionicons
                    name={m.icon}
                    size={16}
                    color={active ? '#0F172A' : col.subtitle}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={[
                      styles.modeText,
                      active && styles.modeTextActive,
                    ]}
                  >
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {mode === 'products' && renderProducts()}
          {mode === 'facts' && renderFacts()}
          {mode === 'news' && renderNews()}
        </ScrollView>
      </View>
    </>
  );
}

// ---------- STYLES ----------
const makeStyles = (c: AppColors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    container: { paddingHorizontal: 20, paddingBottom: 16 },
    title: {
      fontSize: 22,
      fontWeight: '800',
      color: c.text,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 13,
      color: c.subtitle,
      textAlign: 'center',
      marginTop: 4,
      marginBottom: 14,
    },
    modeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
      gap: 8,
    },
    modeBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: c.inputBorder,
      backgroundColor: c.card,
    },
    modeBtnActive: {
      borderColor: ACCENT,
      backgroundColor: '#E9F6FB',
    },
    modeText: { fontSize: 13, color: c.subtitle, fontWeight: '600' },
    modeTextActive: { color: '#0F172A', fontWeight: '800' },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.inputBg,
      borderWidth: 1,
      borderColor: c.inputBorder,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 10,
      gap: 8,
    },
    searchInput: { flex: 1, color: c.text, padding: 0, margin: 0 },
    list: { alignItems: 'center', gap: 12, paddingBottom: 16 },
    card: {
      width: '100%',
      maxWidth: CARD_MAX,
      backgroundColor: c.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.inputBorder,
      padding: 14,
      ...Platform.select({
        ios: {
          shadowColor: '#0F172A',
          shadowOpacity: 0.06,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
        },
        android: { elevation: 2 },
      }),
    },
    cardHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: c.text,
      flex: 1,
      marginRight: 8,
    },
    description: { marginTop: 6, fontSize: 13, color: c.text },
    allergens: { marginTop: 6, fontSize: 12, color: '#b91c1c' },
    recommended: { marginTop: 4, fontSize: 12, color: '#15803d' },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      borderWidth: 1,
    },
    badgeText: { fontSize: 11, fontWeight: '700' },
    factImage: {
      width: '100%',
      height: 140,
      borderRadius: 12,
      marginBottom: 8,
    },
    newsMeta: { marginTop: 4, fontSize: 11, color: c.subtitle },
    newsLinkBtn: {
      marginTop: 10,
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.inputBorder,
      backgroundColor: '#E5E9F5',
    },
    newsLinkText: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
    emptyBox: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 24,
      gap: 8,
    },
    emptyText: {
      color: c.subtitle,
      fontSize: 13,
      textAlign: 'center',
      paddingHorizontal: 12,
    },
  });
