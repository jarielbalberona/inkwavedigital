import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { QrCodeIcon, PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { QRCodeDisplay } from "./QRCodeDisplay";
import { TableForm, type TableFormData } from "./TableForm";
import { generateQRData } from "../hooks/helpers/qrHelpers";
import { useTablesQuery } from "../hooks/useTablesQuery";
import { useCreateTable } from "../hooks/useCreateTable";
import { useUpdateTable } from "../hooks/useUpdateTable";
import { useDeleteTable } from "../hooks/useDeleteTable";
import { venuesApi } from "../../venue-management/api/venuesApi";
import type { Table } from "../types/table.types";

interface TableManagementPageProps {
  venueId: string;
}

export const TableManagementPage: React.FC<TableManagementPageProps> = ({ venueId }) => {
  const [generatedTables, setGeneratedTables] = useState<Set<string>>(new Set());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [deletingTableId, setDeletingTableId] = useState<string | null>(null);
  
  const { data: tables, isLoading, error } = useTablesQuery(venueId);
  const { data: venueInfo, isLoading: isLoadingVenueInfo } = useQuery({
    queryKey: ["venueInfo", venueId],
    queryFn: () => venuesApi.getVenueInfo(venueId),
    enabled: !!venueId,
  });
  const createTable = useCreateTable();
  const updateTable = useUpdateTable(venueId);
  const deleteTable = useDeleteTable(venueId);

  const handleGenerateQR = (tableId: string) => {
    setGeneratedTables(prev => new Set([...prev, tableId]));
  };

  const handleGenerateAll = () => {
    if (tables) {
      setGeneratedTables(new Set(tables.map(table => table.id)));
    }
  };

  const handleCreateTable = async (data: TableFormData) => {
    try {
      await createTable.mutateAsync({
        venueId,
        ...data,
      });
      setIsFormOpen(false);
    } catch (error) {
      console.error("Failed to create table:", error);
    }
  };

  const handleUpdateTable = async (data: TableFormData) => {
    if (!editingTable) return;

    try {
      await updateTable.mutateAsync({
        id: editingTable.id,
        ...data,
      });
      setEditingTable(null);
      setIsFormOpen(false);
    } catch (error) {
      console.error("Failed to update table:", error);
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    if (!confirm("Are you sure you want to delete this table? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteTable.mutateAsync(tableId);
      setDeletingTableId(null);
      // Remove from generated QR codes if present
      setGeneratedTables(prev => {
        const newSet = new Set(prev);
        newSet.delete(tableId);
        return newSet;
      });
    } catch (error) {
      console.error("Failed to delete table:", error);
    }
  };

  const handleEditClick = (table: Table) => {
    setEditingTable(table);
    setIsFormOpen(true);
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setEditingTable(null);
  };

  if (isLoading || isLoadingVenueInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tables...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading tables: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Table Management</h1>
            <p className="text-gray-600">Manage your tables and generate QR codes</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleGenerateAll}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
            >
              <QrCodeIcon className="w-5 h-5 mr-2" />
              Generate All QR Codes
            </button>
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Table
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Create/Edit Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingTable ? "Edit Table" : "Create New Table"}
              </h2>
              <TableForm
                table={editingTable || undefined}
                venueId={venueId}
                onSubmit={editingTable ? handleUpdateTable : handleCreateTable}
                onCancel={handleCancelForm}
                isLoading={createTable.isPending || updateTable.isPending}
              />
            </div>
          </div>
        )}

        {!tables || tables.length === 0 ? (
          <div className="text-center py-12">
            <QrCodeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No tables found</p>
            <p className="text-sm text-gray-400 mb-4">Add tables to your venue to get started</p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Your First Table
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tables List */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Tables ({tables.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tables.map((table) => (
                  <div key={table.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-500">#{table.tableNumber}</span>
                          <h3 className="font-semibold text-gray-900">{table.label}</h3>
                        </div>
                        {table.name && (
                          <p className="text-sm text-gray-600">{table.name}</p>
                        )}
                        {table.capacity && (
                          <p className="text-sm text-gray-500">Capacity: {table.capacity} people</p>
                        )}
                        {table.description && (
                          <p className="text-xs text-gray-400 mt-1">{table.description}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                        table.isActive 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {table.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleGenerateQR(table.id)}
                        className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center text-sm"
                      >
                        <QrCodeIcon className="w-4 h-4 mr-1" />
                        QR Code
                      </button>
                      <button
                        onClick={() => handleEditClick(table)}
                        className="bg-blue-100 text-blue-700 py-2 px-3 rounded-md hover:bg-blue-200 transition-colors"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTable(table.id)}
                        disabled={deleteTable.isPending && deletingTableId === table.id}
                        className="bg-red-100 text-red-700 py-2 px-3 rounded-md hover:bg-red-200 transition-colors disabled:opacity-50"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Generated QR Codes */}
            {generatedTables.size > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Generated QR Codes ({generatedTables.size})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tables
                    .filter(table => generatedTables.has(table.id))
                    .map((table) => {
                      const qrUrl = venueInfo?.venue?.tenant?.slug && venueInfo?.venue?.slug
                        ? generateQRData(venueInfo.venue.tenant.slug, venueInfo.venue.slug, table.id, table.label)
                        : "";
                      return (
                        <QRCodeDisplay
                          key={table.id}
                          data={{
                            venueId: venueId,
                            tableId: table.id,
                            deviceId: `table-${table.id}`
                          }}
                          qrUrl={qrUrl}
                          title={`#${table.tableNumber} - ${table.label}`}
                          subtitle={table.name || "Table QR Code"}
                          showDownloadButtons={true}
                        />
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
