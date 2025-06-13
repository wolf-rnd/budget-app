# דוגמאות API למערכת תקציב

## 🔌 חיבור למסד הנתונים

### Node.js + PostgreSQL
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

module.exports = pool;
```

## 📊 שאילתות עיקריות

### 1. קבלת סיכום שנת תקציב
```javascript
async function getBudgetYearSummary(userId, budgetYearId) {
  const query = `
    SELECT 
      by.id,
      by.name,
      by.start_date,
      by.end_date,
      by.is_active,
      get_total_income_for_budget_year($1, $2) as total_income,
      get_total_expenses_for_budget_year($1, $2) as total_expenses,
      get_total_budget_for_budget_year($1, $2) as total_budget
    FROM budget_years by
    WHERE by.user_id = $1 AND by.id = $2
  `;
  
  const result = await pool.query(query, [userId, budgetYearId]);
  return result.rows[0];
}
```

### 2. קבלת הוצאות עם פילטרים
```javascript
async function getExpenses(userId, budgetYearId, filters = {}) {
  let query = `
    SELECT 
      e.id,
      e.name,
      e.amount,
      e.date,
      e.note,
      c.name as category_name,
      c.color_class,
      f.name as fund_name
    FROM expenses e
    JOIN categories c ON e.category_id = c.id
    JOIN funds f ON e.fund_id = f.id
    WHERE e.user_id = $1 AND e.budget_year_id = $2
  `;
  
  const params = [userId, budgetYearId];
  let paramIndex = 3;
  
  if (filters.categoryId) {
    query += ` AND e.category_id = $${paramIndex}`;
    params.push(filters.categoryId);
    paramIndex++;
  }
  
  if (filters.fundId) {
    query += ` AND e.fund_id = $${paramIndex}`;
    params.push(filters.fundId);
    paramIndex++;
  }
  
  query += ` ORDER BY e.date DESC`;
  
  if (filters.limit) {
    query += ` LIMIT $${paramIndex}`;
    params.push(filters.limit);
    paramIndex++;
  }
  
  if (filters.offset) {
    query += ` OFFSET $${paramIndex}`;
    params.push(filters.offset);
  }
  
  const result = await pool.query(query, params);
  return result.rows;
}
```

### 3. הוספת הוצאה חדשה
```javascript
async function addExpense(userId, expenseData) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // קבלת budget_year_id לפי תאריך
    const budgetYearQuery = `
      SELECT id FROM budget_years 
      WHERE user_id = $1 
      AND $2 BETWEEN start_date AND end_date
    `;
    const budgetYearResult = await client.query(budgetYearQuery, [userId, expenseData.date]);
    
    if (budgetYearResult.rows.length === 0) {
      throw new Error('לא נמצאה שנת תקציב מתאימה לתאריך זה');
    }
    
    const budgetYearId = budgetYearResult.rows[0].id;
    
    // הוספת ההוצאה
    const insertQuery = `
      INSERT INTO expenses (user_id, budget_year_id, category_id, fund_id, name, amount, date, note)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const insertResult = await client.query(insertQuery, [
      userId,
      budgetYearId,
      expenseData.categoryId,
      expenseData.fundId,
      expenseData.name,
      expenseData.amount,
      expenseData.date,
      expenseData.note
    ]);
    
    // עדכון יתרת הקופה
    const updateFundQuery = `
      UPDATE fund_budgets 
      SET spent = COALESCE(spent, 0) + $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE fund_id = $2 AND budget_year_id = $3
    `;
    
    await client.query(updateFundQuery, [
      expenseData.amount,
      expenseData.fundId,
      budgetYearId
    ]);
    
    await client.query('COMMIT');
    return insertResult.rows[0];
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

### 4. קבלת מצב קופות
```javascript
async function getFundsSummary(userId, budgetYearId) {
  const query = `
    SELECT 
      f.id,
      f.name,
      f.type,
      f.level,
      fb.amount as budget_amount,
      fb.amount_given,
      fb.spent,
      CASE 
        WHEN f.type = 'monthly' THEN fb.amount - COALESCE(fb.amount_given, 0)
        ELSE fb.amount - COALESCE(fb.spent, 0)
      END as remaining_amount
    FROM funds f
    LEFT JOIN fund_budgets fb ON f.id = fb.fund_id AND fb.budget_year_id = $2
    WHERE f.user_id = $1 AND f.is_active = TRUE
    ORDER BY f.level, f.display_order, f.name
  `;
  
  const result = await pool.query(query, [userId, budgetYearId]);
  return result.rows;
}
```

### 5. הוספת הכנסה
```javascript
async function addIncome(userId, incomeData) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // קבלת budget_year_id לפי תאריך
    const budgetYearQuery = `
      SELECT id FROM budget_years 
      WHERE user_id = $1 
      AND $2 BETWEEN start_date AND end_date
    `;
    const budgetYearResult = await client.query(budgetYearQuery, [userId, incomeData.date]);
    
    if (budgetYearResult.rows.length === 0) {
      throw new Error('לא נמצאה שנת תקציב מתאימה לתאריך זה');
    }
    
    const budgetYearId = budgetYearResult.rows[0].id;
    const date = new Date(incomeData.date);
    
    const insertQuery = `
      INSERT INTO incomes (user_id, budget_year_id, name, amount, source, date, month, year, note)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const result = await client.query(insertQuery, [
      userId,
      budgetYearId,
      incomeData.name,
      incomeData.amount,
      incomeData.source,
      incomeData.date,
      date.getMonth() + 1,
      date.getFullYear(),
      incomeData.note
    ]);
    
    await client.query('COMMIT');
    return result.rows[0];
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

### 6. ניהול שנות תקציב
```javascript
async function createBudgetYear(userId, startDate, endDate) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // יצירת שם אוטומטי
    const start = new Date(startDate);
    const end = new Date(endDate);
    const name = `${String(start.getMonth() + 1).padStart(2, '0')}/${String(start.getFullYear()).slice(-2)} - ${String(end.getMonth() + 1).padStart(2, '0')}/${String(end.getFullYear()).slice(-2)}`;
    
    // יצירת שנת התקציב
    const budgetYearQuery = `
      INSERT INTO budget_years (user_id, name, start_date, end_date, is_active)
      VALUES ($1, $2, $3, $4, FALSE)
      RETURNING *
    `;
    
    const budgetYearResult = await client.query(budgetYearQuery, [userId, name, startDate, endDate]);
    const budgetYear = budgetYearResult.rows[0];
    
    // העתקת קופות מהשנה הקודמת (אם קיימת)
    const copyFundsQuery = `
      INSERT INTO fund_budgets (fund_id, budget_year_id, amount)
      SELECT f.id, $2, 0
      FROM funds f
      WHERE f.user_id = $1 AND f.is_active = TRUE
    `;
    
    await client.query(copyFundsQuery, [userId, budgetYear.id]);
    
    await client.query('COMMIT');
    return budgetYear;
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

