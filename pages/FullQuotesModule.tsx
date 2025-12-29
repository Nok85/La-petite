
import React, { useState, useEffect, useMemo } from 'react';
import { getQuotes, getInputs, getInputTypes, getInputFamilies } from '../services/api';
import { QuoteStatus } from '../types';
import { ArrowUpDown, ArrowUp, ArrowDown, Filter, Download } from 'lucide-react';

interface FlatQuoteRow {
    uniqueKey: string;
    quoteId: string;
    client: string;
    status: string;
    date: string;
    dietName: string;
    type: string;
    family: string;
    inputName: string;
    qty: number;
    unitPriceCorrected: number;
    subtotalCost: number;
    margin: number;
    sellingPrice: number;
}

type SortDirection = 'asc' | 'desc';

interface SortConfig {
    key: keyof FlatQuoteRow;
    direction: SortDirection;
}

export const FullQuotesModule: React.FC = () => {
    const [rows, setRows] = useState<FlatQuoteRow[]>([]);
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

    useEffect(() => {
        const quotes = getQuotes();
        const inputs = getInputs();
        const types = getInputTypes();
        const families = getInputFamilies();

        const flatData: FlatQuoteRow[] = [];

        quotes.forEach(quote => {
            const margin = quote.margin_simulation || 0;
            const marginDecimal = margin / 100;
            const factor = marginDecimal < 1 ? (1 / (1 - marginDecimal)) : 0;

            quote.diets.forEach(diet => {
                Object.entries(diet.items).forEach(([inputId, qty]) => {
                    if (!qty || qty <= 0) return;

                    const input = inputs.find(i => i.id === inputId);
                    if (!input) return; 

                    const type = types.find(t => t.id === input.tipo_insumo_id);
                    const family = families.find(f => f.id === input.familia_id);

                    const cost = qty * input.preco_corrigido;
                    const sellingPrice = cost * factor;

                    flatData.push({
                        uniqueKey: `${quote.id_cotacao}-${diet.id}-${input.id}`,
                        quoteId: quote.id_cotacao,
                        client: quote.cliente || 'N/A',
                        status: quote.status,
                        date: quote.data_criacao,
                        dietName: diet.name, 
                        type: type?.nome || 'Desc.',
                        family: family?.nome || 'Desc.',
                        inputName: input.insumo,
                        qty: qty,
                        unitPriceCorrected: input.preco_corrigido,
                        subtotalCost: cost,
                        margin: margin,
                        sellingPrice: sellingPrice
                    });
                });
            });
        });

        // Default Sort: Quote ID desc
        setRows(flatData.sort((a, b) => b.quoteId.localeCompare(a.quoteId)));
    }, []);

    // --- Sorting & Filtering Logic ---

    const processedRows = useMemo(() => {
        let result = [...rows];

        // 1. Filtering
        Object.keys(filters).forEach(key => {
            const val = filters[key].toLowerCase();
            if (!val) return;
            
            result = result.filter(row => {
                const rowValue = (row as any)[key];
                // Handle different types for filtering (numbers converted to string)
                const strVal = rowValue !== undefined && rowValue !== null ? String(rowValue).toLowerCase() : '';
                
                // Specific formatting for date filtering if user types "01/01"
                if (key === 'date') {
                    const dateStr = new Date(rowValue).toLocaleDateString();
                    return dateStr.includes(val);
                }

                return strVal.includes(val);
            });
        });

        // 2. Sorting
        if (sortConfig) {
            result.sort((a, b) => {
                const aVal = (a as any)[sortConfig.key];
                const bVal = (b as any)[sortConfig.key];

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [rows, filters, sortConfig]);

    const handleSort = (key: keyof FlatQuoteRow) => {
        let direction: SortDirection = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleFilterChange = (key: keyof FlatQuoteRow, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleExportExcel = () => {
        if (processedRows.length === 0) {
            alert("Não há dados para exportar com os filtros atuais.");
            return;
        }

        // CSV Headers
        const headers = [
            "Cotacao", "Data", "Cliente", "Status", "Dieta", "Tipo", "Familia", 
            "Insumo", "Quantidade", "Custo Unitario (R$)", "Custo Total (R$)", "Margem (%)", "Venda Total (R$)"
        ];
        
        // CSV Content - Using semicolon for better Excel integration in PT-BR regions
        const csvRows = processedRows.map(row => [
            row.quoteId,
            new Date(row.date).toLocaleDateString('pt-BR'),
            row.client,
            row.status,
            row.dietName,
            row.type,
            row.family,
            row.inputName,
            row.qty.toFixed(4).replace('.', ','),
            row.unitPriceCorrected.toFixed(2).replace('.', ','),
            row.subtotalCost.toFixed(2).replace('.', ','),
            row.margin.toFixed(2).replace('.', ','),
            row.sellingPrice.toFixed(2).replace('.', ',')
        ].map(val => `"${val}"`).join(';'));

        const csvContent = [headers.join(';'), ...csvRows].join('\n');

        // Add BOM (Byte Order Mark) for UTF-8 to ensure special characters open correctly in Excel
        const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `cotacoes_full_${new Date().toISOString().slice(0,10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- Helper for rendering headers ---
    const ThColumn = ({ label, field, align = 'left' }: { label: string, field: keyof FlatQuoteRow, align?: 'left'|'right'|'center' }) => {
        const isSorted = sortConfig?.key === field;
        return (
            <th className={`px-4 py-2 font-semibold uppercase tracking-wider bg-slate-800 text-white border-b border-slate-700 min-w-[120px]`}>
                <div className="flex flex-col gap-2">
                    {/* Sortable Header */}
                    <div 
                        className={`flex items-center gap-1 cursor-pointer hover:text-accent transition-colors ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start'}`}
                        onClick={() => handleSort(field)}
                    >
                        <span>{label}</span>
                        {isSorted ? (
                            sortConfig.direction === 'asc' ? <ArrowUp size={14}/> : <ArrowDown size={14}/>
                        ) : (
                            <ArrowUpDown size={14} className="text-slate-500 opacity-50"/>
                        )}
                    </div>
                    {/* Filter Input */}
                    <div className="relative">
                        <input 
                            type="text" 
                            className="w-full text-xs px-2 py-1 rounded border-none focus:ring-2 focus:ring-accent text-slate-900 font-normal placeholder-gray-400"
                            placeholder={`Filtrar...`}
                            value={filters[field] || ''}
                            onChange={(e) => handleFilterChange(field, e.target.value)}
                        />
                        <Filter size={10} className="absolute right-2 top-1.5 text-gray-400 pointer-events-none"/>
                    </div>
                </div>
            </th>
        );
    };

    const formatBRL = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const formatNumber = (val: number) => val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <div className="container mx-auto pb-10">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Cotações Full</h1>
                    <p className="text-gray-500 text-sm mt-1">Visão analítica detalhada com filtros e ordenação.</p>
                </div>
                <button 
                    onClick={handleExportExcel}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold shadow-md transition-all"
                >
                    <Download size={18} />
                    EXPORTAR PARA EXCEL
                </button>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
                <div className="overflow-x-auto max-h-[80vh]">
                    <table className="min-w-full text-sm divide-y divide-gray-200 relative">
                        <thead className="bg-slate-800 text-white sticky top-0 z-10 shadow-lg">
                            <tr>
                                <ThColumn label="Cotação" field="quoteId" />
                                <ThColumn label="Data" field="date" />
                                <ThColumn label="Cliente" field="client" />
                                <ThColumn label="Status" field="status" />
                                <ThColumn label="Dieta" field="dietName" />
                                <ThColumn label="Tipo" field="type" />
                                <ThColumn label="Família" field="family" />
                                <ThColumn label="Insumo" field="inputName" />
                                <ThColumn label="Qte" field="qty" align="right" />
                                <ThColumn label="Custo Un." field="unitPriceCorrected" align="right" />
                                <ThColumn label="Custo Total" field="subtotalCost" align="right" />
                                <ThColumn label="Margem" field="margin" align="center" />
                                <ThColumn label="Venda Total" field="sellingPrice" align="right" />
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {processedRows.map((row, index) => {
                                const isNewQuote = index > 0 && processedRows[index-1].quoteId !== row.quoteId;
                                return (
                                    <tr 
                                        key={row.uniqueKey} 
                                        className={`hover:bg-blue-50 transition-colors ${isNewQuote ? 'border-t-4 border-gray-100' : ''}`}
                                    >
                                        <td className="px-4 py-2 font-bold text-primary whitespace-nowrap">{row.quoteId}</td>
                                        <td className="px-4 py-2 text-gray-500 whitespace-nowrap">{new Date(row.date).toLocaleDateString()}</td>
                                        <td className="px-4 py-2 text-gray-700 font-medium whitespace-nowrap">{row.client}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold 
                                                ${row.status === QuoteStatus.OPEN ? 'text-green-600 bg-green-100' : 
                                                  row.status === QuoteStatus.LOST ? 'text-red-600 bg-red-100' : 'text-blue-600 bg-blue-100'}`}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 font-semibold text-slate-700 bg-gray-50">{row.dietName}</td>
                                        <td className="px-4 py-2 text-gray-500 text-xs uppercase">{row.type}</td>
                                        <td className="px-4 py-2 text-gray-500 text-xs uppercase">{row.family}</td>
                                        <td className="px-4 py-2 text-gray-800">{row.inputName}</td>
                                        <td className="px-4 py-2 text-right font-mono text-gray-600">{formatNumber(row.qty)}</td>
                                        <td className="px-4 py-2 text-right font-mono text-gray-500 text-xs">{formatBRL(row.unitPriceCorrected)}</td>
                                        <td className="px-4 py-2 text-right font-mono font-medium text-gray-700 bg-slate-50">{formatBRL(row.subtotalCost)}</td>
                                        <td className="px-4 py-2 text-center font-mono text-gray-600 bg-slate-50">{formatNumber(row.margin)}%</td>
                                        <td className="px-4 py-2 text-right font-mono font-bold text-blue-700 bg-blue-50">{formatBRL(row.sellingPrice)}</td>
                                    </tr>
                                );
                            })}
                            
                            {processedRows.length === 0 && (
                                <tr>
                                    <td colSpan={13} className="px-6 py-12 text-center text-gray-500">
                                        <p className="text-lg">Nenhum dado encontrado.</p>
                                        <p className="text-sm mt-2">Ajuste os filtros ou verifique se há cotações cadastradas.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="bg-gray-50 p-3 border-t text-xs text-gray-500 flex justify-between">
                    <span>Mostrando {processedRows.length} registro(s)</span>
                    <span>* Valores calculados com base na margem simulada no momento do salvamento.</span>
                </div>
            </div>
        </div>
    );
};
