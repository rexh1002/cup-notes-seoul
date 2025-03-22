// components/ui/Select.tsx
import React from 'react';

interface SelectProps {
  label?: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export const Select: React.FC<SelectProps> = ({ label, options, value, onChange }) => {
  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <select
        className="block w-full p-2 border border-gray-300 rounded-md"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="" disabled>
          선택하세요
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};
