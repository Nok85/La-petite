
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getInputs, getInputTypes, generateQuoteId, saveQuote, getQuoteById, getQuotes } from '../services/api';
import { InputItem, InputType, QuoteStatus, LostReason, Quote } from '../types';
import { Save, Eraser, PlusCircle, Calculator, Lock, Unlock, AlertTriangle, X, CheckCircle, AlertCircle, FolderOpen, Calendar, Package } from 'lucide-react';

// --- Helper Component for Inputs ---
interface DietInputProps {
    value: number;
    disabled: boolean;
    onChange: (val: number) => void;
    bgColor?: string;
    className?: string;
}

const DietInput: React.FC<DietInputProps> = ({ value, disabled, onChange, bgColor, className = "" }) => {
    const [localValue, setLocalValue] = useState('');

    useEffect(() => {
        if (value > 0) {
            setLocalValue(value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
        } else if (value === 0) {
            setLocalValue('');
        }
    }, [value]);

    const handleBlur = () => {
        let clean = localValue.replace(/\./g, '').replace(',', '.');
        if (isNaN(Number(clean))) clean = "0";
        const num = parseFloat(clean) || 0;
        onChange(num);
        if (num > 0) {
            setLocalValue(num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
        } else {
            setLocalValue('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur();
        }
    };

    return (
        <input 
            type="text"
            disabled={disabled}
            className={`w-full text-right px-1 py-1 rounded outline-none focus:ring-2 focus:ring-accent text-sm transition-all ${!disabled ? 'bg-white border border-gray-300 text-slate-900 font-bold' : 'bg-transparent text-gray-500 cursor-not-allowed'} ${className}`}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "-" : ""}
        />
    );
};

// Generic Styled Input for simple numbers (Margins, Proportions)
const SimpleStyledInput: React.FC<{ value: number, onChange: (val: number) => void, disabled: boolean, placeholder?: string }> = ({ value, onChange, disabled, placeholder }) => {
    return (
        <input 
            type="number"
            disabled={disabled}
            value={value === 0 ? '' : value}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            placeholder={placeholder || "-"}
            className={`w-full text-right px-2 py-1 rounded outline-none focus:ring-2 focus:ring-accent text-sm transition-all border ${!disabled ? 'bg-white border-gray-300 text-slate-900 font-bold' : 'bg-transparent border-transparent text-gray-500 cursor-not-allowed'}`}
        />
    );
};

export const BudgetModule: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [inputs, setInputs] = useState<InputItem[]>([]);
  const [types, setTypes] = useState<InputType[]>([]);
  
  // App Logic State
  const [isEditing, setIsEditing] = useState(false); 
  
  // Modais
  const [showClearModal, setShowClearModal] = useState(false);
  const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);       
  const [showLoadSuccessModal, setShowLoadSuccessModal] = useState(false); 
  const [searchIdInput, setSearchIdInput] = useState('');              

  // Quote Data State
  const [quoteId, setQuoteId] = useState('');
  const [quoteStatus, setQuoteStatus] = useState<QuoteStatus>(QuoteStatus.OPEN);
  const [lostReason, setLostReason] = useState<LostReason | undefined>(undefined);
  const [observations, setObservations] = useState('');
  
  // Margin per Diet
  const [dietMargins, setDietMargins] = useState<number[]>([40, 40, 40, 40]); 
  
  const [clientName, setClientName] = useState('');
  const [dietValues, setDietValues] = useState<Record<string, number[]>>({});
  
  // Supply Package States (Proportions)
  const [propSemanal, setPropSemanal] = useState<number[]>([0, 0, 0, 0]);
  const [propQuinzenal, setPropQuinzenal] = useState<number[]>([0, 0, 0, 0]);
  const [propMensal, setPropMensal] = useState<number[]>([0, 0, 0, 0]);
  const [propPersonalizado, setPropPersonalizado] = useState<number[]>([0, 0, 0, 0]);
  const [customDays, setCustomDays] = useState<number>(30);

  useEffect(() => {
    setInputs(getInputs());
    setTypes(getInputTypes());
    
    const loadId = searchParams.get('id');
    if (loadId) {
        const existing = getQuoteById(loadId);
        if (existing) {
            loadQuoteIntoState(existing);
        }
    }
  }, [searchParams]);

  // --- ACTIONS ---

  const handleNewQuote = () => {
      if (isEditing && quoteId) {
          if (!window.confirm("Já existe uma edição em andamento. Deseja iniciar um novo orçamento e perder as alterações não salvas?")) {
              return;
          }
      }
      setDietValues({});
      setPropSemanal([0,0,0,0]);
      setPropQuinzenal([0,0,0,0]);
      setPropMensal([0,0,0,0]);
      setPropPersonalizado([0,0,0,0]);
      setDietMargins([40, 40, 40, 40]);
      setObservations('');
      setClientName('');
      setLostReason(undefined);
      setQuoteStatus(QuoteStatus.OPEN);
      const newId = generateQuoteId();
      setQuoteId(newId);
      setIsEditing(true);
      setSearchParams({});
  };

  const handleOpenSearch = () => {
      setSearchIdInput('');
      setShowSearchModal(true);
  };

  const handleExecuteLoad = () => {
      const existingQuote = getQuoteById(searchIdInput.trim());
      if (existingQuote) {
          loadQuoteIntoState(existingQuote);
          setSearchParams({ id: existingQuote.id_cotacao });
          setShowSearchModal(false);
          setShowLoadSuccessModal(true); 
      } else {
          alert("Cotação não encontrada.");
      }
  };

  const handleClearClick = () => setShowClearModal(true);
  const confirmClear = () => {
    setDietValues({});
    setPropSemanal([0,0,0,0]);
    setPropQuinzenal([0,0,0,0]);
    setPropMensal([0,0,0,0]);
    setPropPersonalizado([0,0,0,0]);
    setDietMargins([40, 40, 40, 40]);
    setObservations('');
    setClientName('');
    setShowClearModal(false);
  };

  const handleSaveClick = () => {
    if (!clientName?.trim()) {
        setValidationMessage("O campo 'Nome do Cliente' é obrigatório.");
        setShowValidationModal(true);
        return;
    }
    setShowSaveConfirmModal(true);
  };

  const confirmSave = () => {
    const creationDate = getQuoteById(quoteId)?.data_criacao || new Date().toISOString();
    const diets = [0,1,2,3].map(i => ({
        id: i+1,
        name: `Dieta ${i+1}`,
        items: Object.entries(dietValues).reduce((acc, [itemId, amounts]) => {
            if(amounts[i] > 0) acc[itemId] = amounts[i];
            return acc;
        }, {} as Record<string, number>)
    }));

    const quote: Quote = {
        id_cotacao: quoteId,
        cliente: clientName,
        data_criacao: creationDate,
        status: quoteStatus,
        motivo_perda: lostReason,
        observacoes: observations,
        diets,
        margin_simulation: dietMargins[0] 
    };
    
    saveQuote(quote);
    setShowSaveConfirmModal(false);
    setIsEditing(false); 
    window.alert("Cotação salva com sucesso!");
  };

  const loadQuoteIntoState = (q: Quote) => {
      setQuoteId(q.id_cotacao);
      setQuoteStatus(q.status);
      setObservations(q.observacoes || '');
      setLostReason(q.motivo_perda);
      setDietMargins([q.margin_simulation || 40, q.margin_simulation || 40, q.margin_simulation || 40, q.margin_simulation || 40]);
      setClientName(q.cliente || '');
      
      const newValues: Record<string, number[]> = {};
      q.diets.forEach((d, index) => {
          Object.entries(d.items).forEach(([itemId, amount]) => {
              if(!newValues[itemId]) newValues[itemId] = [0,0,0,0];
              newValues[itemId][index] = amount;
          });
      });
      setDietValues(newValues);
      setIsEditing(true); 
  }

  // --- Calculations ---
  
  const formatBRL = (val: number) => val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatBRLDash = (val: number) => val === 0 ? '- ' : formatBRL(val);

  const handleDietChange = (itemId: string, dietIndex: number, newValue: number) => {
      setDietValues(prev => {
          const row = prev[itemId] ? [...prev[itemId]] : [0,0,0,0];
          row[dietIndex] = newValue;
          return { ...prev, [itemId]: row };
      });
  };

  const handleMarginChange = (dietIndex: number, newValue: number) => {
      setDietMargins(prev => {
          const next = [...prev];
          next[dietIndex] = newValue;
          return next;
      });
  };

  const calculateDietDetails = (dietIndex: number) => {
      let totalWeight = 0;
      let totalCost = 0;
      const usedItems: string[] = [];

      inputs.forEach(input => {
          const amount = dietValues[input.id]?.[dietIndex] || 0;
          if (amount > 0) {
              totalWeight += amount;
              totalCost += amount * input.preco_corrigido;
              usedItems.push(`${input.insumo} - ${formatBRL(amount)}`);
          }
      });

      const currentMargin = dietMargins[dietIndex];
      const marginDecimal = currentMargin / 100;
      const sellingPrice = marginDecimal < 1 ? totalCost / (1 - marginDecimal) : totalCost;
      const pricePerKg = totalWeight > 0 ? (sellingPrice / (totalWeight / 1000)) : 0;
      const description = usedItems.length > 0 ? usedItems.join(' / ') : '';
      
      return { totalWeight, totalCost, sellingPrice, pricePerKg, description };
  };

  const dietSummaries = [0,1,2,3].map(i => calculateDietDetails(i));
  
  const totalPropSemanal = propSemanal.reduce((a, b) => a + b, 0);
  const totalPropQuinzenal = propQuinzenal.reduce((a, b) => a + b, 0);
  const totalPropMensal = propMensal.reduce((a, b) => a + b, 0);
  const totalPropPersonalizado = propPersonalizado.reduce((a, b) => a + b, 0);

  const packageRows = [0,1,2,3].map(i => {
      const { sellingPrice, totalCost, pricePerKg, description } = dietSummaries[i];
      const pS = propSemanal[i];
      const pQ = propQuinzenal[i];
      const pM = propMensal[i];
      const pP = propPersonalizado[i];

      const weekly = sellingPrice * pS;
      const fortnightly = sellingPrice * pQ;
      const personalized = sellingPrice * pP;

      return {
          id: i + 1,
          cost: totalCost,
          pricePerDiet: sellingPrice,
          pricePerKg,
          description,
          pS, pQ, pM, pP,
          weekly,
          fortnightly,
          personalized
      };
  });

  const packageTotals = packageRows.reduce((acc, row) => ({
      weekly: acc.weekly + row.weekly,
      fortnightly: acc.fortnightly + row.fortnightly,
      personalized: acc.personalized + row.personalized,
  }), { weekly: 0, fortnightly: 0, personalized: 0 });

  const inputsByType = useMemo(() => {
      const groups: Record<string, InputItem[]> = {};
      inputs.forEach(i => {
          if(!groups[i.tipo_insumo_id]) groups[i.tipo_insumo_id] = [];
          groups[i.tipo_insumo_id].push(i);
      });
      return groups;
  }, [inputs]);

  const dietColors = [
      { bg: 'bg-blue-50', text: 'text-blue-800' },
      { bg: 'bg-green-50', text: 'text-green-800' },
      { bg: 'bg-orange-50', text: 'text-orange-800' },
      { bg: 'bg-purple-50', text: 'text-purple-800' },
  ];

  return (
    <div className="container mx-auto pb-20">
      
      {/* Modais */}
      {showSearchModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2"><FolderOpen className="text-slate-600" size={20}/><h3 className="text-lg font-bold">Carregar Cotação</h3></div>
                    <button onClick={() => setShowSearchModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                </div>
                <div className="p-6">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Selecione:</label>
                    <select className="w-full border border-gray-400 rounded p-2.5 bg-white text-base shadow-sm" value={searchIdInput} onChange={(e) => setSearchIdInput(e.target.value)}>
                        <option value="">-- Selecione --</option>
                        {getQuotes().map(q => <option key={q.id_cotacao} value={q.id_cotacao}>{q.id_cotacao} - {q.cliente || 'S/ Nome'}</option>)}
                    </select>
                </div>
                <div className="bg-slate-50 p-4 flex gap-3 justify-end border-t">
                    <button onClick={() => setShowSearchModal(false)} className="px-4 py-2 border rounded text-gray-700">Cancelar</button>
                    <button onClick={handleExecuteLoad} className="px-4 py-2 bg-blue-600 text-white rounded font-bold">Carregar</button>
                </div>
            </div>
        </div>
      )}

      {showClearModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                <h3 className="text-lg font-bold mb-4">Limpar Tudo?</h3>
                <p className="text-gray-600 mb-6">Todas as informações da cotação atual serão removidas da tela.</p>
                <div className="flex justify-end gap-3">
                    <button onClick={() => setShowClearModal(false)} className="px-4 py-2 border rounded">Não</button>
                    <button onClick={confirmClear} className="px-4 py-2 bg-red-600 text-white rounded font-bold">Sim, Limpar</button>
                </div>
            </div>
        </div>
      )}

      {showSaveConfirmModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                <h3 className="text-lg font-bold mb-4">Salvar Cotação</h3>
                <p className="text-gray-600 mb-6">Deseja salvar a cotação <strong>{quoteId}</strong> para <strong>{clientName}</strong>?</p>
                <div className="flex justify-end gap-3">
                    <button onClick={() => setShowSaveConfirmModal(false)} className="px-4 py-2 border rounded">Cancelar</button>
                    <button onClick={confirmSave} className="px-4 py-2 bg-primary text-white rounded font-bold">Salvar Agora</button>
                </div>
            </div>
        </div>
      )}

      {showValidationModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 text-center">
                <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                <h3 className="text-lg font-bold mb-2">Atenção</h3>
                <p className="text-gray-600 mb-6">{validationMessage}</p>
                <button onClick={() => setShowValidationModal(false)} className="px-6 py-2 bg-slate-800 text-white rounded font-bold">Entendi</button>
            </div>
        </div>
      )}

      {showLoadSuccessModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-sm p-6 text-center">
                <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-bold mb-4">Carregado!</h3>
                <button onClick={() => setShowLoadSuccessModal(false)} className="w-full px-4 py-2 bg-green-600 text-white rounded font-bold">Continuar</button>
            </div>
        </div>
      )}
      
      {/* Header Panel */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 border-b-2 border-primary sticky top-0 z-[50]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-col gap-2 w-full md:w-auto flex-1">
                <div className="flex items-center gap-4 h-8">
                    {quoteId ? (
                        <>
                            <h2 className="text-2xl font-bold text-primary">{quoteId}</h2>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-1 rounded-full text-white ${quoteStatus === QuoteStatus.OPEN ? 'bg-green-500' : 'bg-red-500'}`}>{quoteStatus}</span>
                                {isEditing ? <Unlock size={16} className="text-green-600"/> : <Lock size={16} className="text-red-400"/>}
                            </div>
                        </>
                    ) : <span className="text-gray-400 italic text-sm">Inicie uma nova cotação</span>}
                </div>
                <div className="flex items-center">
                    <label className="text-sm font-bold text-gray-700 mr-2 w-16">Cliente:</label>
                    <input 
                      type="text" 
                      value={clientName} 
                      disabled={!isEditing} 
                      onChange={(e) => setClientName(e.target.value)} 
                      className="border border-slate-300 bg-white rounded px-3 py-1.5 text-sm w-full md:w-96 disabled:bg-gray-100 text-slate-900 font-bold focus:ring-1 focus:ring-accent outline-none shadow-sm transition-all" 
                      placeholder="Nome do Cliente" 
                    />
                </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
                <button onClick={handleOpenSearch} className="flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded font-medium"><FolderOpen size={18} className="mr-2"/> CARREGAR</button>
                <button onClick={handleNewQuote} className="flex items-center px-4 py-2 bg-slate-200 rounded font-medium"><PlusCircle size={18} className="mr-2"/> NOVA</button>
                <button onClick={handleClearClick} disabled={!isEditing} className="flex items-center px-4 py-2 bg-yellow-100 text-yellow-700 rounded font-medium disabled:opacity-50"><Eraser size={18} className="mr-2"/> LIMPAR</button>
                <button onClick={handleSaveClick} disabled={!isEditing} className="flex items-center px-6 py-2 bg-primary text-white rounded font-bold disabled:opacity-50"><Save size={18} className="mr-2"/> SALVAR</button>
            </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Table Area */}
        <div className="xl:col-span-3 space-y-6">
           
           {/* Matrix Table */}
           <div className="bg-white shadow rounded-lg overflow-hidden border">
              <div className="p-3 bg-slate-800 text-white flex items-center justify-between">
                  <h3 className="font-bold flex items-center text-sm uppercase tracking-wider"><Calculator className="mr-2 text-accent" size={18}/> Composição de Dietas</h3>
              </div>
              <div className="overflow-x-auto">
                  <table className="min-w-full text-xs">
                      <thead>
                          <tr className="bg-slate-100 border-b">
                              <th className="p-2 text-left sticky left-0 bg-slate-100 z-10 w-48 border-r">Insumo</th>
                              <th className="p-2 text-right w-20 border-r">R$ / Un</th>
                              {[0,1,2,3].map(i => (
                                  <th key={i} colSpan={2} className={`p-2 text-center border-r font-bold ${dietColors[i].bg} ${dietColors[i].text}`}>Dieta {i+1}</th>
                              ))}
                          </tr>
                          <tr className="bg-white border-b text-[10px] text-gray-500">
                              <th className="p-1 sticky left-0 bg-white z-10 border-r"></th>
                              <th className="p-1 border-r"></th>
                              {[0,1,2,3].map(i => (
                                  <React.Fragment key={i}>
                                      <th className="p-1 text-center w-16 border-r border-dotted font-medium">QTE</th>
                                      <th className="p-1 text-right w-20 border-r font-medium">SUBTOTAL</th>
                                  </React.Fragment>
                              ))}
                          </tr>
                      </thead>
                      <tbody>
                          {types.map(type => {
                              const typeInputs = inputsByType[type.id] || [];
                              if (typeInputs.length === 0) return null;
                              return (
                                  <React.Fragment key={type.id}>
                                      <tr className="bg-slate-200 font-bold text-[10px] uppercase">
                                          <td colSpan={10} className="px-3 py-1 border-b border-slate-300 text-slate-700">{type.nome}</td>
                                      </tr>
                                      {typeInputs.map(item => {
                                          const itemValues = dietValues[item.id] || [0,0,0,0];
                                          return (
                                              <tr key={item.id} className="border-b hover:bg-slate-50 h-10">
                                                  <td className="p-1.5 pl-3 sticky left-0 bg-white border-r text-gray-700 font-bold uppercase">{item.insumo}</td>
                                                  <td className="p-1.5 text-right border-r text-gray-500">{formatBRL(item.preco_corrigido)}</td>
                                                  {[0,1,2,3].map(dIdx => {
                                                      const qty = itemValues[dIdx];
                                                      const sub = qty * item.preco_corrigido;
                                                      return (
                                                        <React.Fragment key={dIdx}>
                                                            <td className="p-1 border-r border-dotted">
                                                                <DietInput value={qty} disabled={!isEditing} onChange={(val) => handleDietChange(item.id, dIdx, val)} bgColor={dietColors[dIdx].bg} />
                                                            </td>
                                                            <td className={`p-1 text-right border-r font-bold ${sub > 0 ? 'text-slate-900' : 'text-gray-200'}`}>
                                                                {sub > 0 ? formatBRL(sub) : '0,00'}
                                                            </td>
                                                        </React.Fragment>
                                                      )
                                                  })}
                                              </tr>
                                          );
                                      })}
                                  </React.Fragment>
                              );
                          })}
                      </tbody>
                  </table>
              </div>
           </div>

           {/* Supply Package Summary Table */}
           <div className="bg-white shadow rounded-lg overflow-hidden border">
                <div className="bg-[#064e3b] text-white p-3 flex items-center justify-between border-b h-14">
                    <h3 className="font-bold flex items-center text-sm uppercase tracking-wider"><Package className="mr-2" size={18}/> Pacote de Fornecimento La Petite</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-[11px] text-center border-collapse table-fixed">
                        <colgroup>
                            <col className="w-16" /> {/* ID */}
                            <col className="w-80" /> {/* Dieta Desc */}
                            <col className="w-40" /> {/* Margem % - Increased for better visibility */}
                            <col className="w-32" /> {/* Custo */}
                            <col className="w-32" /> {/* Preço por dieta */}
                            <col className="w-32" /> {/* Preço por Kg */}
                            <col className="w-32" /> {/* Semanal */}
                            <col className="w-32" /> {/* Quinzenal */}
                            <col className="w-32" /> {/* Personalizado */}
                            <col className="w-28" /> {/* Prop Semanal */}
                            <col className="w-28" /> {/* Prop Quinzenal */}
                            <col className="w-28" /> {/* Prop Mensal */}
                            <col className="w-28" /> {/* Prop Personalizada */}
                        </colgroup>
                        <thead>
                            <tr className="bg-slate-100 text-slate-700 font-bold border-b border-gray-300">
                                <th className="p-4 border-r">Dieta</th>
                                <th className="p-4 border-r text-left">Dieta</th>
                                <th className="p-4 border-r bg-blue-50 text-blue-900">Margem (%)</th>
                                <th className="p-4 border-r text-left">Custo</th>
                                <th className="p-4 border-r text-left">Preço por dieta</th>
                                <th className="p-4 border-r text-left">Preço por Kg</th>
                                <th className="p-4 border-r text-left">Semanal</th>
                                <th className="p-4 border-r text-left">Quinzenal</th>
                                <th className="p-4 border-r text-left">Personalizado</th>
                                <th className="p-4 border-r bg-[#86efac] text-green-900">Proporção Semanal</th>
                                <th className="p-4 border-r bg-[#86efac] text-green-900">Proporção Quinzenal</th>
                                <th className="p-4 border-r bg-[#86efac] text-green-900">Proporção Mensal</th>
                                <th className="p-4 bg-[#86efac] text-green-900 font-black">Proporção Personalizada</th>
                            </tr>
                        </thead>
                        <tbody>
                            {packageRows.map((row, idx) => (
                                <tr key={row.id} className={`border-b border-gray-200 hover:bg-slate-50 transition-all ${idx % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]'}`}>
                                    <td className="p-8 font-bold text-gray-800 border-r">{row.id}</td>
                                    <td className="p-8 text-left font-medium text-slate-600 border-r italic text-[10px] leading-tight overflow-hidden text-ellipsis whitespace-nowrap">
                                        {row.description}
                                    </td>
                                    <td className="p-4 border-r bg-white">
                                        <SimpleStyledInput 
                                            value={dietMargins[idx]} 
                                            onChange={(val) => handleMarginChange(idx, val)} 
                                            disabled={!isEditing} 
                                            placeholder="40"
                                        />
                                    </td>
                                    <td className="p-8 text-left border-r text-gray-700 font-bold uppercase whitespace-nowrap">R$ {formatBRLDash(row.cost)}</td>
                                    <td className="p-8 text-left border-r font-bold text-gray-700 uppercase whitespace-nowrap">R$ {formatBRLDash(row.pricePerDiet)}</td>
                                    <td className="p-8 text-left border-r text-gray-700 font-bold uppercase whitespace-nowrap">R$ {formatBRLDash(row.pricePerKg)}</td>
                                    <td className="p-8 text-left border-r font-bold text-gray-700 uppercase whitespace-nowrap">R$ {formatBRLDash(row.weekly)}</td>
                                    <td className="p-8 text-left border-r font-bold text-gray-700 uppercase whitespace-nowrap">R$ {formatBRLDash(row.fortnightly)}</td>
                                    <td className="p-8 text-left border-r font-bold text-gray-700 uppercase whitespace-nowrap">R$ {formatBRLDash(row.personalized)}</td>
                                    <td className="p-4 border-r bg-white">
                                        <SimpleStyledInput 
                                            value={row.pS} 
                                            onChange={(val) => {
                                                const n = [...propSemanal]; n[idx] = val; setPropSemanal(n);
                                            }}
                                            disabled={!isEditing}
                                        />
                                    </td>
                                    <td className="p-4 border-r bg-white">
                                        <SimpleStyledInput 
                                            value={row.pQ} 
                                            onChange={(val) => {
                                                const n = [...propQuinzenal]; n[idx] = val; setPropQuinzenal(n);
                                            }}
                                            disabled={!isEditing}
                                        />
                                    </td>
                                    <td className="p-4 border-r bg-white">
                                        <SimpleStyledInput 
                                            value={row.pM} 
                                            onChange={(val) => {
                                                const n = [...propMensal]; n[idx] = val; setPropMensal(n);
                                            }}
                                            disabled={!isEditing}
                                        />
                                    </td>
                                    <td className="p-4 bg-white">
                                        <SimpleStyledInput 
                                            value={row.pP} 
                                            onChange={(val) => {
                                                const n = [...propPersonalizado]; n[idx] = val; setPropPersonalizado(n);
                                            }}
                                            disabled={!isEditing}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-[#ea580c] text-white font-bold border-t-2 border-gray-300">
                                <td colSpan={6} className="p-4 border-r"></td>
                                <td className="p-4 text-left uppercase border-r font-black whitespace-nowrap">R$ {formatBRLDash(packageTotals.weekly)}</td>
                                <td className="p-4 text-left uppercase border-r font-black whitespace-nowrap">R$ {formatBRLDash(packageTotals.fortnightly)}</td>
                                <td className="p-4 text-left uppercase border-r font-black whitespace-nowrap">R$ {formatBRLDash(packageTotals.personalized)}</td>
                                <td className="p-4 border-r bg-black/10 text-sm font-black">{totalPropSemanal}</td>
                                <td className="p-4 border-r bg-black/10 text-sm font-black">{totalPropQuinzenal}</td>
                                <td className="p-4 border-r bg-black/10 text-sm font-black">{totalPropMensal}</td>
                                <td className="p-4 bg-black/10 text-sm font-black">{totalPropPersonalizado}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
           </div>

        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-5 border shadow-md">
                <h3 className="font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2 text-sm uppercase tracking-wider"><Calculator size={18}/> Margem de Venda</h3>
                <div className="flex flex-col gap-2">
                    <p className="text-[10px] text-gray-400 mb-2 leading-tight">Defina a margem individualmente na tabela de Pacote de Fornecimento.</p>
                    <div className="p-3 bg-slate-50 rounded border border-slate-200">
                        <div className="flex justify-between items-center text-xs">
                           <span className="font-bold text-slate-600">Média Calculada:</span>
                           <span className="font-black text-slate-900">{(dietMargins.reduce((a,b)=>a+b,0)/4).toFixed(1)}%</span>
                        </div>
                    </div>
                    <p className="text-[9px] text-gray-400 mt-2 italic leading-tight">A venda é calculada como Custo / (1 - Margem %)</p>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg p-5 border">
                <h3 className="font-bold text-slate-800 mb-2 border-b pb-2 text-sm uppercase tracking-wider">Observações</h3>
                <textarea 
                    disabled={!isEditing} 
                    className="w-full border border-slate-300 bg-white rounded-lg p-3 text-sm min-h-[100px] focus:ring-2 focus:ring-accent outline-none disabled:bg-gray-50 text-slate-900 font-bold transition-all shadow-sm" 
                    value={observations} 
                    onChange={(e) => setObservations(e.target.value)} 
                    placeholder="Notas internas..."
                ></textarea>
                {quoteStatus === QuoteStatus.LOST && lostReason && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded text-red-700 text-xs font-bold">
                        <span className="font-black block mb-1 uppercase tracking-wider">Motivo Perda:</span>
                        {lostReason}
                    </div>
                )}
            </div>

            <div className="bg-white shadow rounded-lg p-5 border border-slate-200 shadow-lg">
                <h3 className="font-bold border-b border-slate-100 pb-2 mb-4 text-xs uppercase tracking-widest text-slate-500">Resumo de Investimento</h3>
                <div className="space-y-5">
                    <div className="flex justify-between items-end">
                        <span className="text-sm text-slate-400 font-bold">Total Semanal:</span>
                        <span className="text-xl font-black text-slate-800 uppercase">R$ {formatBRLDash(packageTotals.weekly)}</span>
                    </div>
                    <div className="flex justify-between items-end border-t border-slate-50 pt-3">
                        <span className="text-sm text-slate-400 font-bold">Total Quinzenal:</span>
                        <span className="text-xl font-black text-slate-800 uppercase">R$ {formatBRLDash(packageTotals.fortnightly)}</span>
                    </div>
                    <div className="flex justify-between items-end border-t border-slate-100 pt-4 bg-slate-50 -mx-5 px-5 pb-3">
                        <div className="flex flex-col">
                            <span className="text-xs text-slate-400 font-bold">Período {customDays}d:</span>
                            <span className="text-2xl font-black text-primary uppercase mt-1">R$ {formatBRLDash(packageTotals.personalized)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};
