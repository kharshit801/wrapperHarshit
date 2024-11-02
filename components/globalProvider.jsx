import React, { createContext, useReducer, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, parseISO, addMonths, subMonths } from 'date-fns';
import i18next from 'i18next';

const STORAGE_KEY = 'APP_STATE';

const initialState = {
    transactions: [],
    categories: [
        { id: 'salary', title: 'Salary', icon: 'money-check-alt', type: 'INCOME' },
        { id: 'freelancing', title: 'Freelancing', icon: 'laptop-code', type: 'INCOME' },
        { id: 'grocery', title: 'Grocery', icon: 'shopping-basket', type: 'EXPENSE' },
        { id: 'entertainment', title: 'Entertainment', icon: 'film', type: 'EXPENSE' }
    ],
    summary: {
        expense: 0,
        income: 0,
        total: 0
    },
    currentMonth: new Date().toISOString(),
    language: null, // Initially null to signify it should be loaded from AsyncStorage
    theme: 'light',
    fontLoaded: false,
    hasLaunched: false
};


const globalReducer = (state, action) => {
    switch (action.type) {
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

        case 'ADD_TRANSACTION':
            const updatedTransactions = [...state.transactions, action.payload];
            const expense = updatedTransactions
                .filter(t => t.type === 'EXPENSE')
                .reduce((sum, t) => sum + t.amount, 0);
            const income = updatedTransactions
                .filter(t => t.type === 'INCOME')
                .reduce((sum, t) => sum + t.amount, 0);

            return {
                ...state,
                transactions: updatedTransactions,
                summary: {
                    expense,
                    income,
                    total: income - expense
                }
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
    
        case 'CLEAR_TRANSACTIONS':
            return { 
                ...state, 
                transactions: [], 
                summary: initialState.summary 
            };
        
        case 'LOAD_STATE':
            return action.payload || initialState;

        case 'SET_MONTH':
            return { 
                ...state, 
                currentMonth: new Date(action.payload).toISOString() 
            };

        case 'SET_LANGUAGE':
            return {
                ...state,
                language: action.payload
            };

        case 'DELETE_TRANSACTION':
            const filteredTransactions = state.transactions.filter(t => t.id !== action.payload);
            const newExpense = filteredTransactions
                .filter(t => t.type === 'EXPENSE')
                .reduce((sum, t) => sum + t.amount, 0);
            const newIncome = filteredTransactions
                .filter(t => t.type === 'INCOME')
                .reduce((sum, t) => sum + t.amount, 0);
            
            return {
                ...state,
                transactions: filteredTransactions,
                summary: {
                    expense: newExpense,
                    income: newIncome,
                    total: newIncome - newExpense
                }
            };

        case 'EDIT_TRANSACTION':
            const transactionIndex = state.transactions.findIndex(t => t.id === action.payload.id);
            if (transactionIndex >= 0) {
                const transactionsCopy = [...state.transactions];
                transactionsCopy[transactionIndex] = action.payload;
                
                const updatedExpense = transactionsCopy
                    .filter(t => t.type === 'EXPENSE')
                    .reduce((sum, t) => sum + t.amount, 0);
                const updatedIncome = transactionsCopy
                    .filter(t => t.type === 'INCOME')
                    .reduce((sum, t) => sum + t.amount, 0);

                return {
                    ...state,
                    transactions: transactionsCopy,
                    summary: {
                        expense: updatedExpense,
                        income: updatedIncome,
                        total: updatedIncome - updatedExpense
                    }
                };

            }
            return state;

            case 'ADD_CATEGORY':
            // Check if category already exists
            const categoryExists = state.categories.some(
                cat => cat.title.toLowerCase() === action.payload.title.toLowerCase()
            );
            if (categoryExists) {
                throw new Error('Category already exists');
            }
            return {
                ...state,
                categories: [...state.categories, action.payload]
            };

        case 'UPDATE_CATEGORY':
            return {
                ...state,
                categories: state.categories.map(category =>
                    category.id === action.payload.id ? action.payload : category
                )
            };

        case 'DELETE_CATEGORY':
            // Check if category has transactions
            const hasTransactions = state.transactions.some(
                t => t.category.toLowerCase() === action.payload.toLowerCase()
            );
            if (hasTransactions) {
                throw new Error('Category has existing transactions');
            }
            return {
                ...state,
                categories: state.categories.filter(
                    category => category.id !== action.payload
                )
            };
    

        default:
            return state;
    }
};

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
    const [state, dispatch] = useReducer(globalReducer, initialState);

    useEffect(() => {
        loadInitialState(); // Load entire state, including language, on mount
    }, []);

    useEffect(() => {
        saveState(state); // Save state changes to AsyncStorage
    }, [state]);

    useEffect(() => {
        if (state.language) {
            i18next.changeLanguage(state.language);
            console.log('Language set in i18next:', state.language);
        }
    }, [state.language]);

    const loadInitialState = async () => {
        try {
            const savedState = await AsyncStorage.getItem(STORAGE_KEY);
            if (savedState) {
                dispatch({ type: 'LOAD_STATE', payload: JSON.parse(savedState) });
            }

            // Load language specifically from AsyncStorage
            const savedLanguage = await AsyncStorage.getItem('APP_LANGUAGE');
            if (savedLanguage) {
                dispatch({ type: 'SET_LANGUAGE', payload: savedLanguage });
                console.log('Loaded saved language:', savedLanguage);
            } else {
                // Default language if none saved
                dispatch({ type: 'SET_LANGUAGE', payload: 'en' });
            }
        } catch (error) {
            console.error('Error loading initial state:', error);
        }
    };

    const saveState = async (stateToSave) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        } catch (error) {
            console.error('Error saving state:', error);
        }
    };

    const onSave = (transactionData) => {
        if (transactionData.id && transactionData.isUpdate) {
            dispatch({
                type: 'EDIT_TRANSACTION',
                payload: {
                    ...transactionData,
                    amount: parseFloat(transactionData.amount),
                    date: transactionData.date ? new Date(transactionData.date).toISOString() : new Date().toISOString()
                }
            });
        } else {
            dispatch({
                type: 'ADD_TRANSACTION',
                payload: {
                    id: Date.now(),
                    amount: parseFloat(transactionData.amount),
                    type: transactionData.type,
                    category: transactionData.category,
                    account: transactionData.account,
                    note: transactionData.note,
                    date: transactionData.date ? new Date(transactionData.date).toISOString() : new Date().toISOString()
                }
            });
        }
    };

    const changeLanguage = async (language) => {
        try {
            dispatch({
                type: 'SET_LANGUAGE',
                payload: language
            });
            await AsyncStorage.setItem('APP_LANGUAGE', language);
            console.log('Language changed and saved:', language);
        } catch (error) {
            console.error('Error changing language:', error);
        }
    };

    const setTheme = (theme) => {
        dispatch({
            type: 'SET_THEME',
            payload: theme
        });
    };

    const setFontLoaded = (loaded) => {
        dispatch({
            type: 'SET_FONT_LOADED',
            payload: loaded
        });
    };

    const setHasLaunched = (launched) => {
        dispatch({
            type: 'SET_HAS_LAUNCHED',
            payload: launched
        });
    };

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
            setHasLaunched
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
