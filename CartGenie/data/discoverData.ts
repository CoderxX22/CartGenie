import { Ionicons } from '@expo/vector-icons';

// --- Types ---
export type Mode = 'products' | 'facts' | 'news';

export interface ProductItem {
  id: string;
  name: string;
  description: string;
  recommendedFor: string[];
  avoidFor: string[];
  tags: string[];
}

export interface FactItem {
  id: string;
  title: string;
  text: string;
  imageKey?: keyof typeof FACT_IMAGE_MAP;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  date: string;
  summary: string;
  url: string;
}

// --- Image Map ---
// וודא שהנתיב לתמונות נכון ביחס למיקום הקובץ הזה
export const FACT_IMAGE_MAP = {
  fact1: require('@/assets/images/facts/fact1.png'),
  fact2: require('@/assets/images/facts/fact2.png'),
  fact3: require('@/assets/images/facts/fact3.png'),
  fact4: require('@/assets/images/facts/fact4.png'),
  fact5: require('@/assets/images/facts/fact5.png'),
  fact6: require('@/assets/images/facts/fact6.png'),
  fact7: require('@/assets/images/facts/fact7.png'),
  fact8: require('@/assets/images/facts/fact8.png'),
  fact9: require('@/assets/images/facts/fact9.png'),
  fact10: require('@/assets/images/facts/fact10.png'),
} as const;

// --- Data Constants ---
export const PRODUCT_ITEMS: ProductItem[] = [
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
  // ... שאר המוצרים שלך (קיצרתי כאן לדוגמה, תעתיק את כולם) ...
  {
    id: 'p10',
    name: 'Processed sausage',
    description: 'High in salt and saturated fat, increases cardiovascular risk.',
    recommendedFor: [],
    avoidFor: ['Heart disease (Cardiovascular)', 'High blood pressure (Hypertension)'],
    tags: ['processed', 'fatty'],
  },
];

export const FACT_ITEMS: FactItem[] = [
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

export const NEWS_ITEMS: NewsItem[] = [
  {
    id: 'n1',
    title: 'Dietary changes reduce risk of type 2 diabetes',
    source: 'The Lancet',
    date: '2024',
    summary: 'Research shows that replacing refined carbs with high-fiber foods can lower the risk of developing type 2 diabetes.',
    url: 'https://www.thelancet.com/',
  },
  {
    id: 'n2',
    title: 'Omega-3 intake improves mental well-being',
    source: 'Nature Medicine',
    date: '2023',
    summary: 'Studies indicate that higher omega-3 intake supports brain health and reduces symptoms of depression and anxiety.',
    url: 'https://www.nature.com/',
  },
];

export const MODES: { id: Mode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'products', label: 'Products', icon: 'cart-outline' },
  { id: 'facts', label: 'Health Facts', icon: 'bulb-outline' },
  { id: 'news', label: 'News', icon: 'newspaper-outline' },
];