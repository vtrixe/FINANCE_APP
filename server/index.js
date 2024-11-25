import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import { createServer } from 'http';
import { Server } from 'socket.io';
import axios from 'axios'; // Replace yahoo-finance with axios
import kpiRoutes from "./routes/kpi.js";
import productRoutes from "./routes/product.js";
import transactionRoutes from "./routes/transaction.js";
import KPI from "./models/KPI.js";
import Product from "./models/Product.js";
import Transaction from "./models/Transaction.js";
import { kpis, products, transactions } from "./data/data.js";

/* CONFIGURATIONS */
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

/* ROUTES */
app.use("/kpi", kpiRoutes);
app.use("/product", productRoutes);
app.use("/transaction", transactionRoutes);

// Create HTTP server
const httpServer = createServer(app);

// Create Socket.IO server
const io = new Server(httpServer, {
  cors: {
      origin: "http://localhost:5173", // or your frontend URL
      methods: ["GET", "POST"],
      credentials: true,
      transports: ['websocket', 'polling']
  },
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

// Update the connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Track intervals for cleanup
  const intervals = new Set();
  
  // Real-time stock updates with error handling and caching
  const stockInterval = setInterval(async () => {
      try {
          const stockData = await fetchStockData('AAPL');
          if (socket.connected) {  // Check if socket is still connected
              socket.emit('stockUpdate', stockData);
          }
      } catch (error) {
          if (socket.connected) {  // Check if socket is still connected
              socket.emit('stockError', {
                  symbol: 'AAPL',
                  error: error.message,
                  timestamp: new Date()
              });
          }
      }
  }, 60000);
  
  intervals.add(stockInterval);

  // Send initial stock data immediately upon connection
  fetchStockData('AAPL')
      .then(stockData => {
          if (socket.connected) {
              socket.emit('stockUpdate', stockData);
          }
      })
      .catch(error => {
          if (socket.connected) {
              socket.emit('stockError', {
                  symbol: 'AAPL',
                  error: error.message,
                  timestamp: new Date()
              });
          }
      });

  socket.on('requestStock', async (symbol) => {
      try {
          const stockData = await fetchStockData(symbol);
          if (socket.connected) {
              socket.emit('stockData', stockData);
          }
      } catch (error) {
          if (socket.connected) {
              socket.emit('stockError', {
                  symbol,
                  error: error.message,
                  timestamp: new Date()
              });
          }
      }
  });

  socket.on('disconnect', (reason) => {
      console.log('Client disconnected:', socket.id, 'Reason:', reason);
      intervals.forEach(interval => clearInterval(interval));
      intervals.clear();
  });
});

// MongoDB Schema
const stockSchema = new mongoose.Schema({
    symbol: String,
    price: Number,
    timestamp: Date,
    source: String
});

const Stock = mongoose.model('Stock', stockSchema);

// Stock data fetching with retry mechanism and Alpha Vantage API
async function fetchStockData(symbol, retryCount = 3) {
  const ALPHA_VANTAGE_API_KEY = 'JU6ORAK6OOBERFKY';
  const baseURL = 'https://www.alphavantage.co/query';

  for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
          const response = await axios.get(baseURL, {
              params: {
                  function: 'GLOBAL_QUOTE',
                  symbol: symbol,
                  apikey: ALPHA_VANTAGE_API_KEY
              }
          });

          const data = response.data;
          
          // Add more detailed error logging
          console.log('Alpha Vantage Response:', JSON.stringify(data, null, 2));
          
          if (data['Global Quote'] && data['Global Quote']['05. price']) {
              const price = parseFloat(data['Global Quote']['05. price']);
              
              // Save to database
              const stock = new Stock({
                  symbol,
                  price,
                  timestamp: new Date(),
                  source: 'alphavantage'
              });
              await stock.save();

              return {
                  symbol,
                  price,
                  timestamp: new Date().toISOString(),
                  error: null
              };
          } else if (data.Note) {
              // Handle API limit message
              throw new Error(data.Note);
          } else {
              // Try to get last known price from database
              const lastKnownPrice = await Stock.findOne(
                  { symbol },
                  {},
                  { sort: { timestamp: -1 } }
              );

              if (lastKnownPrice) {
                  return {
                      symbol,
                      price: lastKnownPrice.price,
                      timestamp: lastKnownPrice.timestamp.toISOString(),
                      error: null,
                      cached: true
                  };
              }
              
              throw new Error('Invalid API response format');
          }
      } catch (error) {
          console.error(`Attempt ${attempt} failed for ${symbol}:`, error.message);
          
          // If we've exhausted all retries, try to get the last known price from DB
          if (attempt === retryCount) {
              const lastKnownPrice = await Stock.findOne(
                  { symbol },
                  {},
                  { sort: { timestamp: -1 } }
              );

              if (lastKnownPrice) {
                  return {
                      symbol,
                      price: lastKnownPrice.price,
                      timestamp: lastKnownPrice.timestamp.toISOString(),
                      error: null,
                      cached: true
                  };
              }
              
              return {
                  symbol,
                  price: 0,
                  timestamp: new Date().toISOString(),
                  error: `Failed to fetch stock data for ${symbol} after ${retryCount} attempts: ${error.message}`
              };
          }
          
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
  }
}
// REST endpoints
app.get('/stock/:symbol', async (req, res) => {
    const { symbol } = req.params;
    try {
        const stockData = await fetchStockData(symbol);
        res.json(stockData);
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to fetch stock data',
            message: error.message
        });
    }
});

app.post('/trade', async (req, res) => {
    const { symbol, strategy } = req.body;
    try {
        const stockData = await fetchStockData(symbol);
        const price = stockData.price;

        const tradeSignal = strategy === 'simple' && price < 100 ? 'Buy' : 'Sell';

        res.json({ 
            ...stockData, 
            tradeSignal,
            cached: stockData.cached || false
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to execute trade',
            message: error.message
        });
    }
});

// WebSocket connection handling with improved error handling and caching


/* MONGOOSE SETUP */
const PORT = process.env.PORT || 9000;
mongoose
    .connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(async () => {
        httpServer.listen(PORT, () => console.log(`Server Port: ${PORT}`));
        
        /* ADD DATA ONE TIME ONLY OR AS NEEDED */
        // await KPI.insertMany(kpis);
        // await Product.insertMany(products);
        // await Transaction.insertMany(transactions);
    })
    .catch((error) => console.log(`${error} did not connect`));