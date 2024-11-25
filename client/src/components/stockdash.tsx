import StockChart from "./portfolio";
import RealTimeStockUpdates from "./stock";
import StockManager from "./trade";

function StocksDashboard() {
    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Trading Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StockManager />
                <RealTimeStockUpdates />
                <StockChart />
            </div>
      
        </div>
    );
}

export default StocksDashboard;