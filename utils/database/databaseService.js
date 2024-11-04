import * as SQLite from 'expo-sqlite';
import { DATABASE_SCHEMA, INITIAL_DATA } from './schema';
import { Platform } from 'react-native';

class DatabaseService {
    constructor() {
        this.db = null;
    }

    async init() {
        if (this.db) return;

        if (Platform.OS === 'web') {
            // handle web platform 
            console.warn('SQLite is not supported on web platform');
            return;
        }

        this.db = SQLite.openDatabase('financeapp.db');
        
        try {
            await this.executeSql(DATABASE_SCHEMA);
            await this.executeSql(INITIAL_DATA);
        } catch (error) {
            console.error('Database initialization error:', error);
        }
    }

    async executeSql(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.transaction(tx => {
                tx.executeSql(
                    sql, 
                    params,
                    (_, result) => resolve(result),
                    (_, error) => reject(error)
                );
            });
        });
    }

    // transaction methods
    async addTransaction(transaction) {
        const { id, amount, type, category, account, note, date } = transaction;
        return this.executeSql(
            `INSERT INTO transactions (id, amount, type, category, account, note, date)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, amount, type, category, account, note, date]
        );
    }

    async getTransactions(month) {
        const result = await this.executeSql(
            `SELECT * FROM transactions 
             WHERE strftime('%Y-%m', date) = strftime('%Y-%m', ?)
             ORDER BY date DESC`,
            [month]
        );
        return result.rows._array;
    }

    // budget methods
    async getBudgets() {
        const result = await this.executeSql('SELECT * FROM budgets');
        return result.rows._array;
    }

    async updateBudget(budget) {
        const { id, limit_amount, spent } = budget;
        return this.executeSql(
            `UPDATE budgets 
             SET limit_amount = ?, spent = ?
             WHERE id = ?`,
            [limit_amount, spent, id]
        );
    }

    // category methods
    async getCategories() {
        const result = await this.executeSql('SELECT * FROM categories');
        return result.rows._array;
    }

    async addCategory(category) {
        const { id, title, icon, type } = category;
        return this.executeSql(
            `INSERT INTO categories (id, title, icon, type)
             VALUES (?, ?, ?, ?)`,
            [id, title, icon, type]
        );
    }

    // settings methods
    async getSetting(key) {
        const result = await this.executeSql(
            'SELECT value FROM settings WHERE key = ?',
            [key]
        );
        return result.rows.length > 0 ? result.rows.item(0).value : null;
    }

    async setSetting(key, value) {
        return this.executeSql(
            `INSERT OR REPLACE INTO settings (key, value)
             VALUES (?, ?)`,
            [key, value.toString()]
        );
    }

    // summary methods
    async getMonthSummary(month) {
        const result = await this.executeSql(
            `SELECT 
                SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) as expense,
                SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) as income
             FROM transactions
             WHERE strftime('%Y-%m', date) = strftime('%Y-%m', ?)`,
            [month]
        );
        
        const summary = result.rows.item(0);
        return {
            expense: summary.expense || 0,
            income: summary.income || 0,
            total: (summary.income || 0) - (summary.expense || 0)
        };
    }
}

export const databaseService = new DatabaseService();