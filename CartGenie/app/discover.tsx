import React from 'react';
import { Stack } from 'expo-router';
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
import { useAllergies } from '@/hooks/useAllergies';
import { useAppColors, AppColors } from '@/components/appThemeProvider';

type Mode = 'products' | 'facts' | 'news';

type ProductItem = {
  id: string;
  name: string;
  description: string;
  allergens: string[];
  tags: string[];
  isAllergenFree: boolean;
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
// Put your images here:
// assets/images/facts/fact1.png ... fact10.png
// If the folder is different, just adjust the paths below.
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
    name: 'Whole cow’s milk',
    description: 'Rich in calcium and protein but contains the milk allergen.',
    allergens: ['Milk'],
    tags: ['dairy', 'high-calcium'],
    isAllergenFree: false,
  },
  {
    id: 'p2',
    name: 'Cheddar cheese',
    description: 'Aged cheese made from cow’s milk, a common dairy allergen source.',
    allergens: ['Milk'],
    tags: ['dairy'],
    isAllergenFree: false,
  },
  {
    id: 'p3',
    name: 'Fruit yogurt (sweetened)',
    description: 'Flavored yogurt with added sugar, contains dairy (milk).',
    allergens: ['Milk'],
    tags: ['dairy', 'sweetened'],
    isAllergenFree: false,
  },
  {
    id: 'p4',
    name: 'Whole wheat bread',
    description: 'Bread made with wheat flour; contains gluten and cereal allergens.',
    allergens: ['Cereals containing gluten'],
    tags: ['grains', 'wheat'],
    isAllergenFree: false,
  },
  {
    id: 'p5',
    name: 'Chicken eggs',
    description: 'Boiled or scrambled eggs; a classic egg allergen source.',
    allergens: ['Eggs'],
    tags: ['protein', 'breakfast'],
    isAllergenFree: false,
  },
  {
    id: 'p6',
    name: 'Peanut butter',
    description: 'Spread made from ground peanuts; often involved in severe reactions.',
    allergens: ['Peanuts'],
    tags: ['nuts', 'spread', 'high-protein'],
    isAllergenFree: false,
  },
  {
    id: 'p7',
    name: 'Roasted almonds',
    description: 'Tree nut snack; must be avoided with tree nut allergy.',
    allergens: ['Tree nuts'],
    tags: ['nuts', 'snack'],
    isAllergenFree: false,
  },
  {
    id: 'p8',
    name: 'Soy sauce',
    description: 'Fermented condiment that usually contains soy and wheat (gluten).',
    allergens: ['Soybeans', 'Cereals containing gluten'],
    tags: ['soy', 'condiment'],
    isAllergenFree: false,
  },
  {
    id: 'p9',
    name: 'Grilled salmon fillet',
    description: 'Oily fish rich in omega-3 fats; allergenic for people with fish allergy.',
    allergens: ['Fish'],
    tags: ['fish', 'omega-3'],
    isAllergenFree: false,
  },
  {
    id: 'p10',
    name: 'Cooked shrimp',
    description: 'Crustacean shellfish; a frequent cause of adult food allergies.',
    allergens: ['Crustaceans'],
    tags: ['shellfish'],
    isAllergenFree: false,
  },
  // Low-allergen items (assuming no cross-contact and no added sauces)
  {
    id: 'p11',
    name: 'Fresh apple',
    description: 'Whole fruit with fiber and natural sugars, usually free of major allergens.',
    allergens: [],
    tags: ['fruit', 'snack'],
    isAllergenFree: true,
  },
  {
    id: 'p12',
    name: 'Banana',
    description: 'Soft, energy-dense fruit often used in low-allergy menus.',
    allergens: [],
    tags: ['fruit', 'potassium'],
    isAllergenFree: true,
  },
  {
    id: 'p13',
    name: 'Raw carrot sticks',
    description: 'Crunchy vegetable snack, typically low in allergenic potential.',
    allergens: [],
    tags: ['vegetable', 'snack'],
    isAllergenFree: true,
  },
  {
    id: 'p14',
    name: 'Steamed broccoli florets',
    description: 'Non-starchy vegetable rich in vitamin C and fiber.',
    allergens: [],
    tags: ['vegetable'],
    isAllergenFree: true,
  },
  {
    id: 'p15',
    name: 'Plain cooked white rice',
    description: 'Simple carbohydrate source, often used in elimination diets.',
    allergens: [],
    tags: ['grain', 'neutral'],
    isAllergenFree: true,
  },
];

// ---------- DATA: FUN FACTS ----------

