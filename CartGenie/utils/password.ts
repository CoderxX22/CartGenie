// utils/password.ts
export function getPasswordStrength(pwd: string) {
    const len = pwd.length;
    const lower = /[a-z]/.test(pwd);
    const upper = /[A-Z]/.test(pwd);
    const digit = /\d/.test(pwd);
    const symbol = /[^A-Za-z0-9]/.test(pwd);
    const common = /(password|qwerty|1234|1111|0000|abcd)/i.test(pwd);
    const repeats = /(.)\1{2,}/.test(pwd);
  
    let score =
      len === 0 ? 0 :
      len < 6 ? 1 :
      len < 8 ? 2 :
      len < 12 ? 3 : 4;
  
    const variety = [lower, upper, digit, symbol].filter(Boolean).length;
    score += Math.max(0, variety - 2);
  
    if (common) score -= 2;
    if (repeats) score -= 1;
    score = Math.max(0, Math.min(4, score));
  
    const labels = ['very weak', 'weak', 'medium', 'strong', 'strong'];
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#22c55e'];
  
    return { level: score, label: labels[score], color: colors[score] };
  }