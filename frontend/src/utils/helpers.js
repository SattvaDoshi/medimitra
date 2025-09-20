// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

// Format date
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};

// Format date and time
export const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

// Calculate distance between two coordinates
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return Math.round(d * 10) / 10; // Round to 1 decimal place
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

// Get user's current location
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000, // 10 minutes
        }
      );
    }
  });
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (Indian format)
export const isValidPhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

// Validate pincode (Indian format)
export const isValidPincode = (pincode) => {
  const pincodeRegex = /^[0-9]{6}$/;
  return pincodeRegex.test(pincode);
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Generate random ID
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Check if medicine is expired
export const isExpired = (expiryDate) => {
  return new Date(expiryDate) <= new Date();
};

// Check if medicine is expiring soon (within 30 days)
export const isExpiringSoon = (expiryDate) => {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  const expiry = new Date(expiryDate);
  return expiry > new Date() && expiry <= thirtyDaysFromNow;
};

// Check if stock is low
export const isLowStock = (currentQuantity, minimumThreshold) => {
  return currentQuantity <= minimumThreshold;
};

// Get stock status
export const getStockStatus = (medicine) => {
  if (isExpired(medicine.expiry_date)) {
    return { status: 'expired', label: 'Expired', color: 'red' };
  }
  if (medicine.stock.current_quantity === 0) {
    return { status: 'out_of_stock', label: 'Out of Stock', color: 'red' };
  }
  if (isLowStock(medicine.stock.current_quantity, medicine.stock.minimum_threshold)) {
    return { status: 'low_stock', label: 'Low Stock', color: 'orange' };
  }
  if (isExpiringSoon(medicine.expiry_date)) {
    return { status: 'expiring_soon', label: 'Expiring Soon', color: 'yellow' };
  }
  return { status: 'available', label: 'Available', color: 'green' };
};

// Capitalize first letter
export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Truncate text
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

// Get medicine category color
export const getCategoryColor = (category) => {
  const colors = {
    tablet: 'blue',
    capsule: 'green',
    syrup: 'purple',
    injection: 'red',
    cream: 'pink',
    ointment: 'indigo',
    drops: 'teal',
    spray: 'orange',
    inhaler: 'cyan',
    powder: 'lime',
    gel: 'emerald',
    lotion: 'rose',
    other: 'gray',
  };
  return colors[category] || 'gray';
};

// Sort array by key
export const sortBy = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (direction === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });
};

// Filter medicines by search term
export const filterMedicines = (medicines, searchTerm) => {
  if (!searchTerm) return medicines;
  
  const term = searchTerm.toLowerCase();
  return medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(term) ||
    medicine.brand.toLowerCase().includes(term) ||
    medicine.generic_name?.toLowerCase().includes(term) ||
    medicine.composition.toLowerCase().includes(term)
  );
};

// Group medicines by category
export const groupByCategory = (medicines) => {
  return medicines.reduce((groups, medicine) => {
    const category = medicine.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(medicine);
    return groups;
  }, {});
};