const FACT_ITEMS: FactItem[] = [
  {
    id: 'f1',
    title: 'Fiber feeds your microbiome',
    text: 'Dietary fiber from whole grains, fruits and vegetables is fermented by gut bacteria into short-chain fatty acids that support gut and immune health.',
    imageKey: 'fact1',
  },
  {
    id: 'f2',
    title: 'Protein helps you feel full longer',
    text: 'Meals higher in protein tend to increase satiety, which can help reduce snacking and support weight management.',
    imageKey: 'fact2',
  },
  {
    id: 'f3',
    title: 'Not all fats are equal',
    text: 'Unsaturated fats from nuts, seeds, olive oil and fatty fish may support heart health, while trans fats increase cardiovascular risk.',
    imageKey: 'fact3',
  },
  {
    id: 'f4',
    title: 'Colorful plates, diverse nutrients',
    text: 'Different colors in fruits and vegetables often mean different antioxidants and phytochemicals. “Eat the rainbow” is a simple diversity rule.',
    imageKey: 'fact4',
  },
  {
    id: 'f5',
    title: 'Liquid calories are easy to overlook',
    text: 'Sugary drinks can add a lot of calories and sugar without triggering the same fullness as solid foods.',
    imageKey: 'fact5',
  },
  {
    id: 'f6',
    title: 'Whole grains vs. refined grains',
    text: 'Whole grains keep the bran and germ, preserving fiber, vitamins and minerals that are removed in refined flour.',
    imageKey: 'fact6',
  },
  {
    id: 'f7',
    title: 'Vitamin C helps iron absorption',
    text: 'Combining plant-based iron sources with vitamin C–rich foods can improve iron absorption from the meal.',
    imageKey: 'fact7',
  },
  {
    id: 'f8',
    title: 'Sleep and diet are connected',
    text: 'Poor sleep is associated with higher cravings for sugary and high-fat foods, affecting long-term diet quality.',
    imageKey: 'fact8',
  },
  {
    id: 'f9',
    title: 'Hydration affects appetite',
    text: 'Drinking water before meals can modestly reduce calorie intake for some people by improving fullness.',
    imageKey: 'fact9',
  },
  {
    id: 'f10',
    title: 'Ultra-processed foods and health',
    text: 'Diets high in ultra-processed foods are linked to higher risks of obesity, heart disease and some cancers in observational studies.',
    imageKey: 'fact10',
  },
];

// ---------- DATA: NEWS ----------

const NEWS_ITEMS: NewsItem[] = [
  {
    id: 'n1',
    title: 'Mediterranean diet linked to lower heart disease risk',
    source: 'Cardiovascular research',
    date: '2023',
    summary:
      'Observational studies show that a Mediterranean-style pattern rich in olive oil, vegetables, legumes and fish is associated with reduced cardiovascular risk.',
    url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa1800389',
  },
  {
    id: 'n2',
    title: 'Ultra-processed foods and weight gain',
    source: 'Clinical trial',
    date: '2019',
    summary:
      'In a controlled trial, participants eating ultra-processed foods consumed more calories and gained more weight than when eating unprocessed foods.',
    url: 'https://www.cell.com/cell-metabolism/fulltext/S1550-4131(19)30248-7',
  },
  {
    id: 'n3',
    title: 'Plant-based diets and type 2 diabetes risk',
    source: 'Epidemiology',
    date: '2021',
    summary:
      'Large cohort analyses suggest that higher adherence to healthy plant-based dietary patterns is linked to a lower risk of type 2 diabetes.',
    url: 'https://www.bmj.com/content/366/bmj.l3809',
  },
  {
    id: 'n4',
    title: 'Early introduction of allergens in infants',
    source: 'Allergy research',
    date: '2015–2020',
    summary:
      'Randomized trials have shown that early introduction of peanut in high-risk infants can reduce the development of peanut allergy.',
    url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa1414850',
  },
  {
    id: 'n5',
    title: 'Personalized nutrition from blood markers',
    source: 'Precision nutrition',
    date: '2020',
    summary:
      'Emerging work in precision nutrition uses glucose responses, blood lipids and microbiome profiles to tailor diet recommendations.',
    url: 'https://www.cell.com/cell/fulltext/S0092-8674(15)01481-6',
  },
];

const MODES: { id: Mode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'products', label: 'Products', icon: 'cart-outline' },
  { id: 'facts', label: 'Fun Facts', icon: 'bulb-outline' },
  { id: 'news', label: 'News', icon: 'newspaper-outline' },
];

// ---------- SCREEN ----------

