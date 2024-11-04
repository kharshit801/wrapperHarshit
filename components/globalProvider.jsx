import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { databaseService } from '../utils/database/databaseService';
import i18next from 'i18next';
import { format, parseISO, addMonths, subMonths } from 'date-fns';

const GlobalContext = createContext();

const initialState = {
    transactions: [],
    categories: [],
    budgets: [],
    summary: {
        expense: 0,
        income: 0,
        total: 0
    },
    currentMonth: new Date().toISOString(),
    language: null,
    theme: 'light',
    fontLoaded: false,
    hasLaunched: false,
    isLoading: true,
    error: null
};

const globalReducer = (state, action) => {
    switch (action.type) {
        case 'SET_LOADING':
            return {
                ...state,
                isLoading: action.payload,
                error: null
            };

        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload,
                isLoading: false
            };

        case 'LOAD_INITIAL_DATA':
            return {
                ...state,
                categories: action.payload.categories,
                budgets: action.payload.budgets,
                language: action.payload.language,
                theme: action.payload.theme,
                hasLaunched: action.payload.hasLaunched,
                isLoading: false
            };

        case 'SET_TRANSACTIONS':
            return {
                ...state,
                transactions: action.payload.transactions,
                summary: action.payload.summary,
                isLoading: false
            };

        case 'SET_FONT_LOADED':
            return {
                ...state,
                fontLoaded: action.payload
            };

        case 'SET_HAS_LAUNCHED':
            return {
                ...state,
                hasLaunched: action.payload
            };

        case 'SET_THEME':
            return {
                ...state,
                theme: action.payload
            };

        case 'SET_LANGUAGE':
            return {
                ...state,
                language: action.payload
            };

        case 'NEXT_MONTH':
            return {
                ...state,
                currentMonth: addMonths(new Date(state.currentMonth), 1).toISOString()
            };
            
        case 'PREVIOUS_MONTH':
            return {
                ...state,
                currentMonth: subMonths(new Date(state.currentMonth), 1).toISOString()
            };

        case 'SET_MONTH':
            return { 
                ...state, 
                currentMonth: new Date(action.payload).toISOString() 
            };

        default:
            return state;
    }
};

export const GlobalProvider = ({ children }) => {
    const [state, dispatch] = useReducer(globalReducer, initialState);

    // initialize app data
    useEffect(() => {
        initializeApp();
    }, []);

    // handle language 
    useEffect(() => {
        if (state.language) {
            i18next.changeLanguage(state.language);
            databaseService.setSetting('language', state.language)
                .catch(error => console.error('Error saving language:', error));
        }
    }, [state.language]);

    // Handle month changes
    useEffect(() => {
        if (!state.isLoading) {
            loadTransactionsForMonth(state.currentMonth);
        }
    }, [state.currentMonth]);

    const initializeApp = async () => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            await databaseService.init();
            
            // Load initial data
            const [
                categories,
                budgets,
                language,
                theme,
                hasLaunched
            ] = await Promise.all([
                databaseService.getCategories(),
                databaseService.getBudgets(),
                databaseService.getSetting('language'),
                databaseService.getSetting('theme'),
                databaseService.getSetting('has_launched')
            ]);

            dispatch({ 
                type: 'LOAD_INITIAL_DATA', 
                payload: {
                    categories,
                    budgets,
                    language: language || 'en',
                    theme: theme || 'light',
                    hasLaunched: hasLaunched === 'true'
                }
            });

            await loadTransactionsForMonth(state.currentMonth);
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            console.error('Error initializing app:', error);
        }
    };

    const loadTransactionsForMonth = async (month) => {
        try {
            const [transactions, summary] = await Promise.all([
                databaseService.getTransactions(month),
                databaseService.getMonthSummary(month)
            ]);
            
            dispatch({ 
                type: 'SET_TRANSACTIONS', 
                payload: { transactions, summary } 
            });
        } catch (error) {
            console.error('Error loading transactions:', error);
            dispatch({ type: 'SET_ERROR', payload: error.message });
        }
    };

    // Transaction management
    const onSave = async (transactionData) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            if (transactionData.id && transactionData.isUpdate) {
                await databaseService.updateTransaction({
                    ...transactionData,
                    amount: parseFloat(transactionData.amount),
                    date: transactionData.date ? new Date(transactionData.date).toISOString() : new Date().toISOString()
                });
            } else {
                await databaseService.addTransaction({
                    id: Date.now().toString(),
                    amount: parseFloat(transactionData.amount),
                    type: transactionData.type,
                    category: transactionData.category,
                    account: transactionData.account,
                    note: transactionData.note,
                    date: transactionData.date ? new Date(transactionData.date).toISOString() : new Date().toISOString()
                });
            }
            await loadTransactionsForMonth(state.currentMonth);
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            console.error('Error saving transaction:', error);
        }
    };

    // Budget management
    const updateBudget = async (budgetData) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            await databaseService.updateBudget(budgetData);
            const budgets = await databaseService.getBudgets();
            dispatch({ 
                type: 'LOAD_INITIAL_DATA', 
                payload: { ...state, budgets } 
            });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            console.error('Error updating budget:', error);
        }
    };

    const addBudget = async (budgetData) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            await databaseService.addBudget({
                id: Date.now().toString(),
                ...budgetData
            });
            const budgets = await databaseService.getBudgets();
            dispatch({ 
                type: 'LOAD_INITIAL_DATA', 
                payload: { ...state, budgets } 
            });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            console.error('Error adding budget:', error);
        }
    };

    const deleteBudget = async (budgetId) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            await databaseService.deleteBudget(budgetId);
            const budgets = await databaseService.getBudgets();
            dispatch({ 
                type: 'LOAD_INITIAL_DATA', 
                payload: { ...state, budgets } 
            });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            console.error('Error deleting budget:', error);
        }
    };

    // Settings management
    const changeLanguage = async (language) => {
        try {
            await databaseService.setSetting('language', language);
            dispatch({ type: 'SET_LANGUAGE', payload: language });
        } catch (error) {
            console.error('Error changing language:', error);
        }
    };

    const setTheme = async (theme) => {
        try {
            await databaseService.setSetting('theme', theme);
            dispatch({ type: 'SET_THEME', payload: theme });
        } catch (error) {
            console.error('Error setting theme:', error);
        }
    };

    const setFontLoaded = (loaded) => {
        dispatch({ type: 'SET_FONT_LOADED', payload: loaded });
    };

    const setHasLaunched = async (launched) => {
        try {
            await databaseService.setSetting('has_launched', launched.toString());
            dispatch({ type: 'SET_HAS_LAUNCHED', payload: launched });
        } catch (error) {
            console.error('Error setting has_launched:', error);
        }
    };

    // date formatting utility
    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), 'yyyy-MM-dd');
        } catch (error) {
            console.error('Error formatting date:', error);
            return format(new Date(), 'yyyy-MM-dd');
        }
    };

    return (
        <GlobalContext.Provider value={{ 
            state,
            dispatch,
            onSave,
            formatDate,
            changeLanguage,
            setTheme,
            setFontLoaded,
            setHasLaunched,
            updateBudget,
            addBudget,
            deleteBudget,
            // Loading and error states
            isLoading: state.isLoading,
            error: state.error
        }}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => {
    const context = useContext(GlobalContext);
    if (!context) {
        throw new Error("useGlobalContext must be used within a GlobalProvider");
    }
    return context;
};

export default GlobalProvider;