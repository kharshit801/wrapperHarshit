import AsyncStorage from '@react-native-async-storage/async-storage';

const EXCHANGE_RATES_KEY = 'EXCHANGE_RATES';
const DEFAULT_CURRENCY_KEY = 'DEFAULT_CURRENCY';
const API_KEY = '01a7198d837ea3c1fea54677';

export const currencies = {
    USD: { symbol: '$', name: 'US Dollar', locale: 'en-US' },
    EUR: { symbol: '€', name: 'Euro', locale: 'de-DE' },
    GBP: { symbol: '£', name: 'British Pound', locale: 'en-GB' },
    JPY: { symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
    INR: { symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
    CNY: { symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
    AUD: { symbol: '$', name: 'Australian Dollar', locale: 'en-AU' },
    CAD: { symbol: '$', name: 'Canadian Dollar', locale: 'en-CA' },
};

export const formatCurrency = (amount, currencyCode) => {
    const currency = currencies[currencyCode];
    if (!currency) return `${amount}`;

    try {
        return new Intl.NumberFormat(currency.locale, {
            style: 'currency',
            currency: currencyCode,
        }).format(amount);
    } catch (error) {
        return `${currency.symbol}${amount}`;
    }
};

export const fetchExchangeRates = async () => {
    try {
        const response = await fetch(
            `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`
        );
        const data = await response.json();
        
        if (data.result === 'error') {
            throw new Error(data['error-type']);
        }
        
        const formattedRates = {};
        Object.keys(data.conversion_rates).forEach(toCurrency => {
            Object.keys(data.conversion_rates).forEach(fromCurrency => {
                const key = `${fromCurrency}_${toCurrency}`;
                formattedRates[key] = data.conversion_rates[toCurrency] / data.conversion_rates[fromCurrency];
            });
        });

        await AsyncStorage.setItem(EXCHANGE_RATES_KEY, JSON.stringify({
            rates: formattedRates,
            timestamp: new Date().toISOString()
        }));

        return formattedRates;
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        return null;
    }
};

export const loadExchangeRates = async () => {
    try {
        const savedRates = await AsyncStorage.getItem(EXCHANGE_RATES_KEY);
        if (savedRates) {
            const { rates, timestamp } = JSON.parse(savedRates);
            const lastUpdate = new Date(timestamp);
            const now = new Date();
            
            // Update rates if they're more than 24 hours old
            if (now - lastUpdate > 24 * 60 * 60 * 1000) {
                return await fetchExchangeRates();
            }
            return rates;
        }
        return await fetchExchangeRates();
    } catch (error) {
        console.error('Error loading exchange rates:', error);
        return null;
    }
};

export const convertAmount = (amount, fromCurrency, toCurrency, exchangeRates) => {
    if (fromCurrency === toCurrency) return amount;
    const rate = exchangeRates[`${fromCurrency}_${toCurrency}`] || 1;
    return amount * rate;
};

export const getDefaultCurrency = async () => {
    try {
        const currency = await AsyncStorage.getItem(DEFAULT_CURRENCY_KEY);
        return currency || 'USD';
    } catch (error) {
        console.error('Error getting default currency:', error);
        return 'USD';
    }
};

export const setDefaultCurrency = async (currency) => {
    try {
        await AsyncStorage.setItem(DEFAULT_CURRENCY_KEY, currency);
        return true;
    } catch (error) {
        console.error('Error setting default currency:', error);
        return false;
    }
};