export default function Discover() {
  const col = useAppColors();
  const insets = useSafeAreaInsets();

  const { selected } = useAllergies([]);
  const selectedAllergens = React.useMemo(
    () => new Set(Array.from(selected)),
    [selected]
  );

  const [mode, setMode] = React.useState<Mode>('products');
  const [query, setQuery] = React.useState('');

  const styles = React.useMemo(() => makeStyles(col), [col]);

  const filteredProducts = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRODUCT_ITEMS.filter((item) =>
      item.name.toLowerCase().includes(q)
    );
  }, [query]);

  const isAllergySafe = (item: ProductItem) =>
    item.allergens.every((a) => !selectedAllergens.has(a));

  // --- RENDER BLOCKS ---

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
          returnKeyType="search"
        />
      </View>

      <View style={styles.list}>
        {filteredProducts.map((item) => {
          const safe = isAllergySafe(item);
          const badgeBg = item.isAllergenFree || safe ? '#DCFCE7' : '#FEE2E2';
          const badgeBorder = item.isAllergenFree || safe ? '#22C55E' : '#EF4444';
          const badgeColor = item.isAllergenFree || safe ? '#16A34A' : '#DC2626';

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
                    {item.isAllergenFree
                      ? 'Allergen-free (major allergens)'
                      : safe
                      ? 'Allergy-safe for your profile'
                      : 'Contains allergens you avoid'}
                  </Text>
                </View>
              </View>

              <Text style={styles.description}>{item.description}</Text>

              {item.allergens.length > 0 && (
                <Text style={styles.allergens}>
                  Allergens: {item.allergens.join(', ')}
                </Text>
              )}
            </View>
          );
        })}

        {filteredProducts.length === 0 && (
          <View style={styles.emptyBox}>
            <Ionicons name="document-text-outline" size={24} color={col.subtitle} />
            <Text style={styles.emptyText}>No products found. Try another search.</Text>
          </View>
        )}

        <Text style={styles.disclaimer}>
          Disclaimer: Always double-check food labels and consult your healthcare provider
          for personalized allergy advice.
        </Text>
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
              <Image
                source={src}
                style={styles.factImage}
                resizeMode="cover"
              />
            )}
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>{fact.title}</Text>
            </View>
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

  // --- MAIN RENDER ---

  return (
    <>
      <Stack.Screen options={{ title: 'Discover' }} />
      <View
        style={[
          styles.screen,
          {
            paddingTop: insets.top + 8,
            paddingBottom: insets.bottom + 72, // space for navbar
          },
        ]}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* BIG COMPASS ICON */}
          <Ionicons
            name="compass-outline"
            size={46}
            color={col.text}
            style={{ alignSelf: 'center', marginBottom: 4 }}
          />

          <Text style={styles.title}>Discover</Text>
          <Text style={styles.subtitle}>
            Explore products, fun nutrition facts, and recent news about healthy eating.
          </Text>

          {/* Mode selector */}
          <View style={styles.modeRow}>
            {MODES.map((m) => {
              const active = mode === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.modeBtn, active && styles.modeBtnActive]}
                  onPress={() => setMode(m.id)}
                  activeOpacity={0.9}
                >
                  <Ionicons
                    name={m.icon}
                    size={16}
                    color={active ? '#0F172A' : col.subtitle}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[styles.modeText, active && styles.modeTextActive]}>
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
    container: {
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
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
    modeText: {
      fontSize: 13,
      color: c.subtitle,
      fontWeight: '600',
    },
    modeTextActive: {
      color: '#0F172A',
      fontWeight: '800',
    },

    // Products
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
    searchInput: {
      flex: 1,
      color: c.text,
      padding: 0,
      margin: 0,
    },
    list: {
      alignItems: 'center',
      gap: 12,
      paddingBottom: 16,
    },
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
    description: {
      marginTop: 6,
      fontSize: 13,
      color: c.text,
    },
    allergens: {
      marginTop: 6,
      fontSize: 12,
      color: '#b91c1c',
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      borderWidth: 1,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '700',
    },

    // Fun facts
    factImage: {
      width: '100%',
      height: 140,
      borderRadius: 12,
      marginBottom: 8,
    },

    // News
    newsMeta: {
      marginTop: 4,
      fontSize: 11,
      color: c.subtitle,
    },
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
    newsLinkText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#0F172A',
    },

    // Empty / misc
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
    disclaimer: {
      marginTop: 4,
      fontSize: 11,
      color: c.subtitle,
      textAlign: 'center',
    },
  });
