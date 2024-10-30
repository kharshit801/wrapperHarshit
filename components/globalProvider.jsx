import React, { createContext, useReducer, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'APP_STATE';

const initialState = {
    transactions: [],
    summary: {
        expense: 0,
        income: 0,
        total: 0
    }
};

const globalReducer = (state, action) => {
    let newState;
    
    switch (action.type) {
        case 'ADD_TRANSACTION':
            const updatedTransactions = [action.payload, ...state.transactions];
            const expense = updatedTransactions
                .filter(t => t.type === 'EXPENSE')
                .reduce((sum, t) => sum + t.amount, 0);
            const income = updatedTransactions
                .filter(t => t.type === 'INCOME')
                .reduce((sum, t) => sum + t.amount, 0);

            newState = {
                transactions: updatedTransactions,
                summary: {
                    expense,
                    income,
                    total: income - expense
                }
            };
            return newState;
        
        case 'CLEAR_TRANSACTIONS':
            newState = { 
                ...state, 
                transactions: [], 
                summary: initialState.summary 
            };
            return newState;
            
        case 'LOAD_STATE':
            return action.payload || initialState;
        
        default:
            return state;
    }
};

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
    const [state, dispatch] = useReducer(globalReducer, initialState);

    useEffect(() => {
        loadSavedState();
    }, []);

    useEffect(() => {
        saveState(state);
    }, [state]);

    const loadSavedState = async () => {
        try {
            const savedState = await AsyncStorage.getItem(STORAGE_KEY);
            if (savedState) {
                dispatch({ 
                    type: 'LOAD_STATE', 
                    payload: JSON.parse(savedState)
                });
            }
        } catch (error) {
            console.error('Error loading saved state:', error);
        }
    };

    const saveState = async (stateToSave) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        } catch (error) {
            console.error('Error saving state:', error);
        }
    };

    const onSave = ({ amount, type, category, account, note, date }) => {
        const transactionData = {
            id: Date.now(),
            amount: parseFloat(amount),
            type,
            category,
            account,
            note,
            date: date || new Date().toISOString()
        };

        dispatch({
            type: 'ADD_TRANSACTION',
            payload: transactionData
        });
    };

    return (
        <GlobalContext.Provider value={{ state, dispatch, onSave }}>
            {children}
        </GlobalContext.Provider>
    );
};

// Hook 
export const useGlobalContext = () => {
    const context = useContext(GlobalContext);
    if (!context) {
        throw new Error("useGlobalContext must be used within a GlobalProvider");
    }
    return context;
};