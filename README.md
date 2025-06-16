# מערכת ניהול תקציב משפחתי

## קבצי Service

הפרויקט כולל קבצי service מלאים שמכינים את הקוד לחיבור ל-API החיצוני. כרגע הם מחזירים נתונים מקבצי ה-mock data, אבל מוכנים למעבר ל-API אמיתי.

### מבנה קבצי ה-Service:

- `src/services/api.ts` - HTTP client בסיסי עם ניהול authentication
- `src/services/authService.ts` - ניהול משתמשים והתחברות
- `src/services/budgetYearsService.ts` - ניהול שנות תקציב
- `src/services/fundsService.ts` - ניהול קופות
- `src/services/categoriesService.ts` - ניהול קטגוריות
- `src/services/incomesService.ts` - ניהול הכנסות
- `src/services/expensesService.ts` - ניהול הוצאות
- `src/services/titheService.ts` - ניהול מעשרות
- `src/services/debtsService.ts` - ניהול חובות
- `src/services/tasksService.ts` - ניהול משימות
- `src/services/assetsService.ts` - ניהול נכסים
- `src/services/dashboardService.ts` - נתוני דשבורד
- `src/services/index.ts` - ייצוא כל ה-services
- `src/hooks/useApi.ts` - Hooks לניהול קריאות API

### איך לעבור ל-API אמיתי:

1. הגדר את `REACT_APP_API_URL` ב-environment variables
2. בכל קובץ service, הסר את ההערה מהקריאות ל-`apiClient`
3. הסר את ה-mock implementation
4. עדכן את ה-types בהתאם למבנה הנתונים של ה-API

### דוגמה למעבר:

```typescript
// במקום:
// Mock implementation
return Promise.resolve(mockData);

// השתמש ב:
return apiClient.get<ReturnType>('/endpoint');
```

כל הקבצים מוכנים ומתועדים עם כל הפונקציות הנדרשות לפי מבנה ה-API שסיפקת.