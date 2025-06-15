-- ===================================
-- תכנון מסד נתונים למערכת תקציב משפחתי
-- ===================================

-- טבלת משתמשים (למערכת רב-משתמשים עתידית)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- טבלת שנות תקציב
CREATE TABLE budget_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- פורמט: mm/yy - mm/yy
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- אילוצים
    CONSTRAINT valid_date_range CHECK (end_date > start_date),
    CONSTRAINT unique_active_year_per_user UNIQUE (user_id, is_active) DEFERRABLE INITIALLY DEFERRED
);

-- אינדקסים לשנות תקציב
CREATE INDEX idx_budget_years_user_id ON budget_years(user_id);
CREATE INDEX idx_budget_years_dates ON budget_years(start_date, end_date);
CREATE INDEX idx_budget_years_active ON budget_years(user_id, is_active) WHERE is_active = TRUE;

-- טבלת קופות (הגדרות בסיס)
CREATE TABLE funds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- אינדקסים לקופות
CREATE INDEX idx_funds_user_id ON funds(user_id);
CREATE INDEX idx_funds_type ON funds(type);
CREATE INDEX idx_funds_level ON funds(level);

-- טבלת תקציבי קופות לכל שנת תקציב
CREATE TABLE fund_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fund_id UUID NOT NULL REFERENCES funds(id) ON DELETE CASCADE,
    budget_year_id UUID NOT NULL REFERENCES budget_years(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    amount_given DECIMAL(12,2) DEFAULT 0, -- לקופות חודשיות
    spent DECIMAL(12,2) DEFAULT 0, -- לקופות שנתיות
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- אילוצים
    CONSTRAINT positive_amount CHECK (amount >= 0),
    CONSTRAINT positive_amount_given CHECK (amount_given >= 0),
    CONSTRAINT positive_spent CHECK (spent >= 0),
    UNIQUE(fund_id, budget_year_id)
);

-- אינדקסים לתקציבי קופות
CREATE INDEX idx_fund_budgets_fund_id ON fund_budgets(fund_id);
CREATE INDEX idx_fund_budgets_budget_year_id ON fund_budgets(budget_year_id);

-- טבלת קטגוריות
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    fund_id UUID NOT NULL REFERENCES funds(id) ON DELETE CASCADE,
    color_class VARCHAR(100), -- לצבעי Tailwind
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, name)
);

-- אינדקסים לקטגוריות
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_fund_id ON categories(fund_id);

-- טבלת הכנסות
CREATE TABLE incomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    budget_year_id UUID NOT NULL REFERENCES budget_years(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    source VARCHAR(255), -- מקור ההכנסה
    date DATE NOT NULL,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- אילוצים
    CONSTRAINT positive_income_amount CHECK (amount > 0)
);

-- אינדקסים להכנסות
CREATE INDEX idx_incomes_user_id ON incomes(user_id);
CREATE INDEX idx_incomes_budget_year_id ON incomes(budget_year_id);
CREATE INDEX idx_incomes_date ON incomes(date);
CREATE INDEX idx_incomes_source ON incomes(source);
CREATE INDEX idx_incomes_month_year ON incomes(month, year);

-- טבלת הוצאות
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    
    -- אילוצים
    CONSTRAINT positive_expense_amount CHECK (amount > 0)
);

-- אינדקסים להוצאות
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_budget_year_id ON expenses(budget_year_id);
CREATE INDEX idx_expenses_category_id ON expenses(category_id);
CREATE INDEX idx_expenses_fund_id ON expenses(fund_id);
CREATE INDEX idx_expenses_date ON expenses(date);

-- טבלת מעשרות שניתנו
CREATE TABLE tithe_given (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    date DATE NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- אילוצים
    CONSTRAINT positive_tithe_amount CHECK (amount > 0)
);

-- אינדקסים למעשרות
CREATE INDEX idx_tithe_given_user_id ON tithe_given(user_id);
CREATE INDEX idx_tithe_given_date ON tithe_given(date);

-- טבלת חובות
CREATE TABLE debts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('owed_to_me', 'i_owe')),
    note TEXT,
    is_paid BOOLEAN DEFAULT FALSE,
    paid_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- אילוצים
    CONSTRAINT positive_debt_amount CHECK (amount > 0)
);

-- אינדקסים לחובות
CREATE INDEX idx_debts_user_id ON debts(user_id);
CREATE INDEX idx_debts_type ON debts(type);
CREATE INDEX idx_debts_is_paid ON debts(is_paid);

-- טבלת משימות
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    important BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- אינדקסים למשימות
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_important ON tasks(important);

-- טבלת תמונות מצב נכסים
CREATE TABLE asset_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- טבלת פירוט נכסים
CREATE TABLE asset_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_id UUID NOT NULL REFERENCES asset_snapshots(id) ON DELETE CASCADE,
    asset_type VARCHAR(100) NOT NULL, -- compensation, pension_naomi, etc.
    asset_name VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('asset', 'liability')),
    
    UNIQUE(snapshot_id, asset_type)
);

