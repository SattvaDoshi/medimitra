import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Filter, 
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Package,
  User,
  Eye,
  Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [showNewTransactionModal, setShowNewTransactionModal] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [transactionItems, setTransactionItems] = useState([{ medicineId: '', quantity: 1, price: 0 }]);

  const transactionTypes = ['all', 'sale', 'purchase', 'return'];
  const dateFilters = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' }
  ];

  useEffect(() => {
    fetchTransactions();
    fetchMedicines();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/transaction');
      const transactions = response.data?.data?.transactions || [];
      setTransactions(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicines = async () => {
    try {
      const response = await api.get('/medicine');
      const medicines = response.data?.data?.medicines || [];
      setMedicines(medicines);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    }
  };

  const handleNewTransaction = async (type) => {
    try {
      const totalAmount = transactionItems.reduce((sum, item) => 
        sum + (item.quantity * item.price), 0
      );

      const transactionData = {
        type,
        items: transactionItems.map(item => ({
          medicine: item.medicineId,
          quantity: parseInt(item.quantity),
          unit_price: parseFloat(item.price)
        })),
        payment: {
          method: 'cash',
          status: 'completed'
        },
        totals: {
          subtotal: totalAmount,
          discount: 0,
          tax: 0,
          total_amount: totalAmount
        },
        customer: null // Set to null since we don't have customer management yet
      };

      await api.post('/transaction', transactionData);
      fetchTransactions();
      setShowNewTransactionModal(false);
      setTransactionItems([{ medicineId: '', quantity: 1, price: 0 }]);
      alert('Transaction created successfully!');
    } catch (error) {
      console.error('Error creating transaction:', error);
      
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.join('\n');
        alert(`Validation Error:\n${errorMessages}`);
      } else if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert('Error creating transaction. Please try again.');
      }
    }
  };

  const addTransactionItem = () => {
    setTransactionItems([...transactionItems, { medicineId: '', quantity: 1, price: 0 }]);
  };

  const removeTransactionItem = (index) => {
    const newItems = transactionItems.filter((_, i) => i !== index);
    setTransactionItems(newItems);
  };

  const updateTransactionItem = (index, field, value) => {
    const newItems = [...transactionItems];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-fill price when medicine is selected
    if (field === 'medicineId') {
      const medicine = medicines.find(m => m._id === value);
      if (medicine) {
        newItems[index].price = medicine.price || 0;
      }
    }
    
    setTransactionItems(newItems);
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.items?.some(item => 
      item.medicine?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || transaction.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || transaction.type === filterType;
    
    let matchesDate = true;
    if (filterDate !== 'all') {
      const transactionDate = new Date(transaction.createdAt);
      const now = new Date();
      
      switch (filterDate) {
        case 'today':
          matchesDate = transactionDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = transactionDate >= weekAgo;
          break;
        case 'month':
          matchesDate = transactionDate.getMonth() === now.getMonth() && 
                       transactionDate.getFullYear() === now.getFullYear();
          break;
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3);
          const transactionQuarter = Math.floor(transactionDate.getMonth() / 3);
          matchesDate = transactionQuarter === quarter && 
                       transactionDate.getFullYear() === now.getFullYear();
          break;
      }
    }
    
    return matchesSearch && matchesType && matchesDate;
  });

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'sale':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'purchase':
        return <TrendingDown className="h-5 w-5 text-blue-600" />;
      case 'return':
        return <Package className="h-5 w-5 text-orange-600" />;
      default:
        return <ShoppingCart className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'sale':
        return 'bg-green-50 border-green-200';
      case 'purchase':
        return 'bg-blue-50 border-blue-200';
      case 'return':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1">Manage sales, purchases, and returns</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowNewTransactionModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Sale
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{transactions
                  .filter(t => t.type === 'sale')
                  .reduce((sum, t) => sum + t.totalAmount, 0)
                  .toLocaleString()}
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
                ₹{transactions
                  .filter(t => t.type === 'purchase')
                  .reduce((sum, t) => sum + t.totalAmount, 0)
                  .toLocaleString()}
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
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg mr-4">
              <Package className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Returns</p>
              <p className="text-2xl font-bold text-gray-900">
                {transactions.filter(t => t.type === 'return').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm || ''}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {transactionTypes.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {dateFilters.map(filter => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div key={transaction._id} className={`p-6 ${getTransactionColor(transaction.type)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900 capitalize">
                          {transaction.type}
                        </h4>
                        <span className="text-sm text-gray-500">
                          #{transaction._id.slice(-6)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {transaction.items?.length} item(s)
                        {transaction.customerName && (
                          <span className="ml-2">• {transaction.customerName}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      ₹{transaction.totalAmount?.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                {transaction.items && transaction.items.length > 0 && (
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <div className="space-y-2">
                      {transaction.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {item.medicine?.name || 'Unknown Medicine'} × {item.quantity}
                          </span>
                          <span className="text-gray-900">
                            ₹{(item.quantity * item.price).toLocaleString()}
                          </span>
                        </div>
                      ))}
                      {transaction.items.length > 3 && (
                        <div className="text-sm text-gray-500">
                          +{transaction.items.length - 3} more items
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Transaction Modal */}
      {showNewTransactionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">New Sale Transaction</h3>
            </div>

            <div className="px-6 py-4 space-y-4">
              {transactionItems.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Medicine
                    </label>
                    <select
                      value={item.medicineId || ''}
                      onChange={(e) => updateTransactionItem(index, 'medicineId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select medicine</option>
                      {medicines.map(medicine => (
                        <option key={medicine._id} value={medicine._id}>
                          {medicine.name} - ₹{medicine.price} (Stock: {typeof medicine.stock === 'object' ? medicine.stock.current_quantity : medicine.stock})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity || 1}
                      onChange={(e) => updateTransactionItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        step="0.01"
                        value={item.price || 0}
                        onChange={(e) => updateTransactionItem(index, 'price', parseFloat(e.target.value) || 0)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {transactionItems.length > 1 && (
                        <button
                          onClick={() => removeTransactionItem(index)}
                          className="px-3 py-2 bg-red-600 text-white rounded-r-lg hover:bg-red-700"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                onClick={addTransactionItem}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-300 hover:text-blue-600"
              >
                + Add Another Item
              </button>
              
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Amount:</span>
                  <span>₹{transactionItems.reduce((sum, item) => sum + (item.quantity * item.price), 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowNewTransactionModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleNewTransaction('sale')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Complete Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;