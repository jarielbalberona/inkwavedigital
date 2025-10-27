import React, { useState } from 'react';
import { UserGroupIcon } from '@heroicons/react/24/outline';

interface PaxPromptProps {
  tableId: string;
  onConfirm: (pax: number) => void;
  onSkip: () => void;
}

export const PaxPrompt: React.FC<PaxPromptProps> = ({ tableId, onConfirm, onSkip }) => {
  const [pax, setPax] = useState<number>(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pax > 0) {
      onConfirm(pax);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <div className="text-center mb-6">
          <UserGroupIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h2>
          <p className="text-gray-600">
            You're seated at <span className="font-semibold">{tableId}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="pax" className="block text-sm font-medium text-gray-700 mb-2">
              How many people are dining?
            </label>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setPax(Math.max(1, pax - 1))}
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                disabled={pax <= 1}
              >
                <span className="text-lg font-medium">-</span>
              </button>
              
              <div className="flex-1 text-center">
                <input
                  type="number"
                  id="pax"
                  min="1"
                  max="20"
                  value={pax}
                  onChange={(e) => setPax(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center text-2xl font-bold border-none outline-none"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {pax === 1 ? 'person' : 'people'}
                </p>
              </div>
              
              <button
                type="button"
                onClick={() => setPax(Math.min(20, pax + 1))}
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                disabled={pax >= 20}
              >
                <span className="text-lg font-medium">+</span>
              </button>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onSkip}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Skip
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue
            </button>
          </div>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          This helps us prepare the right portions and serve you better
        </p>
      </div>
    </div>
  );
};
