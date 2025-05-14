import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import FilterSection from './FilterSection';

interface CoffeeFiltersProps {
  onClose: () => void;
  onApply: () => void;
  brewMethods: string[];
  origins: string[];
  processes: string[];
  roastLevels: string[];
  cupNotes: string[];
  selectedBrewMethods: string[];
  selectedOrigins: string[];
  selectedProcesses: string[];
  selectedRoastLevels: string[];
  selectedCupNotes: string[];
  handleBrewMethodChange: (value: string) => void;
  handleOriginChange: (value: string) => void;
  handleProcessChange: (value: string) => void;
  handleRoastLevelChange: (value: string) => void;
  handleCupNoteChange: (value: string) => void;
  handleReset: () => void;
}

const CoffeeFilters: React.FC<CoffeeFiltersProps> = ({
  onClose,
  onApply: handleApply,
  brewMethods,
  origins,
  processes,
  roastLevels,
  cupNotes,
  selectedBrewMethods,
  selectedOrigins,
  selectedProcesses,
  selectedRoastLevels,
  selectedCupNotes,
  handleBrewMethodChange,
  handleOriginChange,
  handleProcessChange,
  handleRoastLevelChange,
  handleCupNoteChange,
  handleReset,
}) => {
  return (
    <div className="bg-white rounded-lg p-4 w-full max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Coffee Filters</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <FilterSection
          title="내 컵노트"
          options={cupNotes}
          selected={selectedCupNotes}
          onChange={handleCupNoteChange}
          className="text-[15px]"
        />

        <FilterSection
          title="추출방식"
          options={brewMethods}
          selected={selectedBrewMethods}
          onChange={handleBrewMethodChange}
          className="text-[15px]"
        />

        <FilterSection
          title="원산지"
          options={origins}
          selected={selectedOrigins}
          onChange={handleOriginChange}
          className="text-[15px]"
        />

        <FilterSection
          title="가공방식"
          options={processes}
          selected={selectedProcesses}
          onChange={handleProcessChange}
          className="text-[15px]"
        />

        <FilterSection
          title="로스팅레벨"
          options={roastLevels}
          selected={selectedRoastLevels}
          onChange={handleRoastLevelChange}
          className="text-[15px]"
        />
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={handleReset}
          className="text-[13px] font-medium text-gray-600 hover:text-gray-800"
        >
          Reset
        </button>
        <button
          onClick={handleApply}
          className="text-[13px] font-medium text-white bg-indigo-600 px-6 py-2 rounded-full hover:bg-indigo-700"
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default CoffeeFilters; 