import React, { useState, useEffect, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { 
  Paper, 
  TextField, 
  Typography, 
  Box, 
  CircularProgress,
  IconButton,
  InputAdornment,
  Alert,
  Skeleton,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import { fetchStock  , StockData } from '@/state/stock';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

interface ChartDataPoint {
  price: number;
  time: string;
}

const StockChart = () => {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [symbol, setSymbol] = useState('AAPL');
  const [inputSymbol, setInputSymbol] = useState('AAPL');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');

  const fetchAndUpdateData = useCallback(async (isInitialLoad = false) => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await fetchStock(symbol);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setIsCached(!!response.cached);
      setLastUpdateTime(new Date().toLocaleTimeString());
      
      setData(prev => {
        const newPoint = {
          price: response.price,
          time: new Date(response.timestamp).toLocaleTimeString()
        };
        
        // If symbol changed or initial load, start fresh
        if (isInitialLoad || (prev.length > 0 && symbol !== inputSymbol)) {
          return [newPoint];
        }
        
        // Keep last 20 points
        const newData = [...prev, newPoint].slice(-20);
        return newData;
      });
      
      setError('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stock data';
      setError(errorMessage);
      if (!data.length) {
        setData([]); // Only clear data if we don't have any
      }
    } finally {
      setLoading(false);
    }
  }, [symbol, loading, inputSymbol, data.length]);

  // Initial fetch and interval setup
  useEffect(() => {
    fetchAndUpdateData(true);
    const interval = setInterval(() => fetchAndUpdateData(false), 60000);
    
    return () => clearInterval(interval);
  }, [fetchAndUpdateData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputSymbol.trim() !== symbol) {
      setSymbol(inputSymbol.trim().toUpperCase());
      setData([]); // Clear previous data when symbol changes
    }
  };

  const handleRefresh = () => {
    fetchAndUpdateData(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const chartData = {
    labels: data.map(item => item.time),
    datasets: [
      {
        label: `${symbol} Price`,
        data: data.map(item => item.price),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        fill: true,
        tension: 0.4
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${symbol} Stock Price`,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: (context: any) => {
            return `$${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value: string | number) {
            return `$${Number(value).toFixed(2)}`;
          },
        },
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    animation: {
      duration: 750,
    },
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3,
        width: '100%',
        maxWidth: 1200,
        margin: 'auto',
        position: 'relative',
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3 
      }}>
        <Typography variant="h5">
          Stock Price Chart
        </Typography>
        {lastUpdateTime && (
          <Typography variant="caption" color="text.secondary">
            Last updated: {lastUpdateTime}
          </Typography>
        )}
      </Box>
      
      <Box 
        component="form" 
        onSubmit={handleSubmit}
        sx={{ 
          mb: 3,
          display: 'flex',
          gap: 2,
          alignItems: 'center'
        }}
      >
        <TextField
          value={inputSymbol}
          onChange={(e) => setInputSymbol(e.target.value.toUpperCase())}
          onKeyPress={handleKeyPress}
          placeholder="Enter stock symbol"
          label="Stock Symbol"
          variant="outlined"
          size="small"
          disabled={loading}
          error={!!error}
          sx={{ maxWidth: 200 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton 
                  edge="end"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="outlined"
          onClick={handleRefresh}
          disabled={loading}
          startIcon={<RefreshIcon />}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isCached && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Showing cached data. Real-time updates will resume when available.
        </Alert>
      )}

      <Box sx={{ 
        height: 400,
        position: 'relative',
        backgroundColor: 'white'
      }}>
        {loading && data.length === 0 ? (
          <Box sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.8)'
          }}>
            <CircularProgress />
          </Box>
        ) : data.length === 0 ? (
          <Box sx={{
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Typography color="text.secondary">
              No data available for {symbol}
            </Typography>
          </Box>
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}
      </Box>

      {loading && data.length > 0 && (
        <Box sx={{ 
          position: 'absolute', 
          top: 16, 
          right: 16, 
          backgroundColor: 'white',
          borderRadius: '50%'
        }}>
          <CircularProgress size={24} />
        </Box>
      )}
    </Paper>
  );
};

export default StockChart;