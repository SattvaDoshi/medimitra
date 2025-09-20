import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Download,
  Filter,
  Package,
  DollarSign,
  ShoppingCart,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Reports = () => {
  const { user } = useAuth();
  const [reportData, setReportData] = useState({
    salesData: [],
    inventoryData: [],
    transactionSummary: {},
    topMedicines: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('sales');

  const periods = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  const reportTypes = [
    { value: 'sales', label: 'Sales Report', icon: TrendingUp },
    { value: 'inventory', label: 'Inventory Report', icon: Package },
    { value: 'transactions', label: 'Transaction Summary', icon: ShoppingCart },
    { value: 'performance', label: 'Performance Report', icon: BarChart3 }
  ];

  useEffect(() => {
    fetchReportData();
  }, [selectedPeriod]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Fetch medicines and transactions
      const [medicinesRes, transactionsRes] = await Promise.all([
        api.get('/medicine'),
        api.get('/transaction')
      ]);

      const medicines = medicinesRes.data?.data?.medicines || [];
      const transactions = transactionsRes.data?.data?.transactions || [];

      // Process data for reports
      const salesData = processSalesData(transactions);
      const inventoryData = processInventoryData(medicines);
      const transactionSummary = processTransactionSummary(transactions);
      const topMedicines = processTopMedicines(transactions, medicines);

      setReportData({
        salesData,
        inventoryData,
        transactionSummary,
        topMedicines
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processSalesData = (transactions) => {
    const sales = transactions.filter(t => t.type === 'sale');
    const today = new Date();
    const daysInPeriod = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 90;
    
    const salesByDay = {};
    for (let i = daysInPeriod - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      salesByDay[dateKey] = 0;
    }

    sales.forEach(sale => {
      const saleDate = new Date(sale.createdAt).toISOString().split('T')[0];
      if (salesByDay.hasOwnProperty(saleDate)) {
        salesByDay[saleDate] += sale.totalAmount;
      }
    });

    return Object.entries(salesByDay).map(([date, amount]) => ({
      date,
      amount
    }));
  };

  const processInventoryData = (medicines) => {
    const categories = {};
    medicines.forEach(medicine => {
      const category = medicine.category || 'Other';
      if (!categories[category]) {
        categories[category] = {
          count: 0,
          totalValue: 0,
          lowStock: 0
        };
      }
      categories[category].count++;
      categories[category].totalValue += medicine.price * medicine.stock;
      if (medicine.stock <= (medicine.minStockLevel || 10)) {
        categories[category].lowStock++;
      }
    });

    return Object.entries(categories).map(([category, data]) => ({
      category,
      ...data
    }));
  };

  const processTransactionSummary = (transactions) => {
    const summary = {
      totalSales: 0,
      totalPurchases: 0,
      totalReturns: 0,
      totalTransactions: transactions.length,
      averageOrderValue: 0
    };

    transactions.forEach(transaction => {
      switch (transaction.type) {
        case 'sale':
          summary.totalSales += transaction.totalAmount;
          break;
        case 'purchase':
          summary.totalPurchases += transaction.totalAmount;
          break;
        case 'return':
          summary.totalReturns += transaction.totalAmount;
          break;
      }
    });

    const sales = transactions.filter(t => t.type === 'sale');
    if (sales.length > 0) {
      summary.averageOrderValue = summary.totalSales / sales.length;
    }

    return summary;
  };

  const processTopMedicines = (transactions, medicines) => {
    const medicineStats = {};
    
    transactions.forEach(transaction => {
      if (transaction.type === 'sale' && transaction.items) {
        transaction.items.forEach(item => {
          const medicineId = item.medicine?._id || item.medicine;
          if (!medicineStats[medicineId]) {
            medicineStats[medicineId] = {
              quantity: 0,
              revenue: 0,
              medicine: null
            };
          }
          medicineStats[medicineId].quantity += item.quantity;
          medicineStats[medicineId].revenue += item.quantity * item.price;
        });
      }
    });

    // Add medicine details
    Object.keys(medicineStats).forEach(medicineId => {
      const medicine = medicines.find(m => m._id === medicineId);
      medicineStats[medicineId].medicine = medicine;
    });

    return Object.values(medicineStats)
      .filter(stat => stat.medicine)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  };

  const exportReport = () => {
    // Create CSV data based on selected report
    let csvData = '';
    let filename = '';

    switch (selectedReport) {
      case 'sales':
        csvData = 'Date,Amount\n' + 
          reportData.salesData.map(item => `${item.date},${item.amount}`).join('\n');
        filename = `sales-report-${selectedPeriod}.csv`;
        break;
      case 'inventory':
        csvData = 'Category,Count,Total Value,Low Stock\n' + 
          reportData.inventoryData.map(item => 
            `${item.category},${item.count},${item.totalValue},${item.lowStock}`
          ).join('\n');
        filename = `inventory-report-${selectedPeriod}.csv`;
        break;
      case 'transactions':
        csvData = 'Metric,Value\n' +
          `Total Sales,${reportData.transactionSummary.totalSales}\n` +
          `Total Purchases,${reportData.transactionSummary.totalPurchases}\n` +
          `Total Returns,${reportData.transactionSummary.totalReturns}\n` +
          `Total Transactions,${reportData.transactionSummary.totalTransactions}\n` +
          `Average Order Value,${reportData.transactionSummary.averageOrderValue}`;
        filename = `transaction-summary-${selectedPeriod}.csv`;
        break;
      default:
        return;
    }

    // Download CSV
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Track performance and analyze business data</p>
        </div>
        <button
          onClick={exportReport}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {reportTypes.map(type => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    onClick={() => setSelectedReport(type.value)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      selectedReport === type.value
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5 mb-1" />
                    <div className="text-sm font-medium">{type.label}</div>
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="md:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Period
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {periods.map(period => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {selectedReport === 'sales' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Trend</h3>
            <div className="h-64 flex items-end justify-between space-x-1">
              {reportData.salesData.map((data, index) => {
                const maxAmount = Math.max(...reportData.salesData.map(d => d.amount));
                const height = maxAmount > 0 ? (data.amount / maxAmount) * 100 : 0;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="bg-blue-500 w-full rounded-t"
                      style={{ height: `${height}%` }}
                      title={`${data.date}: ₹${data.amount}`}
                    />
                    <div className="text-xs text-gray-500 mt-2 transform -rotate-45">
                      {new Date(data.date).getDate()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sales Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Sales</span>
                <span className="font-semibold text-green-600">
                  ₹{reportData.transactionSummary.totalSales?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Order Value</span>
                <span className="font-semibold">
                  ₹{reportData.transactionSummary.averageOrderValue?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Transactions</span>
                <span className="font-semibold">
                  {reportData.transactionSummary.totalTransactions}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'inventory' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Inventory by Category */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Inventory by Category</h3>
            <div className="space-y-4">
              {reportData.inventoryData.map((category, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{category.category}</div>
                    <div className="text-sm text-gray-600">{category.count} medicines</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      ₹{category.totalValue.toLocaleString()}
                    </div>
                    {category.lowStock > 0 && (
                      <div className="text-sm text-red-600">
                        {category.lowStock} low stock
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Medicines */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Selling Medicines</h3>
            <div className="space-y-3">
              {reportData.topMedicines.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">
                      {item.medicine?.name || 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {item.quantity} units sold
                    </div>
                  </div>
                  <div className="font-semibold text-green-600">
                    ₹{item.revenue.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'transactions' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg mr-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{reportData.transactionSummary.totalSales?.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg mr-4">
                <TrendingDown className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Purchases</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{reportData.transactionSummary.totalPurchases?.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg mr-4">
                <ShoppingCart className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{reportData.transactionSummary.averageOrderValue?.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'performance' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {reportData.transactionSummary.totalTransactions}
              </div>
              <div className="text-sm text-gray-600">Total Transactions</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                ₹{(reportData.transactionSummary.totalSales / 1000).toFixed(1)}K
              </div>
              <div className="text-sm text-gray-600">Revenue</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {reportData.inventoryData.reduce((sum, cat) => sum + cat.count, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Medicines</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {reportData.inventoryData.reduce((sum, cat) => sum + cat.lowStock, 0)}
              </div>
              <div className="text-sm text-gray-600">Low Stock Items</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;