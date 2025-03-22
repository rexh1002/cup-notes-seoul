// components/ui/CheckboxGroup.tsx
import React from 'react';

interface CheckboxGroupProps {
  label?: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ label, options, selected, onChange }) => {
  const handleToggle = (option: string) => {
    const isSelected = selected.includes(option);
    if (isSelected) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <div className="space-y-1">
        {options.map((option) => (
          <div key={option} className="flex items-center">
            <input
              type="checkbox"
              id={option}
              className="mr-2"
              checked={selected.includes(option)}
              onChange={() => handleToggle(option)}
            />
            <label htmlFor={option} className="text-sm">
              {option}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};
