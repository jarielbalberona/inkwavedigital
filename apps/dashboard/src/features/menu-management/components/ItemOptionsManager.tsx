import React, { useState } from "react";
import { PlusIcon, PencilIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { useItemOptionsQuery, useDeleteItemOption } from "../hooks";
import { ItemOptionForm } from "./ItemOptionForm";
import type { MenuItemOption } from "../types/menuManagement.types";

interface ItemOptionsManagerProps {
  itemId: string;
}

export const ItemOptionsManager: React.FC<ItemOptionsManagerProps> = ({ itemId }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<MenuItemOption | undefined>();
  const [expandedOptions, setExpandedOptions] = useState<Set<string>>(new Set());

  const { data, isLoading } = useItemOptionsQuery(itemId);
  const deleteOptionMutation = useDeleteItemOption();

  const toggleExpanded = (optionId: string) => {
    const newExpanded = new Set(expandedOptions);
    if (newExpanded.has(optionId)) {
      newExpanded.delete(optionId);
    } else {
      newExpanded.add(optionId);
    }
    setExpandedOptions(newExpanded);
  };

  const handleAddOption = () => {
    setEditingOption(undefined);
    setIsFormOpen(true);
  };

  const handleEditOption = (option: MenuItemOption) => {
    setEditingOption(option);
    setIsFormOpen(true);
  };

  const handleDeleteOption = async (optionId: string) => {
    if (confirm("Are you sure you want to delete this option? This will also delete all its values.")) {
      await deleteOptionMutation.mutateAsync(optionId);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingOption(undefined);
  };

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading options...</div>;
  }

  const options = data?.options || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Item Options</h3>
        <button
          type="button"
          onClick={handleAddOption}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <PlusIcon className="w-4 h-4" />
          Add Option
        </button>
      </div>

      {options.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-sm text-gray-500 mb-2">No options configured</p>
          <p className="text-xs text-gray-400">Add options like Size, Type, or Add-ons</p>
        </div>
      ) : (
        <div className="space-y-2">
          {options.map((option) => {
            const isExpanded = expandedOptions.has(option.id);
            return (
              <div key={option.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Option Header */}
                <div className="flex items-center justify-between p-4 bg-white hover:bg-gray-50">
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      type="button"
                      onClick={() => toggleExpanded(option.id)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      {isExpanded ? (
                        <ChevronUpIcon className="w-4 h-4 text-gray-600" />
                      ) : (
                        <ChevronDownIcon className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{option.name}</span>
                        {option.required && (
                          <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded">
                            Required
                          </span>
                        )}
                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
                          {option.type === "select" ? "Single Select" : "Multi Select"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {option.values.length} value{option.values.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditOption(option)}
                      className="p-2 text-gray-600 hover:bg-gray-200 rounded"
                      title="Edit option"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteOption(option.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Delete option"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Option Values (Expanded) */}
                {isExpanded && (
                  <div className="px-4 pb-4 bg-gray-50 border-t border-gray-200">
                    <div className="mt-3 space-y-1">
                      {option.values.map((value) => (
                        <div
                          key={value.id}
                          className="flex items-center justify-between py-2 px-3 bg-white rounded border border-gray-200"
                        >
                          <span className="text-sm text-gray-900">{value.label}</span>
                          <span className="text-sm text-gray-600">
                            {value.priceDelta === 0 ? (
                              <span className="text-gray-400">No change</span>
                            ) : (
                              <span className={value.priceDelta > 0 ? "text-green-600" : "text-red-600"}>
                                {value.priceDelta > 0 ? "+" : ""}${value.priceDelta.toFixed(2)}
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ItemOptionForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        itemId={itemId}
        option={editingOption}
      />
    </div>
  );
};

