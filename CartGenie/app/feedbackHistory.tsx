import React from 'react';
import { Stack, useRouter } from 'expo-router';
import {
  View, Text, StyleSheet, Platform, TouchableOpacity, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppColors, AppColors } from '@/components/appThemeProvider';

type Entry = {
  id: string;
  title: string;     // e.g. "Blood Test Analysis"
  date: string;      // ISO
  summary: string;   // short text
  status: 'good' | 'warning' | 'critical';
};

const MOCK: Entry[] = [
  { id: 'e1', title: 'Grocery Receipt Review', date: '2025-10-04T10:05:00Z', summary: '12 items analyzed. 3 high sugar warnings.', status: 'warning' },
  { id: 'e2', title: 'Blood Test Analysis', date: '2025-09-21T09:12:00Z', summary: 'HDL ok, triglycerides slightly high.', status: 'warning' },
  { id: 'e3', title: 'Allergy Profile Saved', date: '2025-09-12T12:34:00Z', summary: 'Tree nuts, Milk (moderate).', status: 'good' },
];

export default function FeedbackHistory() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const col = useAppColors();
  const styles = React.useMemo(() => makeStyles(col), [col]);

  const groups = React.useMemo(() => {
    // group by YYYY-MM
    const map = new Map<string, Entry[]>();
    for (const e of MOCK) {
      const d = new Date(e.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    // sort inside groups by date desc
    for (const arr of map.values()) arr.sort((a, b) => +new Date(b.date) - +new Date(a.date));
    // to array sorted by key desc
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, []);

  return (
    <>
      <Stack.Screen options={{ title: 'Feedback History' }} />
      <View style={[styles.screen, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 72 }]}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Feedback History</Text>
          <Text style={styles.subtitle}>Your past analyses and recommendations.</Text>

          {groups.length === 0 && (
            <EmptyState onStart={() => router.push('/bloodTestUploadScreen')} styles={styles} />
          )}

          {groups.map(([ym, entries]) => (
            <View key={ym} style={styles.monthBlock}>
              <Text style={styles.monthTitle}>{formatMonth(ym)}</Text>
              <View style={{ gap: 10 }}>
                {entries.map((e) => (
                  <View key={e.id} style={styles.card}>
                    <View style={styles.cardHeaderRow}>
                      <Text style={styles.cardTitle}>{e.title}</Text>
                      <StatusBadge status={e.status} />
                    </View>
                    <Text style={styles.dateText}>{new Date(e.date).toLocaleString()}</Text>
                    <Text style={styles.summary}>{e.summary}</Text>
                    <View style={styles.actionsRow}>
                      <TouchableOpacity style={styles.actionBtn} onPress={() => {/* open detailed view */}}>
                        <Ionicons name="eye-outline" size={18} color={col.text} />
                        <Text style={styles.actionText}>View</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/discover')}>
                        <Ionicons name="compass-outline" size={18} color={col.text} />
                        <Text style={styles.actionText}>Discover</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}

          {groups.length > 0 && (
            <TouchableOpacity style={styles.primaryCta} onPress={() => router.push('/bloodTestUploadScreen')}>
              <Ionicons name="cloud-upload-outline" size={18} color="#fff" />
              <Text style={styles.primaryCtaText}>Start new analysis</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </>
  );
}

function EmptyState({ onStart, styles }: { onStart: () => void; styles: ReturnType<typeof makeStyles> }) {
  return (
    <View style={styles.emptyBox}>
      <Ionicons name="folder-open-outline" size={24} color="#64748B" />
      <Text style={styles.emptyTitle}>No history yet</Text>
      <Text style={styles.emptyText}>Upload a blood test or a grocery receipt to get your first feedback.</Text>
      <TouchableOpacity style={styles.primaryCta} onPress={onStart}>
        <Ionicons name="cloud-upload-outline" size={18} color="#fff" />
        <Text style={styles.primaryCtaText}>Start new analysis</Text>
      </TouchableOpacity>
    </View>
  );
}

function StatusBadge({ status }: { status: 'good' | 'warning' | 'critical' }) {
  const theme = {
    good:   { bg: '#DCFCE7', br: '#22C55E', tx: '#16A34A', text: 'Good' },
    warning:{ bg: '#FEF9C3', br: '#EAB308', tx: '#A16207', text: 'Attention' },
    critical:{ bg: '#FEE2E2', br: '#EF4444', tx: '#DC2626', text: 'Critical' },
  }[status];
  return (
    <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, borderWidth: 1, backgroundColor: theme.bg, borderColor: theme.br }}>
      <Text style={{ fontSize: 11, fontWeight: '700', color: theme.tx }}>{theme.text}</Text>
    </View>
  );
}

function formatMonth(ym: string) {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleString(undefined, { month: 'long', year: 'numeric' });
}

const CARD_MAX = 520;
const ACCENT = '#0096c7';

const makeStyles = (c: AppColors) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    container: { paddingHorizontal: 20, paddingBottom: 16 },
    title: { fontSize: 22, fontWeight: '800', color: c.text, textAlign: 'center' },
    subtitle: { fontSize: 13, color: c.subtitle, textAlign: 'center', marginTop: 6, marginBottom: 14 },

    monthBlock: { marginBottom: 18 },
    monthTitle: { fontSize: 14, fontWeight: '800', color: c.text, marginBottom: 8 },

    card: {
      width: '100%', maxWidth: CARD_MAX,
      backgroundColor: c.card, borderRadius: 16, borderWidth: 1, borderColor: c.inputBorder,
      padding: 14, ...Platform.select({ ios: { shadowColor: '#0F172A', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } }, android: { elevation: 2 } }),
    },
    cardHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    cardTitle: { fontSize: 16, fontWeight: '800', color: c.text, flex: 1, marginRight: 8 },
    dateText: { marginTop: 6, color: c.subtitle, fontSize: 12 },
    summary: { marginTop: 6, color: c.text, fontSize: 13 },
    actionsRow: { flexDirection: 'row', gap: 10, marginTop: 10, justifyContent: 'flex-end' },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: c.inputBorder },
    actionText: { color: c.text, fontWeight: '700', fontSize: 13 },

    emptyBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 24, gap: 8 },
    emptyTitle: { fontSize: 16, fontWeight: '800', color: c.text },
    emptyText: { color: c.subtitle, fontSize: 13, textAlign: 'center' },

    primaryCta: {
      alignSelf: 'center',
      marginTop: 16,
      backgroundColor: ACCENT,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      ...Platform.select({ ios: { shadowColor: '#0369A1', shadowOpacity: 0.22, shadowRadius: 8, shadowOffset: { width: 0, height: 5 } }, android: { elevation: 3 } }),
    },
    primaryCtaText: { color: '#fff', fontWeight: '700' },
  });
