export const DATABASE_SCHEMA = `
-- Enable foreign key support
PRAGMA foreign_key_checks = ON;

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    icon TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Budgets table
CREATE TABLE IF NOT EXISTS budgets (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    icon TEXT NOT NULL,
    limit_amount DECIMAL(10, 2) NOT NULL,
    spent DECIMAL(10, 2) NOT NULL DEFAULT 0,
    budgeted BOOLEAN NOT NULL DEFAULT 1,
    category TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    amount DECIMAL(10, 2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    category TEXT NOT NULL,
    account TEXT,
    note TEXT,
    date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category) REFERENCES categories(id)
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
`;

export const INITIAL_DATA = `
-- Insert initial categories
INSERT OR IGNORE INTO categories (id, title, icon, type) VALUES
    ('salary', 'Salary', 'money-check-alt', 'INCOME'),
    ('freelancing', 'Freelancing', 'laptop-code', 'INCOME'),
    ('grocery', 'Grocery', 'shopping-basket', 'EXPENSE'),
    ('entertainment', 'Entertainment', 'film', 'EXPENSE');

-- Insert initial budgets
INSERT OR IGNORE INTO budgets (id, title, icon, limit_amount, spent, budgeted, category) VALUES
    ('food', 'Food & Grocery', 'shopping-basket', 5000, 5000, 1, 'essential'),
    ('bills', 'Bills', 'file-invoice-dollar', 3000, 3000, 1, 'essential'),
    ('car', 'Car', 'car', 2000, 1800, 1, 'transport'),
    ('clothing', 'Clothing', 'tshirt', 1500, 1200, 1, 'personal'),
    ('education', 'Education', 'graduation-cap', 4000, 3800, 1, 'personal');

-- Insert initial settings
INSERT OR IGNORE INTO settings (key, value) VALUES
    ('theme', 'light'),
    ('language', 'en'),
    ('has_launched', 'false');
`;