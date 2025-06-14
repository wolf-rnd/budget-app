const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 מתחיל הרצת מיגרציות...');
    
    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Read migration files
    const migrationsDir = path.join(__dirname, '../migrations');
    
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
    }
    
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    if (migrationFiles.length === 0) {
      console.log('📝 יוצר מיגרציה ראשונית...');
      
      // Create initial migration
      const initialMigration = `
-- Initial migration: Create complete database schema
-- תאריך: ${new Date().toISOString().split('T')[0]}

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- טבלת משתמשים
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- טבלת שנות תקציב
CREATE TABLE IF NOT EXISTS budget_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_date_range CHECK (end_date > start_date)
);

-- טבלת קופות
CREATE TABLE IF NOT EXISTS funds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('monthly', 'annual', 'savings')),
    level INTEGER NOT NULL CHECK (level IN (1, 2, 3)),
    include_in_budget BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, name)
);

-- טבלת תקציבי קופות
CREATE TABLE IF NOT EXISTS fund_budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fund_id UUID NOT NULL REFERENCES funds(id) ON DELETE CASCADE,
    budget_year_id UUID NOT NULL REFERENCES budget_years(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    amount_given DECIMAL(12,2) DEFAULT 0,
    spent DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT positive_amount CHECK (amount >= 0),
    CONSTRAINT positive_amount_given CHECK (amount_given >= 0),
    CONSTRAINT positive_spent CHECK (spent >= 0),
    UNIQUE(fund_id, budget_year_id)
);

-- טבלת קטגוריות
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    fund_id UUID NOT NULL REFERENCES funds(id) ON DELETE CASCADE,
    color_class VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, name)
);

-- טבלת הכנסות
CREATE TABLE IF NOT EXISTS incomes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    budget_year_id UUID NOT NULL REFERENCES budget_years(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    source VARCHAR(255),
    date DATE NOT NULL,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT positive_income_amount CHECK (amount > 0)
);

-- טבלת הוצאות
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    budget_year_id UUID NOT NULL REFERENCES budget_years(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    fund_id UUID NOT NULL REFERENCES funds(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    date DATE NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT positive_expense_amount CHECK (amount > 0)
);

-- טבלת מעשרות
CREATE TABLE IF NOT EXISTS tithe_given (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    date DATE NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT positive_tithe_amount CHECK (amount > 0)
);

-- טבלת חובות
CREATE TABLE IF NOT EXISTS debts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('owed_to_me', 'i_owe')),
    note TEXT,
    is_paid BOOLEAN DEFAULT FALSE,
    paid_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT positive_debt_amount CHECK (amount > 0)
);

-- טבלת משימות
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    important BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- טבלת תמונות מצב נכסים
CREATE TABLE IF NOT EXISTS asset_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- טבלת פירוט נכסים
CREATE TABLE IF NOT EXISTS asset_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    snapshot_id UUID NOT NULL REFERENCES asset_snapshots(id) ON DELETE CASCADE,
    asset_type VARCHAR(100) NOT NULL,
    asset_name VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('asset', 'liability')),
    
    UNIQUE(snapshot_id, asset_type)
);

-- טבלת הגדרות מערכת
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT NOT NULL,
    data_type VARCHAR(20) DEFAULT 'string' CHECK (data_type IN ('string', 'number', 'boolean', 'json')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, setting_key)
);

-- יצירת אינדקסים
CREATE INDEX IF NOT EXISTS idx_budget_years_user_id ON budget_years(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_years_dates ON budget_years(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_funds_user_id ON funds(user_id);
CREATE INDEX IF NOT EXISTS idx_fund_budgets_fund_id ON fund_budgets(fund_id);
CREATE INDEX IF NOT EXISTS idx_fund_budgets_budget_year_id ON fund_budgets(budget_year_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_fund_id ON categories(fund_id);
CREATE INDEX IF NOT EXISTS idx_incomes_user_id ON incomes(user_id);
CREATE INDEX IF NOT EXISTS idx_incomes_budget_year_id ON incomes(budget_year_id);
CREATE INDEX IF NOT EXISTS idx_incomes_date ON incomes(date);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_budget_year_id ON expenses(budget_year_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_fund_id ON expenses(fund_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_tithe_given_user_id ON tithe_given(user_id);
CREATE INDEX IF NOT EXISTS idx_tithe_given_date ON tithe_given(date);
CREATE INDEX IF NOT EXISTS idx_debts_user_id ON debts(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_type ON debts(type);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_asset_snapshots_user_id ON asset_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_asset_snapshots_date ON asset_snapshots(date);
CREATE INDEX IF NOT EXISTS idx_asset_details_snapshot_id ON asset_details(snapshot_id);
CREATE INDEX IF NOT EXISTS idx_system_settings_user_id ON system_settings(user_id);

-- פונקציה לעדכון updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- יצירת triggers
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_budget_years_updated_at') THEN
        CREATE TRIGGER update_budget_years_updated_at BEFORE UPDATE ON budget_years FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_funds_updated_at') THEN
        CREATE TRIGGER update_funds_updated_at BEFORE UPDATE ON funds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_fund_budgets_updated_at') THEN
        CREATE TRIGGER update_fund_budgets_updated_at BEFORE UPDATE ON fund_budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_categories_updated_at') THEN
        CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_incomes_updated_at') THEN
        CREATE TRIGGER update_incomes_updated_at BEFORE UPDATE ON incomes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_expenses_updated_at') THEN
        CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_tithe_given_updated_at') THEN
        CREATE TRIGGER update_tithe_given_updated_at BEFORE UPDATE ON tithe_given FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_debts_updated_at') THEN
        CREATE TRIGGER update_debts_updated_at BEFORE UPDATE ON debts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_tasks_updated_at') THEN
        CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_asset_snapshots_updated_at') THEN
        CREATE TRIGGER update_asset_snapshots_updated_at BEFORE UPDATE ON asset_snapshots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_system_settings_updated_at') THEN
        CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;

-- הודעת סיום
SELECT 'מיגרציה ראשונית הושלמה בהצלחה!' as message;
      `;
      
      const initialFilename = '001_initial_schema.sql';
      fs.writeFileSync(path.join(migrationsDir, initialFilename), initialMigration);
      migrationFiles.push(initialFilename);
    }
    
    // Get executed migrations
    const executedResult = await client.query(
      'SELECT filename FROM migrations ORDER BY executed_at'
    );
    const executedMigrations = executedResult.rows.map(row => row.filename);
    
    // Run pending migrations
    for (const filename of migrationFiles) {
      if (!executedMigrations.includes(filename)) {
        console.log(`📄 מריץ מיגרציה: ${filename}`);
        
        const migrationPath = path.join(migrationsDir, filename);
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        try {
          await client.query('BEGIN');
          await client.query(migrationSQL);
          await client.query(
            'INSERT INTO migrations (filename) VALUES ($1)',
            [filename]
          );
          await client.query('COMMIT');
          
          console.log(`✅ מיגרציה ${filename} הושלמה בהצלחה`);
        } catch (error) {
          await client.query('ROLLBACK');
          console.error(`❌ שגיאה במיגרציה ${filename}:`, error.message);
          throw error;
        }
      } else {
        console.log(`⏭️  מיגרציה ${filename} כבר בוצעה`);
      }
    }
    
    console.log('🎉 כל המיגרציות הושלמו בהצלחה!');
    
  } catch (error) {
    console.error('❌ שגיאה בהרצת מיגרציות:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };