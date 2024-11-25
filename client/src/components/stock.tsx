// stock.tsx
import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface StockData {
    symbol: string;
    price: number;
    timestamp: number;
    cached?: boolean;
}

function RealTimeStockUpdates() {
    const [stocks, setStocks] = useState<StockData[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;

    const connect = useCallback(() => {
        if (socketRef.current?.connected) return;

        try {
            socketRef.current = io('http://localhost:9000', {
                reconnection: true,
                reconnectionAttempts: maxReconnectAttempts,
                reconnectionDelay: 1000,
                timeout: 10000,
                transports: ['websocket', 'polling'],
                withCredentials: true
            });

            socketRef.current.on('connect', () => {
                console.log('Connected to server with ID:', socketRef.current?.id);
                setIsConnected(true);
                setError(null);
                reconnectAttempts.current = 0;
            });

            socketRef.current.on('connect_error', (err) => {
                console.log('Connection error:', err);
                setError(`Connection error: ${err.message}`);
                setIsConnected(false);
                
                reconnectAttempts.current += 1;
                if (reconnectAttempts.current >= maxReconnectAttempts) {
                    if (socketRef.current) {
                        socketRef.current.close();
                        socketRef.current = null;
                    }
                    setError('Maximum reconnection attempts reached. Please refresh the page.');
                }
            });

            socketRef.current.on('stockUpdate', (data: StockData) => {
                console.log('Received stock update:', data);
                setStocks((prev) => {
                    const newStocks = [...prev, data].slice(-10);
                    return newStocks;
                });
            });

            socketRef.current.on('stockError', (error) => {
                console.log('Stock error:', error);
                setError(`Stock error: ${error.message}`);
            });

            socketRef.current.on('disconnect', (reason) => {
                console.log('Disconnected from server. Reason:', reason);
                setIsConnected(false);
            });

            // Ping to keep connection alive
            const pingInterval = setInterval(() => {
                if (socketRef.current?.connected) {
                    socketRef.current.emit('ping');
                }
            }, 25000);

            return () => {
                clearInterval(pingInterval);
            };
        } catch (err) {
            console.error('Socket initialization error:', err);
            setError('Failed to initialize socket connection');
        }
    }, []);

    useEffect(() => {
        connect();

        return () => {
            if (socketRef.current) {
                console.log('Cleaning up socket connection');
                socketRef.current.removeAllListeners();
                socketRef.current.close();
                socketRef.current = null;
            }
        };
    }, [connect]);

    const handleManualReconnect = () => {
        if (socketRef.current) {
            socketRef.current.removeAllListeners();
            socketRef.current.close();
            socketRef.current = null;
        }
        reconnectAttempts.current = 0;
        connect();
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Real-Time Stock Updates</h2>
            
            <div className="mb-4">
                <span className={`inline-block px-3 py-1 rounded-full ${
                    isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                </span>
                {!isConnected && (
                    <button
                        onClick={handleManualReconnect}
                        className="ml-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Reconnect
                    </button>
                )}
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                    {error}
                    <button
                        onClick={() => setError(null)}
                        className="ml-2 text-sm text-red-500 hover:text-red-700"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            <div className="space-y-2">
                {stocks.map((stock, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded">
                        <p className="text-lg">
                            <span className="font-bold">{stock.symbol}:</span>
                            <span className="text-green-600 ml-2">
                                ${stock.price.toFixed(2)}
                            </span>
                            <span className="text-gray-500 text-sm ml-2">
                                {new Date(stock.timestamp).toLocaleTimeString()}
                            </span>
                            {stock.cached && (
                                <span className="text-yellow-600 text-sm ml-2">(Cached)</span>
                            )}
                        </p>
                    </div>
                ))}
                {stocks.length === 0 && isConnected && (
                    <p className="text-gray-500">Waiting for updates...</p>
                )}
            </div>
        </div>
    );
}

export default RealTimeStockUpdates;