// Location utilities
export interface LocationCoords {
  lat: number;
  lng: number;
}

export const getCurrentLocation = (): Promise<LocationCoords> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        let errorMessage = 'Unable to retrieve location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable. Please check your GPS.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage = 'An unknown error occurred while retrieving location.';
            break;
        }
        
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout to 15 seconds
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};

export const calculateDistance = (
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

export const formatAddress = (address: {
  street?: string;
  city: string;
  state: string;
  pincode: string;
}): string => {
  const parts = [];
  
  if (address.street) parts.push(address.street);
  parts.push(address.city);
  parts.push(address.state);
  parts.push(address.pincode);
  
  return parts.join(', ');
};