-- Migration 001: Initial Schema
-- תאריך: 2024-01-01
-- תיאור: יצירת מבנה בסיסי למערכת תקציב משפחתי

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- טבלת משתמשים
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- טבלת שנות תקציב
CREATE TABLE budget_years (
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
CREATE TABLE funds (
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

-- יצירת אינדקסים בסיסיים
CREATE INDEX idx_budget_years_user_id ON budget_years(user_id);
CREATE INDEX idx_budget_years_dates ON budget_years(start_date, end_date);
CREATE INDEX idx_funds_user_id ON funds(user_id);
CREATE INDEX idx_funds_type ON funds(type);