### 7. חישוב מעשרות
```javascript
async function getTitheSummary(userId) {
  const query = `
    SELECT 
      get_total_income_for_tithe($1) as total_income,
      get_total_tithe_given($1) as total_given,
      (get_total_income_for_tithe($1) * 0.1) as required_tithe,
      (get_total_income_for_tithe($1) * 0.1) - get_total_tithe_given($1) as remaining_tithe
  `;
  
  const result = await pool.query(query, [userId]);
  return result.rows[0];
}
```

## 🔄 Express.js Routes

### דוגמאות נתיבים
```javascript
const express = require('express');
const router = express.Router();

// GET /api/budget-years/:id/summary
router.get('/budget-years/:id/summary', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // מתוך middleware אימות
    
    const summary = await getBudgetYearSummary(userId, id);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/expenses
router.post('/expenses', async (req, res) => {
  try {
    const userId = req.user.id;
    const expense = await addExpense(userId, req.body);
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/expenses
router.get('/expenses', async (req, res) => {
  try {
    const userId = req.user.id;
    const { budgetYearId, categoryId, fundId, page = 1, limit = 10 } = req.query;
    
    const offset = (page - 1) * limit;
    const filters = { 
      categoryId, 
      fundId, 
      limit: parseInt(limit), 
      offset: parseInt(offset) 
    };
    
    const expenses = await getExpenses(userId, budgetYearId, filters);
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

## 🛡️ אבטחה ואימות

### Middleware לאימות
```javascript
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

module.exports = { authenticateToken };
```

### הצפנת סיסמאות
```javascript
const bcrypt = require('bcrypt');

async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}
```

המסד והAPI מוכנים לשימוש מלא! 🚀