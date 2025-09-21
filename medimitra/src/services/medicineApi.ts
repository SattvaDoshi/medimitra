import api from './api';

export interface Medicine {
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
    unit: string;
  };
  prescription_required: boolean;
  expiry_date: string;
  pharmacy: {
    _id: string;
    name: string;
    location: {
      address: {
        street: string;
        city: string;
        state: string;
        pincode: string;
      };
    };
    contact: {
      phone: string;
      email: string;
    };
    rating: number;
  };
  distance?: number;
}

export interface MedicineSearchParams {
  q: string;
  lat?: number;
  lng?: number;
  radius?: number;
  city?: string;
  category?: string;
  available_only?: boolean;
  limit?: number;
  page?: number;
}

export interface MedicineListParams {
  page?: number;
  limit?: number;
  category?: string;
  available_only?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  medicines?: T[];
  pagination: {
    current_page?: number;
    page: number;
    limit: number;
    total: number;
    total_pages?: number;
    pages?: number;
    has_next?: boolean;
    has_previous?: boolean;
  };
}

// Medicine API functions
export const medicineApi = {
  // Search medicines across all pharmacies
  search: async (params: MedicineSearchParams): Promise<ApiResponse<PaginatedResponse<Medicine>>> => {
    const response = await api.get('/medicine/search', { params });
    return response.data;
  },

  // Get all medicines with pagination
  getAll: async (params: MedicineListParams = {}): Promise<ApiResponse<PaginatedResponse<Medicine>>> => {
    const response = await api.get('/medicine', { params });
    return response.data;
  },

  // Get medicine by ID
  getById: async (id: string): Promise<ApiResponse<{ medicine: Medicine }>> => {
    const response = await api.get(`/medicine/${id}`);
    return response.data;
  },

  // Get medicines for a specific pharmacy
  getByPharmacy: async (
    pharmacyId: string, 
    params: { category?: string; available_only?: boolean; search?: string; limit?: number; page?: number } = {}
  ): Promise<ApiResponse<PaginatedResponse<Medicine>>> => {
    const response = await api.get(`/medicine/pharmacy/${pharmacyId}`, { params });
    return response.data;
  },
};

export default medicineApi;