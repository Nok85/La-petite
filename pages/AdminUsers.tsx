import React, { useState, useEffect } from 'react';
import { getUsers, saveUser, deleteUser } from '../services/api';
import { User, UserProfile, UserStatus, MODULES } from '../types';
import { Plus, Trash2, Edit2 } from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User>>({});

  const loadData = () => setUsers(getUsers());
  useEffect(() => { loadData(); }, []);

  const handleSave = () => {
      if (!currentUser.usuario || !currentUser.senha_hash) {
          alert("Usuário e Senha são obrigatórios");
          return;
      }
      saveUser(currentUser as User);
      setIsModalOpen(false);
      loadData();
  };

  const handleDelete = (id: string) => {
      if(window.confirm("Excluir usuário?")) {
          deleteUser(id);
          loadData();
      }
  };

  const openNew = () => {
      setCurrentUser({
          usuario: '',
          email: '',
          senha_hash: '',
          perfil: UserProfile.USER,
          status: UserStatus.ACTIVE,
          acessos: []
      });
      setIsModalOpen(true);
  };

  const openEdit = (u: User) => {
      // Clone to avoid ref issues, preserve original hash if not changed
      setCurrentUser({ ...u }); 
      setIsModalOpen(true);
  };

  const toggleAccess = (module: string) => {
      const currentAccess = currentUser.acessos || [];
      if (currentAccess.includes(module)) {
          setCurrentUser({ ...currentUser, acessos: currentAccess.filter(m => m !== module) });
      } else {
          setCurrentUser({ ...currentUser, acessos: [...currentAccess, module] });
      }
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de Usuários</h1>
        <button onClick={openNew} className="bg-primary text-white px-4 py-2 rounded flex items-center"><Plus size={18} className="mr-2"/> Novo Usuário</button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                  <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuário</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Perfil</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                  {users.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium">{u.usuario}</td>
                          <td className="px-6 py-4 text-gray-500">{u.email}</td>
                          <td className="px-6 py-4">{u.perfil}</td>
                          <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${u.status === UserStatus.ACTIVE ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {u.status}
                              </span>
                          </td>
                          <td className="px-6 py-4 text-center flex justify-center space-x-4">
                              <button onClick={() => openEdit(u)} className="text-indigo-600"><Edit2 size={18}/></button>
                              <button onClick={() => handleDelete(u.id)} className="text-red-600"><Trash2 size={18}/></button>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>

      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
                  <h2 className="text-xl font-bold mb-4">{currentUser.id ? 'Editar' : 'Criar'} Usuário</h2>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium">Usuário (Login)</label>
                          <input className="w-full border p-2 rounded" value={currentUser.usuario} onChange={e => setCurrentUser({...currentUser, usuario: e.target.value.replace(/\s/g, '')})} />
                      </div>
                      <div>
                          <label className="block text-sm font-medium">Email</label>
                          <input className="w-full border p-2 rounded" value={currentUser.email} onChange={e => setCurrentUser({...currentUser, email: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-sm font-medium">Senha</label>
                          <input className="w-full border p-2 rounded" type="password" placeholder={currentUser.id ? "Deixe em branco para manter" : "Senha"} value={currentUser.senha_hash} onChange={e => setCurrentUser({...currentUser, senha_hash: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium">Perfil</label>
                            <select className="w-full border p-2 rounded" value={currentUser.perfil} onChange={(e) => setCurrentUser({...currentUser, perfil: e.target.value as UserProfile})}>
                                {Object.values(UserProfile).map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium">Status</label>
                            <select className="w-full border p-2 rounded" value={currentUser.status} onChange={(e) => setCurrentUser({...currentUser, status: e.target.value as UserStatus})}>
                                {Object.values(UserStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                      </div>
                      
                      <div className="border-t pt-4">
                          <label className="block text-sm font-bold mb-2">Permissões de Acesso</label>
                          <div className="space-y-2">
                              {Object.entries(MODULES).map(([key, val]) => (
                                  <label key={key} className="flex items-center space-x-2 cursor-pointer">
                                      <input 
                                        type="checkbox" 
                                        checked={currentUser.acessos?.includes(val)} 
                                        onChange={() => toggleAccess(val)}
                                        className="rounded text-accent focus:ring-accent"
                                      />
                                      <span className="text-sm text-gray-700 capitalize">{val.replace('_', ' ')}</span>
                                  </label>
                              ))}
                          </div>
                      </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-2">
                      <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
                      <button onClick={handleSave} className="px-4 py-2 bg-primary text-white rounded">Salvar</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};