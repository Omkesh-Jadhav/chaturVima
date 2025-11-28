import React from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import type { ValidationResult } from './validationUtils';

interface ValidationStatusProps {
  validationResults: ValidationResult[];
  tabName: string;
}

const ValidationStatus: React.FC<ValidationStatusProps> = ({ validationResults, tabName }) => {
  const validationItems = validationResults;

  const getIcon = (type: 'success' | 'error' | 'warning') => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getTextColor = (type: 'success' | 'error' | 'warning') => {
    switch (type) {
      case 'success':
        return 'text-green-700';
      case 'error':
        return 'text-red-700';
      case 'warning':
        return 'text-yellow-700';
    }
  };

  const getBgColor = (type: 'success' | 'error' | 'warning') => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
    }
  };

  const allValid = validationItems.every(item => item.isValid);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">
        {tabName} Validation Status
      </h3>
      
      <div className="space-y-3">
        {validationItems.map((item, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 p-3 rounded-md border ${getBgColor(item.type)}`}
          >
            {getIcon(item.type)}
            <span className={`text-sm font-medium ${getTextColor(item.type)}`}>
              {item.message}
            </span>
          </div>
        ))}
      </div>

      {allValid && (
        <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-md">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-semibold text-green-800">
              All validations passed! Organization setup is ready to save.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationStatus;
