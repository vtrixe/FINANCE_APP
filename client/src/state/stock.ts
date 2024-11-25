import axios from "axios";

export interface StockData {
    symbol: string;
    price: number;
    timestamp: string;
    error: string | null;
    cached?: boolean;
}

export interface TradeResponse {
    symbol: string;
    price: number;
    tradeSignal: string;
    timestamp: string;
    cached?: boolean;
    error?: string;
}

const BASE_URL = 'https://server3-smt4.onrender.com';

export async function fetchStock(symbol: string): Promise<StockData> {
    try {
        const response = await axios.get<StockData>(`${BASE_URL}/stock/${symbol}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.data) {
            return {
                symbol,
                price: 0,
                timestamp: new Date().toISOString(),
                error: error.response.data.message || 'Failed to fetch stock data'
            };
        }
        return {
            symbol,
            price: 0,
            timestamp: new Date().toISOString(),
            error: 'Network error occurred'
        };
    }
}

export async function executeTrade(symbol: string, strategy: string): Promise<TradeResponse> {
    try {
        const response = await axios.post<TradeResponse>(`${BASE_URL}/trade`, { symbol, strategy });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.data) {
            throw new Error(error.response.data.message || 'Failed to execute trade');
        }
        throw new Error('Network error occurred');
    }
}