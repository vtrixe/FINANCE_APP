import { useState } from 'react';
import { fetchStock, executeTrade } from '@/state/stock';
import { StockData } from '@/state/stock';

function StockManager() {
    const [symbol, setSymbol] = useState<string>('');
    const [stockInfo, setStockInfo] = useState<StockData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFetchStock = async () => {
        if (!symbol) {
            setError('Please enter a stock symbol');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const data = await fetchStock(symbol);
            setStockInfo(data);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to fetch stock data');
            setStockInfo(null);
        } finally {
            setLoading(false);
        }
    };

    const handleExecuteTrade = async (strategy: string) => {
        if (!symbol) {
            setError('Please enter a stock symbol');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const data = await executeTrade(symbol, strategy);
            alert(`Trade executed: ${data.tradeSignal} at $${data.price}`);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to execute trade');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Stock Manager</h2>
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    placeholder="Enter stock symbol (e.g., AAPL)"
                    className="flex-1 px-4 py-2 border rounded"
                    disabled={loading}
                />
                <button
                    onClick={handleFetchStock}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                >
                    {loading ? 'Loading...' : 'Fetch Stock'}
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}

            {stockInfo && (
                <div className="bg-gray-50 p-4 rounded">
                    <p className="text-lg mb-3">
                        <span className="font-bold">{stockInfo.symbol}:</span>
                        <span className="text-green-600 ml-2">${stockInfo.price.toFixed(2)}</span>
                        <span className="text-gray-500 text-sm ml-2">
                            (as of {new Date(stockInfo.timestamp).toLocaleTimeString()})
                        </span>
                    </p>
                    <button
                        onClick={() => handleExecuteTrade('simple')}
                        disabled={loading}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
                    >
                        Execute Trade
                    </button>
                </div>
            )}
        </div>
    );
}

export default StockManager;