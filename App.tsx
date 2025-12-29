import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { InputsModule } from './pages/InputsModule';
import { BudgetModule } from './pages/BudgetModule';
import { HistoryModule } from './pages/HistoryModule';
import { FullQuotesModule } from './pages/FullQuotesModule';
import { AdminUsers } from './pages/AdminUsers';
import { AuxTables } from './pages/AuxTables';
import { User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  // Restore session
  useEffect(() => {
    const savedUser = localStorage.getItem('cockpit_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('cockpit_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('cockpit_user');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <HashRouter>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Navigate to="/budget" replace />} />
          <Route path="/inputs" element={<InputsModule />} />
          <Route path="/budget" element={<BudgetModule />} />
          <Route path="/history" element={<HistoryModule />} />
          <Route path="/full" element={<FullQuotesModule />} />
          <Route path="/users" element={<AdminUsers />} />
          <Route path="/aux" element={<AuxTables />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
