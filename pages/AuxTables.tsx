import React, { useState, useEffect } from 'react';
import { getInputTypes, getInputFamilies, saveInputType, saveInputFamily, deleteInputType, deleteInputFamily } from '../services/api';
import { InputType, InputFamily } from '../types';
import { Plus, Trash2, ChevronRight, X, AlertCircle } from 'lucide-react';

export const AuxTables: React.FC = () => {
    const [types, setTypes] = useState<InputType[]>([]);
    const [families, setFamilies] = useState<InputFamily[]>([]);
    const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);

    // Modals/Input states
    const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
    const [newTypeName, setNewTypeName] = useState('');
    const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
    const [newFamilyName, setNewFamilyName] = useState('');

    // Delete Modal State
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; type: 'type' | 'family'; id: string; name: string }>({
        isOpen: false,
        type: 'type',
        id: '',
        name: ''
    });

    const loadData = () => {
        setTypes(getInputTypes());
        setFamilies(getInputFamilies());
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAddType = () => {
        if (!newTypeName.trim()) return;
        saveInputType(newTypeName);
        setNewTypeName('');
        setIsTypeModalOpen(false);
        loadData();
    };

    const handleOpenDeleteType = (item: InputType, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDeleteModal({ isOpen: true, type: 'type', id: item.id, name: item.nome });
    };

    const handleAddFamily = () => {
        if (!newFamilyName.trim() || !selectedTypeId) return;
        saveInputFamily(newFamilyName, selectedTypeId);
        setNewFamilyName('');
        setIsFamilyModalOpen(false);
        loadData();
    };

    const handleOpenDeleteFamily = (item: InputFamily, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDeleteModal({ isOpen: true, type: 'family', id: item.id, name: item.nome });
    };

    const executeDelete = () => {
        if (deleteModal.type === 'type') {
            deleteInputType(deleteModal.id);
            if (selectedTypeId === deleteModal.id) setSelectedTypeId(null);
        } else {
            deleteInputFamily(deleteModal.id);
        }
        loadData();
        setDeleteModal({ ...deleteModal, isOpen: false });
    };

    const selectedType = types.find(t => t.id === selectedTypeId);
    const filteredFamilies = families.filter(f => f.tipo_insumo_id === selectedTypeId);

    return (
        <div className="container mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Tabelas Auxiliares</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
                
                {/* Types Column */}
                <div className="bg-white rounded-lg shadow flex flex-col">
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                        <h2 className="font-bold text-lg text-primary">Tipos de Insumo</h2>
                        <button onClick={() => setIsTypeModalOpen(true)} className="flex items-center text-sm bg-accent text-white px-3 py-1.5 rounded hover:bg-sky-600 shadow-sm transition-all">
                           <Plus size={16} className="mr-1"/> Adicionar
                        </button>
                    </div>
                    <div className="overflow-y-auto flex-1 p-2">
                         {types.map(t => (
                             <div 
                               key={t.id}
                               onClick={() => setSelectedTypeId(t.id)}
                               className={`flex justify-between items-center p-3 rounded mb-1 cursor-pointer transition-colors ${selectedTypeId === t.id ? 'bg-sky-50 border-l-4 border-accent shadow-sm' : 'hover:bg-gray-50'}`}
                             >
                                <span className="font-medium text-slate-700">{t.nome}</span>
                                <div className="flex items-center">
                                    <button 
                                        onClick={(e) => handleOpenDeleteType(t, e)} 
                                        className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors mr-1 z-10"
                                        title="Excluir Tipo"
                                        type="button"
                                    >
                                        <Trash2 size={16}/>
                                    </button>
                                    <ChevronRight size={16} className="text-gray-300 ml-2"/>
                                </div>
                             </div>
                         ))}
                         {types.length === 0 && <div className="text-center text-gray-400 mt-10 text-sm">Nenhum tipo cadastrado.</div>}
                    </div>
                </div>

                {/* Families Column */}
                <div className="bg-white rounded-lg shadow flex flex-col">
                   <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                      <h2 className="font-bold text-lg text-primary truncate max-w-[200px]">
                         {selectedType ? `Famílias: ${selectedType.nome}` : 'Famílias'}
                      </h2>
                      {selectedType && (
                        <button onClick={() => setIsFamilyModalOpen(true)} className="flex items-center text-sm bg-accent text-white px-3 py-1.5 rounded hover:bg-sky-600 shadow-sm transition-all">
                           <Plus size={16} className="mr-1"/> Adicionar
                        </button>
                      )}
                   </div>
                   <div className="overflow-y-auto flex-1 p-2">
                      {!selectedType ? (
                          <div className="text-center text-gray-400 mt-10 flex flex-col items-center p-6">
                              <div className="bg-gray-100 p-4 rounded-full mb-3 text-gray-300"><ChevronRight size={24} /></div>
                              <span className="text-sm">Selecione um Tipo ao lado para gerenciar suas famílias.</span>
                          </div>
                      ) : (
                         <>
                             {filteredFamilies.map(f => (
                                 <div key={f.id} className="flex justify-between items-center p-3 border-b last:border-0 hover:bg-gray-50 rounded transition-colors group">
                                    <span className="text-slate-700">{f.nome}</span>
                                    <button 
                                        onClick={(e) => handleOpenDeleteFamily(f, e)} 
                                        className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                                        title="Excluir Família"
                                        type="button"
                                    >
                                        <Trash2 size={16}/>
                                    </button>
                                 </div>
                             ))}
                             {filteredFamilies.length === 0 && <div className="text-center text-gray-400 mt-10 text-sm">Nenhuma família cadastrada para este tipo.</div>}
                         </>
                      )}
                   </div>
                </div>
            </div>

            {/* Modal - New Type */}
            {isTypeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-primary">Novo Tipo de Insumo</h3>
                            <button onClick={() => setIsTypeModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                        </div>
                        <input 
                            className="w-full border border-gray-300 p-2 rounded mb-4 focus:ring-2 focus:ring-accent focus:outline-none bg-white text-gray-900" 
                            placeholder="Ex: Proteicos" 
                            value={newTypeName} 
                            onChange={e => setNewTypeName(e.target.value)} 
                            autoFocus
                        />
                        <div className="flex justify-end space-x-2">
                            <button onClick={() => setIsTypeModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors">Cancelar</button>
                            <button onClick={handleAddType} className="px-4 py-2 bg-primary text-white rounded hover:bg-slate-800 transition-colors">Salvar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal - New Family */}
            {isFamilyModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-primary">Nova Família</h3>
                             <button onClick={() => setIsFamilyModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                        </div>
                        <div className="text-xs text-gray-500 mb-2">Vinculada a: <strong>{selectedType?.nome}</strong></div>
                        <input 
                            className="w-full border border-gray-300 p-2 rounded mb-4 focus:ring-2 focus:ring-accent focus:outline-none bg-white text-gray-900" 
                            placeholder="Ex: Farelos" 
                            value={newFamilyName} 
                            onChange={e => setNewFamilyName(e.target.value)}
                            autoFocus
                        />
                        <div className="flex justify-end space-x-2">
                            <button onClick={() => setIsFamilyModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors">Cancelar</button>
                            <button onClick={handleAddFamily} className="px-4 py-2 bg-primary text-white rounded hover:bg-slate-800 transition-colors">Salvar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal - Delete Confirmation */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-96 shadow-xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-start mb-4">
                            <div className="bg-red-100 p-2 rounded-full mr-3 text-red-600">
                                <AlertCircle size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Excluir {deleteModal.type === 'type' ? 'Tipo' : 'Família'}</h3>
                                <div className="mt-2 text-sm text-gray-500">
                                    Tem certeza que deseja excluir <strong>{deleteModal.name}</strong>?
                                    {deleteModal.type === 'type' && (
                                        <p className="mt-1 text-red-500 font-medium">Isso excluirá também todas as famílias vinculadas.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                            <button 
                                onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })} 
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={executeDelete} 
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-medium"
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
