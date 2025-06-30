/**
 * פונקציות עזר לניהול צבעים דינמיים
 */

/**
 * המרת hex color לערכי RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * יצירת צבע בהיר יותר (להרקע)
 */
export function lightenColor(hex: string, amount: number = 0.9): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#f3f4f6'; // fallback לאפור בהיר
  
  const { r, g, b } = rgb;
  const newR = Math.round(r + (255 - r) * amount);
  const newG = Math.round(g + (255 - g) * amount);
  const newB = Math.round(b + (255 - b) * amount);
  
  return `rgb(${newR}, ${newG}, ${newB})`;
}

/**
 * יצירת צבע כהה יותר (לטקסט)
 */
export function darkenColor(hex: string, amount: number = 0.3): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#374151'; // fallback לאפור כהה
  
  const { r, g, b } = rgb;
  const newR = Math.round(r * (1 - amount));
  const newG = Math.round(g * (1 - amount));
  const newB = Math.round(b * (1 - amount));
  
  return `rgb(${newR}, ${newG}, ${newB})`;
}

/**
 * יצירת צבע גבול (בין הבהיר לכהה)
 */
export function borderColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#d1d5db'; // fallback לאפור בינוני
  
  const { r, g, b } = rgb;
  const newR = Math.round(r + (255 - r) * 0.7);
  const newG = Math.round(g + (255 - g) * 0.7);
  const newB = Math.round(b + (255 - b) * 0.7);
  
  return `rgb(${newR}, ${newG}, ${newB})`;
}

/**
 * בדיקה אם צבע בהיר או כהה (לקביעת צבע טקסט)
 */
export function isLightColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return true;
  
  // חישוב luminance
  const { r, g, b } = rgb;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

/**
 * יצירת אובייקט סגנון CSS מלא מצבע hex
 */
export function createColorStyle(hex: string): {
  backgroundColor: string;
  color: string;
  borderColor: string;
} {
  if (!hex || !hex.startsWith('#')) {
    // fallback לצבע ברירת מחדל
    return {
      backgroundColor: '#f3f4f6',
      color: '#374151',
      borderColor: '#d1d5db'
    };
  }

  const backgroundColor = lightenColor(hex, 0.9);
  const textColor = darkenColor(hex, 0.4);
  const border = borderColor(hex);

  return {
    backgroundColor,
    color: textColor,
    borderColor: border
  };
}

/**
 * צבעי ברירת מחדל למקרים שונים
 */
export const DEFAULT_COLORS = {
  category: '#3b82f6', // כחול
  fund: '#10b981',     // ירוק
  expense: '#f59e0b',  // כתום
  income: '#10b981',   // ירוק
  debt: '#ef4444',     // אדום
  task: '#8b5cf6',     // סגול
  neutral: '#6b7280'   // אפור
};

/**
 * פונקציה לקבלת צבע ברירת מחדל לפי סוג
 */
export function getDefaultColor(type: keyof typeof DEFAULT_COLORS): string {
  return DEFAULT_COLORS[type];
}