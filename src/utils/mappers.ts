import { GetExpenseRequest, CreateExpenseRequest, UpdateExpenseRequest } from '../services/expensesService';



/**
 * פונקציה גנרית להעתקת שדות בין אובייקטים (אם השמות תואמים)
 */
export function mapObject<T extends object, U extends object>(source: T, keys: (keyof U)[]): U {
  const result = {} as U;
  keys.forEach((key) => {
    if (key in source) {
      // @ts-ignore
      result[key] = source[key];
    }
  });
  return result;
}
