// utils/homeUtils.ts
export const DAILY_TIPS = [
    'Add at least one colorful vegetable to every meal.',
    'Drink a glass of water before each meal.',
    'Replace one sugary drink with water or tea.',
    'Include a source of protein in each meal.',
    'Swap refined grains for whole grains.',
    'Add a handful of nuts as a healthy snack.',
    'Plan at least one meat-free meal this week.',
    'Fill half your plate with vegetables.',
    'Check labels for added sugars.',
    'Eat slowly and mindfully.',
  ];
  
  export const formatShortDate = (d: Date) => {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };
  
  export const getRandomTip = () => {
    return DAILY_TIPS[Math.floor(Math.random() * DAILY_TIPS.length)];
  };