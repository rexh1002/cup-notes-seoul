import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface FilterSectionProps {
  title: string;
  options: string[];
  selected: string[];
  onChange: (value: string) => void;
  className?: string;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  options,
  selected,
  onChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className={`border-b border-gray-200 pb-4 ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left"
      >
        <span className="text-[15px] font-medium text-gray-900">{title}</span>
        <ChevronDownIcon
          className={`w-5 h-5 text-gray-500 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div className="mt-4 space-y-2">
          {options.map((option) => (
            <label
              key={option}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => onChange(option)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-[13px] text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterSection; 