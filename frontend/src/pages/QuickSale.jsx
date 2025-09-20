import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Search, 
  Trash2,
  Calculator,
  CreditCard,
  Banknote,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const QuickSale = () => {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMedicines();
  }, []);

  // Helper function to get current stock from medicine object
  const getCurrentStock = (medicine) => {
    return typeof medicine.stock === 'object' ? medicine.stock.current_quantity : medicine.stock;
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = medicines.filter(medicine =>
        medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        medicine.composition.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMedicines(filtered);
    } else {
      setFilteredMedicines([]);
    }
  }, [searchQuery, medicines]);

  const fetchMedicines = async () => {
    try {
      const response = await api.get('/medicine');
      const medicines = response.data?.data?.medicines || [];
      setMedicines(medicines);
    } catch (error) {
      console.error('Error fetching medicines:', error);
      toast.error('Failed to load medicines');
    }
  };

  const addToCart = (medicine) => {
    const existingItem = cart.find(item => item._id === medicine._id);
    const currentStock = getCurrentStock(medicine);
    
    if (existingItem) {
      if (existingItem.quantity >= currentStock) {
        toast.error('Not enough stock available');
        return;
      }
      setCart(cart.map(item =>
        item._id === medicine._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      if (currentStock <= 0) {
        toast.error('Medicine out of stock');
        return;
      }
      setCart([...cart, { ...medicine, quantity: 1 }]);
    }
    
    setSearchQuery('');
    setFilteredMedicines([]);
  };

  const updateQuantity = (medicineId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(medicineId);
      return;
    }

    const medicine = medicines.find(m => m._id === medicineId);
    const currentStock = getCurrentStock(medicine);
    if (newQuantity > currentStock) {
      toast.error('Not enough stock available');
      return;
    }

    setCart(cart.map(item =>
      item._id === medicineId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const removeFromCart = (medicineId) => {
    setCart(cart.filter(item => item._id !== medicineId));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const processSale = async () => {
    if (cart.length === 0) {
      toast.error('Please add items to cart');
      return;
    }

    try {
      setLoading(true);

      // Generate a transaction ID
      const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      const transactionData = {
        transaction_id: transactionId,
        type: 'sale',
        items: cart.map(item => ({
          medicine: item._id,
          quantity: parseInt(item.quantity),
          unit_price: parseFloat(item.price)
        })),
        payment: {
          method: paymentMethod,
          status: 'completed'
        },
        totals: {
          subtotal: calculateTotal(),
          discount: 0,
          tax: 0,
          total_amount: calculateTotal()
        },
        customer: null // Set to null since we don't have customer management yet
      };

      await api.post('/transaction', transactionData);

      // Clear cart and form
      setCart([]);
      setCustomerInfo({ name: '', phone: '', address: '' });
      setPaymentMethod('cash');

      toast.success('Sale processed successfully!');
      
      // Refresh medicines to update stock
      fetchMedicines();
    } catch (error) {
      console.error('Error processing sale:', error);
      
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.join('\n');
        toast.error(`Validation Error:\n${errorMessages}`);
      } else if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error('Failed to process sale');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quick Sale</h1>
        <p className="text-gray-600 mt-1">Process sales quickly and efficiently</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Medicine Search & Selection */}
        <div className="space-y-6">
          {/* Search */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Medicines</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by name or composition..."
                value={searchQuery || ''}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Search Results */}
            {filteredMedicines.length > 0 && (
              <div className="mt-4 max-h-60 overflow-y-auto">
                {filteredMedicines.map((medicine) => (
                  <div
                    key={medicine._id}
                    onClick={() => addToCart(medicine)}
                    className="p-3 border border-gray-200 rounded-lg mb-2 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{medicine.name}</h3>
                        <p className="text-sm text-gray-500">{medicine.composition}</p>
                        <p className="text-sm font-medium text-green-600">₹{medicine.price}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Stock: {getCurrentStock(medicine)}</p>
                        <p className="text-sm text-gray-500">{medicine.dosageForm}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customer Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information (Optional)</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Customer Name"
                value={customerInfo.name || ''}
                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={customerInfo.phone || ''}
                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <textarea
                placeholder="Address"
                rows={2}
                value={customerInfo.address || ''}
                onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Cart & Checkout */}
        <div className="space-y-6">
          {/* Cart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Cart ({cart.length} items)
            </h2>

            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Cart is empty</p>
                <p className="text-sm text-gray-400">Search and add medicines to start</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">₹{item.price} each</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="p-1 rounded-md hover:bg-gray-100"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="p-1 rounded-md hover:bg-gray-100"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded-md ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="ml-4 text-right">
                      <p className="font-semibold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment & Checkout */}
          {cart.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment</h2>
              
              {/* Payment Method */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`flex items-center justify-center p-3 border rounded-lg transition-colors ${
                      paymentMethod === 'cash'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Banknote className="h-4 w-4 mr-2" />
                    Cash
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`flex items-center justify-center p-3 border rounded-lg transition-colors ${
                      paymentMethod === 'card'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Card
                  </button>
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-gray-900">₹{calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Process Sale Button */}
              <button
                onClick={processSale}
                disabled={loading || cart.length === 0}
                className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Process Sale
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickSale;