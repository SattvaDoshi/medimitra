import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Package, 
  Edit3, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Inventory = () => {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    'all',
    'tablets',
    'capsules',
    'syrup',
    'injection',
    'ointment',
    'drops',
    'other'
  ];

  useEffect(() => {
    fetchMedicines();
  }, []);

  useEffect(() => {
    filterAndSortMedicines();
  }, [medicines, searchTerm, filterCategory, sortBy]);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      try {
        const response = await api.get('/medicine');
        // Extract medicines from the API response structure
        const medicines = response.data?.data?.medicines || [];
        setMedicines(medicines);
      } catch (apiError) {
        console.error('API Error:', apiError);
        // Set demo data when API fails
        setMedicines([
          {
            _id: '1',
            name: 'Paracetamol 500mg',
            composition: 'Paracetamol',
            price: 25,
            stock: 150,
            minStockLevel: 20,
            dosageForm: 'tablets',
            manufacturer: 'XYZ Pharma',
            expiryDate: '2025-12-31',
            batchNumber: 'PAR001'
          },
          {
            _id: '2',
            name: 'Amoxicillin 250mg',
            composition: 'Amoxicillin',
            price: 85,
            stock: 75,
            minStockLevel: 25,
            dosageForm: 'capsules',
            manufacturer: 'ABC Medicines',
            expiryDate: '2025-10-15',
            batchNumber: 'AMX002'
          },
          {
            _id: '3',
            name: 'Aspirin 100mg',
            composition: 'Acetylsalicylic Acid',
            price: 12,
            stock: 8,
            minStockLevel: 15,
            dosageForm: 'tablets',
            manufacturer: 'Generic Labs',
            expiryDate: '2025-08-20',
            batchNumber: 'ASP003'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortMedicines = () => {
    let filtered = medicines;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(medicine =>
        medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(medicine =>
        medicine.category.toLowerCase() === filterCategory.toLowerCase()
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'stock':
          const aStock = typeof a.stock === 'object' ? a.stock.current_quantity : a.stock;
          const bStock = typeof b.stock === 'object' ? b.stock.current_quantity : b.stock;
          return bStock - aStock;
        case 'price':
          return b.price - a.price;
        case 'expiry':
          return new Date(a.expiryDate) - new Date(b.expiryDate);
        default:
          return 0;
      }
    });

    setFilteredMedicines(filtered);
  };

  const getStockStatus = (medicine) => {
    // Handle both old and new stock structure
    const currentStock = typeof medicine.stock === 'object' ? medicine.stock.current_quantity : medicine.stock;
    const minStock = typeof medicine.stock === 'object' ? medicine.stock.minimum_threshold : (medicine.minStockLevel || 10);
    
    if (currentStock === 0) return { status: 'out', color: 'red', text: 'Out of Stock' };
    if (currentStock <= minStock) return { status: 'low', color: 'yellow', text: 'Low Stock' };
    return { status: 'good', color: 'green', text: 'In Stock' };
  };

  const getExpiryStatus = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { status: 'expired', color: 'red', text: 'Expired' };
    if (diffDays <= 30) return { status: 'expiring', color: 'yellow', text: `Expires in ${diffDays} days` };
    return { status: 'good', color: 'green', text: 'Good' };
  };

  const handleDelete = async (medicineId) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        await api.delete(`/medicine/${medicineId}`);
        fetchMedicines();
      } catch (error) {
        console.error('Error deleting medicine:', error);
      }
    }
  };

  const MedicineCard = ({ medicine }) => {
    const stockStatus = getStockStatus(medicine);
    const expiryStatus = getExpiryStatus(medicine.expiryDate);

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{medicine.name}</h3>
            <p className="text-gray-600 text-sm">{medicine.manufacturer}</p>
            <p className="text-gray-500 text-sm capitalize">{medicine.category}</p>
          </div>
          <div className="flex space-x-2">
            <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              <Edit3 className="h-4 w-4" />
            </button>
            <button 
              onClick={() => handleDelete(medicine._id)}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {/* Stock Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Stock:</span>
            <div className="flex items-center space-x-2">
              <span className="font-medium">
                {typeof medicine.stock === 'object' ? medicine.stock.current_quantity : medicine.stock} units
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                stockStatus.color === 'red' ? 'bg-red-100 text-red-700' :
                stockStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {stockStatus.text}
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Price:</span>
            <span className="font-medium">₹{medicine.price}</span>
          </div>

          {/* Expiry */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Expiry:</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm">{new Date(medicine.expiryDate).toLocaleDateString()}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                expiryStatus.color === 'red' ? 'bg-red-100 text-red-700' :
                expiryStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {expiryStatus.text}
              </span>
            </div>
          </div>

          {/* Batch */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Batch:</span>
            <span className="text-sm font-mono">{medicine.batchNumber}</span>
          </div>
        </div>
      </div>
    );
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medicine Inventory</h1>
          <p className="text-gray-600 mt-1">
            Manage your pharmacy's medicine stock
          </p>
        </div>
        <button className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Add Medicine
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name">Sort by Name</option>
            <option value="stock">Sort by Stock</option>
            <option value="price">Sort by Price</option>
            <option value="expiry">Sort by Expiry</option>
          </select>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Medicines</p>
              <p className="text-xl font-bold">{medicines.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">In Stock</p>
              <p className="text-xl font-bold">
                {medicines.filter(m => m.stock > (m.minStockLevel || 10)).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Low Stock</p>
              <p className="text-xl font-bold">
                {medicines.filter(m => m.stock <= (m.minStockLevel || 10) && m.stock > 0).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Expiring Soon</p>
              <p className="text-xl font-bold">
                {medicines.filter(m => {
                  const days = Math.ceil((new Date(m.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                  return days <= 30 && days > 0;
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Medicine Grid */}
      {filteredMedicines.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No medicines found</h3>
          <p className="text-gray-500">
            {searchTerm || filterCategory !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Start by adding your first medicine to the inventory'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedicines.map((medicine) => (
            <MedicineCard key={medicine._id} medicine={medicine} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Inventory;