-- אינדקסים לנכסים
CREATE INDEX idx_asset_snapshots_user_id ON asset_snapshots(user_id);
CREATE INDEX idx_asset_snapshots_date ON asset_snapshots(date);
CREATE INDEX idx_asset_details_snapshot_id ON asset_details(snapshot_id);
CREATE INDEX idx_asset_details_category ON asset_details(category);

-- טבלת הגדרות מערכת
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT NOT NULL,
    data_type VARCHAR(20) DEFAULT 'string' CHECK (data_type IN ('string', 'number', 'boolean', 'json')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, setting_key)
);

-- אינדקסים להגדרות
CREATE INDEX idx_system_settings_user_id ON system_settings(user_id);
CREATE INDEX idx_system_settings_key ON system_settings(setting_key);

-- ===================================
-- TRIGGERS לעדכון אוטומטי של updated_at
-- ===================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- יצירת triggers לכל הטבלאות
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budget_years_updated_at BEFORE UPDATE ON budget_years FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_funds_updated_at BEFORE UPDATE ON funds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fund_budgets_updated_at BEFORE UPDATE ON fund_budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_incomes_updated_at BEFORE UPDATE ON incomes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tithe_given_updated_at BEFORE UPDATE ON tithe_given FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_debts_updated_at BEFORE UPDATE ON debts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_asset_snapshots_updated_at BEFORE UPDATE ON asset_snapshots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- FUNCTIONS עזר לחישובים
-- ===================================

-- פונקציה לחישוב סה"כ הכנסות לשנת תקציב
CREATE OR REPLACE FUNCTION get_total_income_for_budget_year(
    p_user_id UUID,
    p_budget_year_id UUID
) RETURNS DECIMAL(12,2) AS $$
BEGIN
    RETURN COALESCE(
        (SELECT SUM(amount) 
         FROM incomes 
         WHERE user_id = p_user_id 
         AND budget_year_id = p_budget_year_id), 
        0
    );
END;
$$ LANGUAGE plpgsql;

-- פונקציה לחישוב סה"כ הוצאות לשנת תקציב
CREATE OR REPLACE FUNCTION get_total_expenses_for_budget_year(
    p_user_id UUID,
    p_budget_year_id UUID
) RETURNS DECIMAL(12,2) AS $$
BEGIN
    RETURN COALESCE(
        (SELECT SUM(amount) 
         FROM expenses 
         WHERE user_id = p_user_id 
         AND budget_year_id = p_budget_year_id), 
        0
    );
END;
$$ LANGUAGE plpgsql;

-- פונקציה לחישוב סה"כ תקציב לשנת תקציב
CREATE OR REPLACE FUNCTION get_total_budget_for_budget_year(
    p_user_id UUID,
    p_budget_year_id UUID
) RETURNS DECIMAL(12,2) AS $$
DECLARE
    total_budget DECIMAL(12,2) := 0;
    fund_record RECORD;
    budget_months INTEGER;
BEGIN
    -- חישוב מספר החודשים בשנת התקציב
    SELECT EXTRACT(YEAR FROM age(end_date, start_date)) * 12 + 
           EXTRACT(MONTH FROM age(end_date, start_date)) + 1
    INTO budget_months
    FROM budget_years 
    WHERE id = p_budget_year_id;
    
    -- חישוב סה"כ תקציב
    FOR fund_record IN 
        SELECT f.type, fb.amount
        FROM fund_budgets fb
        JOIN funds f ON f.id = fb.fund_id
        WHERE fb.budget_year_id = p_budget_year_id
        AND f.user_id = p_user_id
        AND f.include_in_budget = TRUE
    LOOP
        IF fund_record.type = 'monthly' THEN
            total_budget := total_budget + (fund_record.amount * budget_months);
        ELSE
            total_budget := total_budget + fund_record.amount;
        END IF;
    END LOOP;
    
    RETURN total_budget;
END;
$$ LANGUAGE plpgsql;

-- פונקציה לחישוב סה"כ מעשרות שניתנו
CREATE OR REPLACE FUNCTION get_total_tithe_given(
    p_user_id UUID
) RETURNS DECIMAL(12,2) AS $$
BEGIN
    RETURN COALESCE(
        (SELECT SUM(amount) 
         FROM tithe_given 
         WHERE user_id = p_user_id), 
        0
    );
END;
$$ LANGUAGE plpgsql;

-- פונקציה לחישוב סה"כ הכנסות לצורך מעשרות (מכל השנים)
CREATE OR REPLACE FUNCTION get_total_income_for_tithe(
    p_user_id UUID
) RETURNS DECIMAL(12,2) AS $$
BEGIN
    RETURN COALESCE(
        (SELECT SUM(amount) 
         FROM incomes 
         WHERE user_id = p_user_id), 
        0
    );
