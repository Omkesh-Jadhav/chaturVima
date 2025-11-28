import React, { useState } from 'react';
import { validateEmail, validatePhone, validateWebsite } from './validationUtils';

interface OrganizationInfo {
    name: string;
    type: string;
    size: string;
    industry: string;
    website: string;
    email: string;
    phone: string;
    city: string;
    state: string;
    country: string;
}

interface Step1OrganizationInfoProps {
    data: OrganizationInfo;
    onUpdate: (data: OrganizationInfo) => void;
}

const Step1OrganizationInfo: React.FC<Step1OrganizationInfoProps> = ({
    data,
    onUpdate,
}) => {
    const [formData, setFormData] = useState<OrganizationInfo>(data);
    const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

    const handleInputChange = (field: keyof OrganizationInfo, value: string) => {
        const updatedData = { ...formData, [field]: value };
        setFormData(updatedData);
        onUpdate(updatedData);
        
        // Clear field error when user starts typing
        if (fieldErrors[field]) {
            setFieldErrors(prev => ({ ...prev, [field]: '' }));
        }
    };
    
    const validateField = (field: keyof OrganizationInfo, value: string) => {
        let error = '';
        
        switch (field) {
            case 'email':
                if (value && !validateEmail(value)) {
                    error = 'Please enter a valid email address';
                }
                break;
            case 'phone':
                if (value && !validatePhone(value)) {
                    error = 'Please enter a valid phone number';
                }
                break;
            case 'website':
                if (value && !validateWebsite(value)) {
                    error = 'Please enter a valid website URL (e.g., https://example.com)';
                }
                break;
        }
        
        setFieldErrors(prev => ({ ...prev, [field]: error }));
    };


    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">Organization Info</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organization Name *
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                            !formData.name.trim() ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-stages-self-reflection'
                        }`}
                        placeholder="Enter organization name"
                        required
                    />
                    {!formData.name.trim() && (
                        <p className="mt-1 text-sm text-red-600">Organization name is required</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organization Type *
                    </label>
                    <select
                        value={formData.type}
                        onChange={(e) => handleInputChange('type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stages-self-reflection"
                    >
                        <option value="">Select type</option>
                        <option value="Private Limited">Private Limited</option>
                        <option value="Public Limited">Public Limited</option>
                        <option value="Partnership">Partnership</option>
                        <option value="Sole Proprietorship">Sole Proprietorship</option>
                        <option value="Non-Profit">Non-Profit</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organization Size *
                    </label>
                    <select
                        value={formData.size}
                        onChange={(e) => handleInputChange('size', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stages-self-reflection"
                    >
                        <option value="">Select size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="500+">500+ employees</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Industry *
                    </label>
                    <select
                        value={formData.industry}
                        onChange={(e) => handleInputChange('industry', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stages-self-reflection"
                    >
                        <option value="">Select industry</option>
                        <option value="Technology">Technology</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Finance">Finance</option>
                        <option value="Education">Education</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Retail">Retail</option>
                        <option value="Consulting">Consulting</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website
                    </label>
                    <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        onBlur={(e) => validateField('website', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                            fieldErrors.website ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-stages-self-reflection'
                        }`}
                        placeholder="https://www.example.com"
                    />
                    {fieldErrors.website && (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors.website}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                    </label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        onBlur={(e) => validateField('email', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                            !formData.email.trim() || fieldErrors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-stages-self-reflection'
                        }`}
                        placeholder="contact@example.com"
                        required
                    />
                    {!formData.email.trim() && (
                        <p className="mt-1 text-sm text-red-600">Email address is required</p>
                    )}
                    {formData.email.trim() && fieldErrors.email && (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                    </label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        onBlur={(e) => validateField('phone', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                            !formData.phone.trim() || fieldErrors.phone ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-stages-self-reflection'
                        }`}
                        placeholder="+91 9876543210"
                        required
                    />
                    {!formData.phone.trim() && (
                        <p className="mt-1 text-sm text-red-600">Phone number is required</p>
                    )}
                    {formData.phone.trim() && fieldErrors.phone && (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors.phone}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                    </label>
                    <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stages-self-reflection"
                        placeholder="Enter city"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        State *
                    </label>
                    <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stages-self-reflection"
                        placeholder="Enter state"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country *
                    </label>
                    <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stages-self-reflection"
                        placeholder="Enter country"
                    />
                </div>
            </div>

        </div>
    );
};

export default Step1OrganizationInfo;
