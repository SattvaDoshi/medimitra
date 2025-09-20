import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isValidEmail, isValidPhone, isValidPincode, getCurrentLocation } from '../../utils/helpers';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Building, Loader } from 'lucide-react';

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'customer',
    location: {
      coordinates: [],
      address: {
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
      },
    },
    pharmacyDetails: {
      name: '',
      license_number: '',
      contact: {
        phone: '',
        email: '',
      },
      operating_hours: {
        monday: { open: '09:00', close: '21:00' },
        tuesday: { open: '09:00', close: '21:00' },
        wednesday: { open: '09:00', close: '21:00' },
        thursday: { open: '09:00', close: '21:00' },
        friday: { open: '09:00', close: '21:00' },
        saturday: { open: '09:00', close: '21:00' },
        sunday: { open: '10:00', close: '20:00' },
      },
      services: [],
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [gettingLocation, setGettingLocation] = useState(false);

  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const keys = name.split('.');
      setFormData(prev => {
        const newData = { ...prev };
        let current = newData;
        
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        
        if (type === 'checkbox') {
          if (checked) {
            current[keys[keys.length - 1]] = [...(current[keys[keys.length - 1]] || []), value];
          } else {
            current[keys[keys.length - 1]] = (current[keys[keys.length - 1]] || []).filter(item => item !== value);
          }
        } else {
          current[keys[keys.length - 1]] = value;
        }
        
        return newData;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' 
          ? checked 
            ? [...(prev[name] || []), value]
            : (prev[name] || []).filter(item => item !== value)
          : value,
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const getCurrentLocationData = async () => {
    setGettingLocation(true);
    try {
      const position = await getCurrentLocation();
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          coordinates: [position.longitude, position.latitude],
        },
      }));
    } catch (error) {
      console.error('Error getting location:', error);
    } finally {
      setGettingLocation(false);
    }
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!isValidPhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.location.address.street.trim()) {
      newErrors['location.address.street'] = 'Street address is required';
    }

    if (!formData.location.address.city.trim()) {
      newErrors['location.address.city'] = 'City is required';
    }

    if (!formData.location.address.state.trim()) {
      newErrors['location.address.state'] = 'State is required';
    }

    if (!formData.location.address.pincode) {
      newErrors['location.address.pincode'] = 'Pincode is required';
    } else if (!isValidPincode(formData.location.address.pincode)) {
      newErrors['location.address.pincode'] = 'Please enter a valid 6-digit pincode';
    }

    if (formData.location.coordinates.length === 0) {
      newErrors.coordinates = 'Please get your current location or enter coordinates manually';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    if (formData.role !== 'pharmacy_owner') return true;

    const newErrors = {};

    if (!formData.pharmacyDetails.name.trim()) {
      newErrors['pharmacyDetails.name'] = 'Pharmacy name is required';
    }

    if (!formData.pharmacyDetails.license_number.trim()) {
      newErrors['pharmacyDetails.license_number'] = 'License number is required';
    }

    if (!formData.pharmacyDetails.contact.phone) {
      newErrors['pharmacyDetails.contact.phone'] = 'Pharmacy phone is required';
    } else if (!isValidPhone(formData.pharmacyDetails.contact.phone)) {
      newErrors['pharmacyDetails.contact.phone'] = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.pharmacyDetails.contact.email) {
      newErrors['pharmacyDetails.contact.email'] = 'Pharmacy email is required';
    } else if (!isValidEmail(formData.pharmacyDetails.contact.email)) {
      newErrors['pharmacyDetails.contact.email'] = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = false;
    
    switch (step) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      default:
        isValid = true;
    }

    if (isValid) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep3()) return;

    try {
      const registrationData = { ...formData };
      
      // Remove pharmacy details if role is customer
      if (formData.role === 'customer') {
        delete registrationData.pharmacyDetails;
      }

      await register(registrationData);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  const services = [
    'home_delivery',
    '24_hours',
    'online_ordering',
    'prescription_service',
    'consultation',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
            <p className="mt-2 text-gray-600">Join the pharmacy network</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center">
              {[1, 2, 3].map((stepNumber) => (
                <React.Fragment key={stepNumber}>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    step >= stepNumber ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Personal Info</span>
              <span>Location</span>
              <span>Pharmacy Details</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-3 border ${
                          errors.name ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="Enter your full name"
                      />
                    </div>
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-3 border ${
                          errors.phone ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="10-digit phone number"
                      />
                    </div>
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-3 border ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-10 py-3 border ${
                          errors.password ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                      </button>
                    </div>
                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-10 py-3 border ${
                          errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="Confirm password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                  </div>
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="relative">
                      <input
                        type="radio"
                        name="role"
                        value="customer"
                        checked={formData.role === 'customer'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        formData.role === 'customer' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <div className="text-center">
                          <User className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                          <div className="font-medium">Customer</div>
                          <div className="text-sm text-gray-500">Find medicines and pharmacies</div>
                        </div>
                      </div>
                    </label>

                    <label className="relative">
                      <input
                        type="radio"
                        name="role"
                        value="pharmacy_owner"
                        checked={formData.role === 'pharmacy_owner'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        formData.role === 'pharmacy_owner' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <div className="text-center">
                          <Building className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                          <div className="font-medium">Pharmacy Owner</div>
                          <div className="text-sm text-gray-500">Manage inventory and sales</div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {step === 2 && (
              <div className="space-y-4">
                {/* Get Current Location */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-blue-800">Location Detection</h3>
                      <p className="text-sm text-blue-600">Allow location access for better service</p>
                    </div>
                    <button
                      type="button"
                      onClick={getCurrentLocationData}
                      disabled={gettingLocation}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {gettingLocation ? (
                        <Loader className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <MapPin className="h-4 w-4 mr-2" />
                      )}
                      {gettingLocation ? 'Getting Location...' : 'Get Location'}
                    </button>
                  </div>
                  {formData.location.coordinates.length > 0 && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ Location detected: {formData.location.coordinates[1].toFixed(4)}, {formData.location.coordinates[0].toFixed(4)}
                    </p>
                  )}
                </div>

                {/* Address Fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="location.address.street"
                    value={formData.location.address.street}
                    onChange={handleChange}
                    className={`block w-full px-3 py-3 border ${
                      errors['location.address.street'] ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Enter street address"
                  />
                  {errors['location.address.street'] && (
                    <p className="mt-1 text-sm text-red-600">{errors['location.address.street']}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="location.address.city"
                      value={formData.location.address.city}
                      onChange={handleChange}
                      className={`block w-full px-3 py-3 border ${
                        errors['location.address.city'] ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Enter city"
                    />
                    {errors['location.address.city'] && (
                      <p className="mt-1 text-sm text-red-600">{errors['location.address.city']}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="location.address.state"
                      value={formData.location.address.state}
                      onChange={handleChange}
                      className={`block w-full px-3 py-3 border ${
                        errors['location.address.state'] ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Enter state"
                    />
                    {errors['location.address.state'] && (
                      <p className="mt-1 text-sm text-red-600">{errors['location.address.state']}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode
                    </label>
                    <input
                      type="text"
                      name="location.address.pincode"
                      value={formData.location.address.pincode}
                      onChange={handleChange}
                      className={`block w-full px-3 py-3 border ${
                        errors['location.address.pincode'] ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="6-digit pincode"
                    />
                    {errors['location.address.pincode'] && (
                      <p className="mt-1 text-sm text-red-600">{errors['location.address.pincode']}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      name="location.address.country"
                      value={formData.location.address.country}
                      onChange={handleChange}
                      className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                      readOnly
                    />
                  </div>
                </div>

                {errors.coordinates && (
                  <p className="text-sm text-red-600">{errors.coordinates}</p>
                )}
              </div>
            )}

            {/* Step 3: Pharmacy Details */}
            {step === 3 && (
              <div className="space-y-4">
                {formData.role === 'pharmacy_owner' ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pharmacy Name
                        </label>
                        <input
                          type="text"
                          name="pharmacyDetails.name"
                          value={formData.pharmacyDetails.name}
                          onChange={handleChange}
                          className={`block w-full px-3 py-3 border ${
                            errors['pharmacyDetails.name'] ? 'border-red-300' : 'border-gray-300'
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="Enter pharmacy name"
                        />
                        {errors['pharmacyDetails.name'] && (
                          <p className="mt-1 text-sm text-red-600">{errors['pharmacyDetails.name']}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          License Number
                        </label>
                        <input
                          type="text"
                          name="pharmacyDetails.license_number"
                          value={formData.pharmacyDetails.license_number}
                          onChange={handleChange}
                          className={`block w-full px-3 py-3 border ${
                            errors['pharmacyDetails.license_number'] ? 'border-red-300' : 'border-gray-300'
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="Enter license number"
                        />
                        {errors['pharmacyDetails.license_number'] && (
                          <p className="mt-1 text-sm text-red-600">{errors['pharmacyDetails.license_number']}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pharmacy Phone
                        </label>
                        <input
                          type="tel"
                          name="pharmacyDetails.contact.phone"
                          value={formData.pharmacyDetails.contact.phone}
                          onChange={handleChange}
                          className={`block w-full px-3 py-3 border ${
                            errors['pharmacyDetails.contact.phone'] ? 'border-red-300' : 'border-gray-300'
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="10-digit phone number"
                        />
                        {errors['pharmacyDetails.contact.phone'] && (
                          <p className="mt-1 text-sm text-red-600">{errors['pharmacyDetails.contact.phone']}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pharmacy Email
                        </label>
                        <input
                          type="email"
                          name="pharmacyDetails.contact.email"
                          value={formData.pharmacyDetails.contact.email}
                          onChange={handleChange}
                          className={`block w-full px-3 py-3 border ${
                            errors['pharmacyDetails.contact.email'] ? 'border-red-300' : 'border-gray-300'
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="Enter pharmacy email"
                        />
                        {errors['pharmacyDetails.contact.email'] && (
                          <p className="mt-1 text-sm text-red-600">{errors['pharmacyDetails.contact.email']}</p>
                        )}
                      </div>
                    </div>

                    {/* Services */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Services Offered (Optional)
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {services.map((service) => (
                          <label key={service} className="flex items-center">
                            <input
                              type="checkbox"
                              name="pharmacyDetails.services"
                              value={service}
                              checked={formData.pharmacyDetails.services.includes(service)}
                              onChange={handleChange}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {service.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <User className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Account</h3>
                    <p className="text-gray-600">You're all set! Click Create Account to continue.</p>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Previous
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="ml-auto flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading ? (
                    <Loader className="h-5 w-5 animate-spin mr-2" />
                  ) : null}
                  Create Account
                </button>
              )}
            </div>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;