END;
$$ LANGUAGE plpgsql;

-- ===================================
-- VIEWS לדוחות ותצוגות מורכבות
-- ===================================

-- תצוגה לסיכום שנת תקציב
CREATE VIEW budget_year_summary AS
SELECT 
    by.id as budget_year_id,
    by.user_id,
    by.name as budget_year_name,
    by.start_date,
    by.end_date,
    by.is_active,
    get_total_income_for_budget_year(by.user_id, by.id) as total_income,
    get_total_expenses_for_budget_year(by.user_id, by.id) as total_expenses,
    get_total_budget_for_budget_year(by.user_id, by.id) as total_budget,
    (get_total_income_for_budget_year(by.user_id, by.id) - 
     get_total_expenses_for_budget_year(by.user_id, by.id)) as balance
FROM budget_years by;

-- תצוגה לסיכום קופות לפי שנת תקציב
CREATE VIEW fund_summary AS
SELECT 
    f.id as fund_id,
    f.user_id,
    f.name as fund_name,
    f.type,
    f.level,
    fb.budget_year_id,
    fb.amount as budget_amount,
    fb.amount_given,
    fb.spent,
    CASE 
        WHEN f.type = 'monthly' THEN fb.amount - COALESCE(fb.amount_given, 0)
        ELSE fb.amount - COALESCE(fb.spent, 0)
    END as remaining_amount
FROM funds f
LEFT JOIN fund_budgets fb ON f.id = fb.fund_id
WHERE f.is_active = TRUE;

-- תצוגה לסיכום הוצאות לפי קטגוריה
CREATE VIEW expenses_by_category AS
SELECT 
    c.id as category_id,
    c.user_id,
    c.name as category_name,
    c.fund_id,
    f.name as fund_name,
    e.budget_year_id,
    COUNT(e.id) as expense_count,
    SUM(e.amount) as total_amount
FROM categories c
LEFT JOIN expenses e ON c.id = e.category_id
LEFT JOIN funds f ON c.fund_id = f.id
GROUP BY c.id, c.user_id, c.name, c.fund_id, f.name, e.budget_year_id;

-- ===================================
-- נתוני דמו ראשוניים
-- ===================================

-- הוספת משתמש דמו
INSERT INTO users (id, email, password_hash, first_name, last_name) 
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'demo@example.com',
    '$2b$10$dummy.hash.for.demo.user',
    'נעמי',
    'מסינג'
);

-- הוספת שנות תקציב דמו
INSERT INTO budget_years (id, user_id, name, start_date, end_date, is_active) VALUES
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '01/24 - 12/24', '2024-01-01', '2024-12-31', TRUE),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '01/23 - 12/23', '2023-01-01', '2023-12-31', FALSE);

-- הוספת קופות דמו
INSERT INTO funds (id, user_id, name, type, level, include_in_budget) VALUES
('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'קופת שוטף', 'monthly', 1, TRUE),
('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'תקציב שנתי', 'annual', 2, TRUE),
('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'תקציב מורחב', 'annual', 2, TRUE),
('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'בונוסים', 'savings', 3, FALSE),
('20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'עודפים', 'savings', 3, FALSE);

-- הוספת תקציבי קופות דמו
INSERT INTO fund_budgets (fund_id, budget_year_id, amount, amount_given, spent) VALUES
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 3000, 2500, NULL),
('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 50000, NULL, 20000),
('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 30000, NULL, 15000),
('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 12000, NULL, NULL),
('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 8500, NULL, NULL);

-- הוספת קטגוריות דמו
INSERT INTO categories (id, user_id, name, fund_id, color_class) VALUES
('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'מזון', '20000000-0000-0000-0000-000000000001', 'bg-green-100 text-green-800 border-green-300'),
('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'תחבורה', '20000000-0000-0000-0000-000000000001', 'bg-blue-100 text-blue-800 border-blue-300'),
('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'ביגוד', '20000000-0000-0000-0000-000000000002', 'bg-pink-100 text-pink-800 border-pink-300'),
('30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'דיור', '20000000-0000-0000-0000-000000000002', 'bg-gray-100 text-gray-800 border-gray-300'),
('30000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'נופש', '20000000-0000-0000-0000-000000000003', 'bg-teal-100 text-teal-800 border-teal-300');

-- הגדרות מערכת דמו
INSERT INTO system_settings (user_id, setting_key, setting_value, data_type) VALUES
('00000000-0000-0000-0000-000000000001', 'tithe_percentage', '10', 'number'),
('00000000-0000-0000-0000-000000000001', 'default_currency', 'ILS', 'string'),
('00000000-0000-0000-0000-000000000001', 'surplus_fund_id', '20000000-0000-0000-0000-000000000005', 'string');