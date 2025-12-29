import React, { useState, useEffect, useMemo } from 'react';
import { getQuotes } from '../services/api';
import { Quote, QuoteStatus } from '../types';
import { Filter, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

type SortDirection = 'asc' | 'desc';
interface SortConfig {
    key: keyof Quote;
    direction: SortDirection;
}

export const HistoryModule: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'data_criacao', direction: 'desc' });

  useEffect(() => {
    setQuotes(getQuotes());
  }, []);

  const handleSort = (key: keyof Quote) => {
      let direction: SortDirection = 'asc';
      if (sortConfig.key === key && sortConfig.direction === 'asc') {
          direction = 'desc';
      }
      setSortConfig({ key, direction });
  };

  const sortedAndFilteredQuotes = useMemo(() => {
      let result = [...quotes];
      
      // Filter
      if (filterStatus) {
          result = result.filter(q => q.status === filterStatus);
      }

      // Sort
      result.sort((a, b) => {
          const aVal = a[sortConfig.key] || '';
          const bVal = b[sortConfig.key] || '';

          if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
      });

      return result;
  }, [quotes, filterStatus, sortConfig]);

  const ThSortable = ({ label, field }: { label: string, field: keyof Quote }) => {
      const isSorted = sortConfig.key === field;
      return (
          <th 
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors group select-none"
            onClick={() => handleSort(field)}
          >
              <div className="flex items-center gap-1">
                  {label}
                  {isSorted ? (
                      sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-accent"/> : <ArrowDown size={14} className="text-accent"/>
                  ) : (
                      <ArrowUpDown size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"/>
                  )}
              </div>
          </th>
      )
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Histórico de Cotações</h1>

      <div className="bg-white p-4 rounded-lg shadow mb-6 flex gap-4 items-center">
          <Filter className="text-gray-400" />
          <select 
            className="border border-gray-300 p-2 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-accent"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
              <option value="">Todos os Status</option>
              {Object.values(QuoteStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="text-sm text-gray-500 ml-auto">
              Total: <strong>{sortedAndFilteredQuotes.length}</strong> cotações
          </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <ThSortable label="ID" field="id_cotacao" />
              <ThSortable label="Data" field="data_criacao" />
              <ThSortable label="Cliente" field="cliente" />
              <ThSortable label="Status" field="status" />
              <ThSortable label="Motivo Perda" field="motivo_perda" />
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Observações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedAndFilteredQuotes.map((q) => (
              <tr key={q.id_cotacao} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">{q.id_cotacao}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(q.data_criacao).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">{q.cliente || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full 
                        ${q.status === QuoteStatus.OPEN ? 'bg-green-100 text-green-800' : 
                          q.status === QuoteStatus.LOST ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                        {q.status}
                    </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">{q.motivo_perda || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs" title={q.observacoes}>{q.observacoes || '-'}</td>
              </tr>
            ))}
            {sortedAndFilteredQuotes.length === 0 && (
                <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Nenhuma cotação encontrada.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};