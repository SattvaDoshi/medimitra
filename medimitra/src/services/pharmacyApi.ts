import api from './api';

export interface Pharmacy {
  _id: string;
  name: string;
  license_number: string;
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
    address: {
      street: string;
      city: string;
      state: string;
      pincode: string;
      country: string;
    };
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  operating_hours: {
    [key: string]: {
      open: string;
      close: string;
      is_24_hours: boolean;
      is_closed: boolean;
    };
  };
  services: string[];
  rating: number | { average: number; count: number } | null;
  owner: {
    _id: string;
    name: string;
    email: string;
  };
  distance?: number;
}

export interface PharmacySearchParams {
  lat?: number;
  lng?: number;
  radius?: number;
  city?: string;
  pincode?: string;
  street?: string;
  limit?: number;
  page?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  pharmacies: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages?: number;
  };
}

// Pharmacy API functions
export const pharmacyApi = {
  // Search pharmacies by location
  search: async (params: PharmacySearchParams): Promise<ApiResponse<PaginatedResponse<Pharmacy>>> => {
    const response = await api.get('/pharmacy/search', { params });
    return response.data;
  },

  // Get pharmacy by ID
  getById: async (id: string): Promise<ApiResponse<{ pharmacy: Pharmacy }>> => {
    const response = await api.get(`/pharmacy/${id}`);
    return response.data;
  },

  // Get all pharmacies
  getAll: async (params: { limit?: number; page?: number } = {}): Promise<ApiResponse<PaginatedResponse<Pharmacy>>> => {
    const response = await api.get('/pharmacy', { params });
    return response.data;
  },

  // Get medicines for a specific pharmacy
  getMedicinesByPharmacy: async (pharmacyId: string, params?: {
    category?: string;
    available_only?: boolean;
    search?: string;
    limit?: number;
    page?: number;
  }): Promise<{
    success: boolean;
    data?: {
      medicines: Array<{
        _id: string;
        name: string;
        brand: string;
        category: string;
        composition: string;
        strength: string;
        pack_size: string;
        selling_price: number;
        mrp: number;
        stock: {
          current_quantity: number;
          minimum_threshold: number;
        };
        prescription_required: boolean;
        expiry_date: string;
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    };
    message?: string;
  }> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.category) queryParams.append('category', params.category);
      if (params?.available_only !== undefined) queryParams.append('available_only', params.available_only.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.page) queryParams.append('page', params.page.toString());
      
      const url = `/medicine/pharmacy/${pharmacyId}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching pharmacy medicines:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch pharmacy medicines'
      };
    }
  }
};

export default pharmacyApi;