import React, { useState, useEffect } from 'react';
import { getInputs, saveInput, deleteInput, getInputTypes, getInputFamilies, saveInputType, saveInputFamily } from '../services/api';
import { InputItem, InputType, InputFamily } from '../types';
import { Plus, Trash2, Edit2 } from 'lucide-react';

export const InputsModule: React.FC = () => {
  const [items, setItems] = useState<InputItem[]>([]);
  const [types, setTypes] = useState<InputType[]>([]);
  const [families, setFamilies] = useState<InputFamily[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<InputItem>>({});
  
  // Local state for text inputs of Type and Family
  const [typeSearch, setTypeSearch] = useState('');
  const [familySearch, setFamilySearch] = useState('');

  // Local state for numeric inputs (as strings to handle comma typing)
  const [strQte, setStrQte] = useState('');
  const [strPerda, setStrPerda] = useState('');
  const [strPreco, setStrPreco] = useState('');

  const loadData = () => {
    setItems(getInputs());
    setTypes(getInputTypes());
    setFamilies(getInputFamilies());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Helper to parse "1.000,00" or "10,5" to number
  const parseBRL = (val: string) => {
      if (!val) return 0;
      // Remove thousands separator (.), replace decimal (,) with (.)
      const clean = val.replace(/\./g, '').replace(',', '.');
      return parseFloat(clean) || 0;
  };

  // Helper to format number to BRL string for inputs
  const formatBRLInput = (val?: number) => {
      if (val === undefined || val === null) return '';
      // Use toLocaleString but ensure we get the comma
      return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleSave = () => {
    // Parse strings back to numbers
    const qte = parseBRL(strQte);
    const perda = parseBRL(strPerda);
    const preco = parseBRL(strPreco);

    if (!typeSearch || !familySearch || !currentItem.insumo || preco === undefined) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    // Resolve Type ID (Find or Create)
    const typeId = saveInputType(typeSearch);
    
    // Resolve Family ID (Find or Create)
    const familyId = saveInputFamily(familySearch, typeId);

    // Save Input
    saveInput({ 
        ...currentItem, 
        qte_unitaria: qte,
        perda: perda,
        preco: preco,
        tipo_insumo_id: typeId, 
        familia_id: familyId 
    } as InputItem);

    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza de que deseja excluir este registro?")) {
      deleteInput(id);
      loadData();
    }
  };

  const handleEdit = (item: InputItem) => {
    setCurrentItem({ ...item });
    const typeName = types.find(t => t.id === item.tipo_insumo_id)?.nome || '';
    const familyName = families.find(f => f.id === item.familia_id)?.nome || '';
    setTypeSearch(typeName);
    setFamilySearch(familyName);
    
    // Init string states
    setStrQte(formatBRLInput(item.qte_unitaria));
    setStrPerda(formatBRLInput(item.perda));
    setStrPreco(formatBRLInput(item.preco));

    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setCurrentItem({
      insumo: ''
    });
    setStrQte('0,00');
    setStrPerda('0,00');
    setStrPreco('0,00');
    setTypeSearch('');
    setFamilySearch('');
    setIsModalOpen(true);
  };

  const getTypeName = (id: string) => types.find(t => t.id === id)?.nome || '-';
  const getFamilyName = (id: string) => families.find(f => f.id === id)?.nome || '-';
  
  // Filter families based on typed/selected Type
  const selectedTypeObj = types.find(t => t.nome.trim().toLowerCase() === typeSearch.trim().toLowerCase());
  const filteredFamilies = selectedTypeObj 
    ? families.filter(f => f.tipo_insumo_id === selectedTypeObj.id) 
    : [];

  // Sorting
  const sortedItems = [...items].sort((a, b) => {
    const typeA = getTypeName(a.tipo_insumo_id);
    const typeB = getTypeName(b.tipo_insumo_id);
    if (typeA !== typeB) return typeA.localeCompare(typeB);
    const famA = getFamilyName(a.familia_id);
    const famB = getFamilyName(b.familia_id);
    if (famA !== famB) return famA.localeCompare(famB);
    return a.insumo.localeCompare(b.insumo);
  });

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Cadastro de Insumos</h1>
        <button onClick={handleAddNew} className="flex items-center px-4 py-2 bg-accent text-white rounded hover:bg-sky-600">
          <Plus size={20} className="mr-2" /> Novo Insumo
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Família</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Insumo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qte Unit.</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Perda</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Preço Corr.</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedItems.map((item) => (
              <tr key={item.id} className="hover:bg-blue-50 transition-colors cursor-pointer">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getTypeName(item.tipo_insumo_id)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getFamilyName(item.familia_id)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.insumo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.codigo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.atualizado_em ? new Date(item.atualizado_em).toLocaleDateString() : '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {item.qte_unitaria.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    R$ {item.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {item.perda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700 text-right">
                    R$ {item.preco_corrigido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <button onClick={(e) => {e.stopPropagation(); handleEdit(item)}} className="text-indigo-600 hover:text-indigo-900 mr-4"><Edit2 size={18}/></button>
                  <button onClick={(e) => {e.stopPropagation(); handleDelete(item.id)}} className="text-red-600 hover:text-red-900"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Main Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-primary">{currentItem.id ? 'Editar' : 'Novo'} Insumo</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Insumo</label>
                <input 
                    list="types-list"
                    value={typeSearch}
                    onChange={(e) => setTypeSearch(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Selecione ou digite..."
                />
                <datalist id="types-list">
                    {types.map(t => <option key={t.id} value={t.nome} />)}
                </datalist>
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Família</label>
                <input 
                    list="families-list"
                    value={familySearch}
                    onChange={(e) => setFamilySearch(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Selecione ou digite..."
                />
                <datalist id="families-list">
                    {filteredFamilies.map(f => <option key={f.id} value={f.nome} />)}
                </datalist>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Insumo</label>
                <input
                  type="text"
                  value={currentItem.insumo || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, insumo: e.target.value })}
                  className="w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Qte Unitária</label>
                <input
                  type="text"
                  value={strQte}
                  onChange={(e) => setStrQte(e.target.value)}
                  onBlur={() => setStrQte(parseBRL(strQte).toLocaleString('pt-BR', { minimumFractionDigits: 2 }))}
                  className="w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Perda (%)</label>
                <input
                  type="text"
                  value={strPerda}
                  onChange={(e) => setStrPerda(e.target.value)}
                  onBlur={() => setStrPerda(parseBRL(strPerda).toLocaleString('pt-BR', { minimumFractionDigits: 2 }))}
                  className="w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                <input
                  type="text"
                  value={strPreco}
                  onChange={(e) => setStrPreco(e.target.value)}
                  onBlur={() => setStrPreco(parseBRL(strPreco).toLocaleString('pt-BR', { minimumFractionDigits: 2 }))}
                  className="w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>
            <div className="mt-8 flex justify-end space-x-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded text-gray-700 hover:bg-gray-300 transition-colors">Cancelar</button>
              <button onClick={handleSave} className="px-6 py-2 bg-primary text-white rounded hover:bg-slate-800 transition-colors font-semibold">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
