import React from 'react';
import { User, MODULES, UserProfile } from '../types';
import { LogOut, LayoutDashboard, Users, Database, FileText, Settings, Menu, X, Table } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const hasAccess = (module: string) => {
    if (user.perfil === UserProfile.ADMIN) return true;
    return user.acessos.includes(module);
  };

  const NavItem = ({ to, icon: Icon, label, module }: any) => {
    if (module && !hasAccess(module)) return null;
    const active = location.pathname === to;
    return (
      <button
        onClick={() => {
            navigate(to);
            setMobileMenuOpen(false);
        }}
        className={`flex items-center w-full px-4 py-3 mb-1 text-sm font-medium transition-colors rounded-lg group ${
          active ? 'bg-accent text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`}
      >
        <Icon className="w-5 h-5 mr-3" />
        {label}
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary text-white transition-transform transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:flex md:flex-col`}>
        <div className="flex items-center justify-between h-16 px-6 bg-slate-900 border-b border-slate-800">
          <span className="text-lg font-bold tracking-wider text-white">COCKPIT <span className="text-accent">LA PETITE</span></span>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-slate-400">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex flex-col flex-1 px-3 py-4 overflow-y-auto">
          <div className="mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider pl-4 mt-4">Cockpits</div>
          <NavItem to="/inputs" icon={Database} label="Cadastro de Insumos" module={MODULES.COCKPIT_INPUTS} />
          <NavItem to="/budget" icon={LayoutDashboard} label="Orçamento" module={MODULES.COCKPIT_BUDGET} />
          <NavItem to="/history" icon={FileText} label="Histórico Cotações" module={MODULES.COCKPIT_HISTORY} />
          <NavItem to="/full" icon={Table} label="Cotações Full" module={MODULES.COCKPIT_FULL} />

          {hasAccess(MODULES.ADMIN_USERS) && (
             <>
                <div className="mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider pl-4 mt-6">Administrador</div>
                <NavItem to="/users" icon={Users} label="Usuários" module={MODULES.ADMIN_USERS} />
             </>
          )}

          {hasAccess(MODULES.AUX_TABLES) && (
            <>
                <div className="mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider pl-4 mt-6">Tabelas Auxiliares</div>
                <NavItem to="/aux" icon={Settings} label="Tipos e Famílias" module={MODULES.AUX_TABLES} />
            </>
          )}
        </div>

        <div className="p-4 border-t border-slate-800">
            <div className="flex items-center mb-4 px-2">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white font-bold mr-3">
                    {user.usuario.charAt(0).toUpperCase()}
                </div>
                <div>
                    <p className="text-sm font-medium text-white">{user.usuario}</p>
                    <p className="text-xs text-slate-400">{user.perfil}</p>
                </div>
            </div>
          <button
            onClick={onLogout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-400 transition-colors rounded-lg hover:bg-red-900/20 hover:text-red-300"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        {/* Mobile Header */}
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b md:hidden">
            <span className="text-lg font-bold text-slate-800">Cockpit La Petite</span>
            <button onClick={() => setMobileMenuOpen(true)} className="text-slate-600">
                <Menu size={24} />
            </button>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
            {children}
        </main>
      </div>
    </div>
  );
};
