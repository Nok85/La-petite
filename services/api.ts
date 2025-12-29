import { User, UserProfile, UserStatus, InputItem, Quote, InputType, InputFamily, MODULES } from '../types';

const DB_KEY = 'cockpit_an_db';

interface DatabaseSchema {
  users: User[];
  inputs: InputItem[];
  quotes: Quote[];
  inputTypes: InputType[];
  inputFamilies: InputFamily[];
}

// Helper to simulate hash
const hashPassword = (pwd: string) => btoa(pwd); 

// Helper for initial inputs creation
const createInput = (id: string, typeId: string, familyId: string, name: string, qte: number, price: number, loss: number): InputItem => {
    const qte_corrigida = qte - (qte * (loss / 100));
    const preco_corrigido = qte_corrigida !== 0 ? (qte * price) / qte_corrigida : 0;
    
    return {
        id,
        tipo_insumo_id: typeId,
        familia_id: familyId,
        insumo: name,
        codigo: `INS${id.padStart(5, '0')}`,
        qte_unitaria: qte,
        preco: price,
        perda: loss,
        atualizado_em: new Date().toISOString(),
        qte_corrigida,
        preco_corrigido
    };
};

const initialDb: DatabaseSchema = {
  users: [
    {
      id: '1',
      usuario: 'Admin',
      email: 'admin@sistema.com',
      senha_hash: hashPassword('Admin85#'),
      perfil: UserProfile.ADMIN,
      status: UserStatus.ACTIVE,
      acessos: Object.values(MODULES),
    },
  ],
  inputTypes: [
    { id: 'T1', nome: 'PROTEINA', color: 'bg-white' },
    { id: 'T2', nome: 'VICERAS', color: 'bg-white' },
    { id: 'T3', nome: 'VEGETAIS', color: 'bg-white' },
    { id: 'T4', nome: 'CARBOIDRATOS', color: 'bg-white' },
    { id: 'T5', nome: 'SUPLEMENTOS', color: 'bg-white' },
  ],
  inputFamilies: [
    { id: 'F1', nome: 'Bovinos', tipo_insumo_id: 'T1' },
    { id: 'F2', nome: 'Cordeiro', tipo_insumo_id: 'T1' },
    { id: 'F3', nome: 'Aves', tipo_insumo_id: 'T1' },
    { id: 'F4', nome: 'Suinos', tipo_insumo_id: 'T1' },
    { id: 'F5', nome: 'Peixes', tipo_insumo_id: 'T1' },
    { id: 'F6', nome: 'Aves', tipo_insumo_id: 'T2' },
    { id: 'F7', nome: 'Bovinos', tipo_insumo_id: 'T2' },
    { id: 'F8', nome: 'Verdes', tipo_insumo_id: 'T3' },
    { id: 'F9', nome: 'Roxo', tipo_insumo_id: 'T3' },
    { id: 'F10', nome: 'Laranja', tipo_insumo_id: 'T3' },
    { id: 'F11', nome: 'Amarelo', tipo_insumo_id: 'T3' },
    { id: 'F12', nome: 'Branco', tipo_insumo_id: 'T4' },
    { id: 'F13', nome: 'Integral', tipo_insumo_id: 'T4' },
    { id: 'F14', nome: 'Batatas', tipo_insumo_id: 'T4' },
    { id: 'F15', nome: 'Outros', tipo_insumo_id: 'T4' },
    { id: 'F16', nome: 'Suplementos', tipo_insumo_id: 'T5' },
  ],
  inputs: [
      createInput('1', 'T1', 'F1', 'Alcatra', 1, 33.99, 45),
      createInput('2', 'T1', 'F2', 'Cordeiro', 1, 67.6, 30),
      createInput('3', 'T1', 'F1', 'Coxao Duro', 1, 0, 45),
      createInput('4', 'T1', 'F1', 'Coxao Mole', 1, 33.9, 45),
      createInput('5', 'T1', 'F3', 'File Frango', 1, 14.19, 20),
      createInput('6', 'T1', 'F4', 'File Suino', 1, 20, 3),
      createInput('7', 'T1', 'F4', 'Lombo Suino', 1, 19.8, 20),
      createInput('8', 'T1', 'F5', 'Merluza', 1, 36.6, 24),
      createInput('9', 'T1', 'F1', 'Musculo', 1, 23.99, 29.33),
      createInput('10', 'T1', 'F1', 'Patinho', 1, 33.63, 14.11),
      createInput('11', 'T1', 'F5', 'Salmao', 1, 0, 20),
      createInput('12', 'T1', 'F3', 'Ovo - Gramas', 1, 28.87, 0),
      createInput('13', 'T1', 'F3', 'Ovo - Unidade', 1, 0.87, 0),
      createInput('14', 'T1', 'F3', 'Ovo - Codorna', 1, 0.55, 0),
      createInput('15', 'T1', 'F3', 'Ovo - Clara', 1, 0.55, 0),
      createInput('16', 'T1', 'F4', 'Pernil Suino', 1, 17.9, 30),
      createInput('17', 'T1', 'F3', 'Sobrecoxa', 1, 10.99, 5),
      createInput('18', 'T1', 'F5', 'Tilapia', 1, 40, 28.5),
      createInput('19', 'T2', 'F6', 'Coracao Frango', 1, 18.56, 10),
      createInput('20', 'T2', 'F7', 'Coracao Boi', 1, 11.1, 10),
      createInput('21', 'T2', 'F7', 'Figado Bovino', 1, 8.99, 2.98),
      createInput('22', 'T2', 'F6', 'Figado Frango', 1, 1.99, 10),
      createInput('23', 'T2', 'F6', 'Moela', 1, 6.99, 50),
      createInput('24', 'T2', 'F6', 'Pescoco Frango', 1, 7.99, 0),
      createInput('25', 'T3', 'F8', 'Abobrinha', 1, 4.99, 35),
      createInput('26', 'T3', 'F9', 'Beterraba', 1, 2.99, 35),
      createInput('27', 'T3', 'F8', 'Beringela', 1, 5.5, 35),
      createInput('28', 'T3', 'F8', 'Brocolis', 1, 16.5, 35),
      createInput('29', 'T3', 'F10', 'Cabotia', 1, 4.99, 35),
      createInput('30', 'T3', 'F10', 'Cenoura', 1, 2.99, 35),
      createInput('31', 'T3', 'F11', 'Couve Flor', 1, 24, 35),
      createInput('32', 'T3', 'F8', 'Couve Manteiga', 1, 11.7, 35),
      createInput('33', 'T3', 'F8', 'Chuchu', 1, 4.75, 35),
      createInput('34', 'T3', 'F8', 'Ervilhas', 1, 15.9, 35),
      createInput('35', 'T3', 'F8', 'Espinafre', 1, 15, 35),
      createInput('36', 'T3', 'F8', 'Quiabo', 1, 9, 35),
      createInput('37', 'T3', 'F8', 'Jilo', 1, 8.9, 35),
      createInput('38', 'T3', 'F8', 'Vagem', 1, 18.9, 35),
      createInput('39', 'T4', 'F12', 'Arroz Branco', 1, 6.29, -90),
      createInput('40', 'T4', 'F13', 'Arroz Integral', 1, 5.99, -40),
      createInput('41', 'T4', 'F14', 'Batata Doce', 1, 3.99, 3.17),
      createInput('42', 'T4', 'F14', 'Batata Doce Branca', 1, 4, 3.17),
      createInput('43', 'T4', 'F14', 'Batata Inglesa', 1, 2.99, 3),
      createInput('44', 'T4', 'F15', 'Inhame', 1, 12.99, 3),
      createInput('45', 'T4', 'F15', 'Mandioca', 1, 7.99, 3),
      createInput('46', 'T4', 'F15', 'Mandioquinha', 1, 10.99, 12),
      createInput('47', 'T5', 'F16', 'Primusplus Zero Fosforo', 0.5, 118.19, 0),
      createInput('48', 'T5', 'F16', 'Nutroplus Senior', 0.5, 134.06, 0),
      createInput('49', 'T5', 'F16', 'Primusplus Adultos', 0.5, 127.53, 0),
  ],
  quotes: [],
};

// --- Low Level DB Access ---

const getDb = (): DatabaseSchema => {
  const str = localStorage.getItem(DB_KEY);
  let db = initialDb;
  
  if (str) {
      try {
          const parsed = JSON.parse(str);
          // Merge safely
          db = { ...initialDb, ...parsed };
      } catch (e) {
          console.error("Database parse error, resetting to initial", e);
          db = initialDb;
      }
  }

  // CRITICAL FIX: Ensure arrays always exist to prevent crashes
  if (!Array.isArray(db.quotes)) db.quotes = [];
  if (!Array.isArray(db.inputs)) db.inputs = [];
  if (!Array.isArray(db.users)) db.users = [];
  if (!Array.isArray(db.inputTypes)) db.inputTypes = [];
  if (!Array.isArray(db.inputFamilies)) db.inputFamilies = [];
  
  return db;
};

const saveDb = (db: DatabaseSchema) => {
  try {
      localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (e) {
      console.error("Error saving DB", e);
      alert("Erro ao salvar dados localmente. Espaço cheio?");
  }
};

export const initializeData = () => {
  // Always run getDb once to trigger the 'Sanity checks' inside it and fix structure if needed
  const db = getDb();
  saveDb(db);
};

// --- Auth Services ---

export const login = (usuario: string, senha_plain: string): { success: boolean; user?: User; message?: string } => {
  const db = getDb();
  const user = db.users.find((u) => u.usuario === usuario && u.senha_hash === hashPassword(senha_plain));
  
  if (!user) return { success: false, message: 'Usuário ou senha inválidos.' };
  if (user.status === UserStatus.INACTIVE) return { success: false, message: 'Usuário inativo. Contate o administrador.' };
  
  return { success: true, user };
};

export const forgotPassword = (usuario: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), 1000);
  });
};

// --- User Services ---

export const getUsers = () => getDb().users;

export const saveUser = (user: User) => {
  const db = getDb();
  const existingIndex = db.users.findIndex((u) => u.id === user.id);
  
  if (!user.senha_hash.endsWith('=')) { 
      user.senha_hash = hashPassword(user.senha_hash);
  }

  if (existingIndex >= 0) {
    db.users[existingIndex] = user;
  } else {
    user.id = Date.now().toString();
    db.users.push(user);
  }
  saveDb(db);
};

export const deleteUser = (id: string) => {
  const db = getDb();
  db.users = db.users.filter((u) => u.id !== id);
  saveDb(db);
};

// --- Input Services ---

export const getInputs = () => getDb().inputs;
export const getInputTypes = () => getDb().inputTypes;
export const getInputFamilies = () => getDb().inputFamilies;

export const saveInput = (item: InputItem) => {
  const db = getDb();
  const existingIndex = db.inputs.findIndex((i) => i.id === item.id);
  
  item.qte_corrigida = item.qte_unitaria - (item.qte_unitaria * (item.perda / 100));
  if (item.qte_corrigida !== 0) {
    item.preco_corrigido = (item.qte_unitaria * item.preco) / item.qte_corrigida;
  } else {
    item.preco_corrigido = 0;
  }

  if (existingIndex >= 0) {
    item.atualizado_em = new Date().toISOString();
    db.inputs[existingIndex] = item;
  } else {
    item.id = Date.now().toString();
    item.codigo = `INS${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
    item.atualizado_em = new Date().toISOString();
    db.inputs.push(item);
  }
  saveDb(db);
};

export const deleteInput = (id: string) => {
  const db = getDb();
  db.inputs = db.inputs.filter((i) => i.id !== id);
  saveDb(db);
};

export const saveInputType = (name: string): string => {
    const db = getDb();
    const existing = db.inputTypes.find(t => t.nome.trim().toLowerCase() === name.trim().toLowerCase());
    if (existing) return existing.id;

    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    db.inputTypes.push({ id, nome: name.trim(), color: 'bg-white' });
    saveDb(db);
    return id;
}

export const deleteInputType = (id: string) => {
    const db = getDb();
    db.inputTypes = db.inputTypes.filter(t => t.id !== id);
    db.inputFamilies = db.inputFamilies.filter(f => f.tipo_insumo_id !== id);
    saveDb(db);
}

export const saveInputFamily = (name: string, typeId: string): string => {
    const db = getDb();
    const existing = db.inputFamilies.find(f => f.nome.trim().toLowerCase() === name.trim().toLowerCase() && f.tipo_insumo_id === typeId);
    if (existing) return existing.id;

    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    db.inputFamilies.push({ id, nome: name.trim(), tipo_insumo_id: typeId });
    saveDb(db);
    return id;
}

export const deleteInputFamily = (id: string) => {
    const db = getDb();
    db.inputFamilies = db.inputFamilies.filter(f => f.id !== id);
    saveDb(db);
}

// --- Quote/Budget Services ---

export const getQuotes = () => getDb().quotes;
export const getQuoteById = (id: string) => getDb().quotes.find(q => q.id_cotacao === id);

export const saveQuote = (quote: Quote) => {
  const db = getDb();
  const existingIndex = db.quotes.findIndex((q) => q.id_cotacao === quote.id_cotacao);
  
  if (existingIndex >= 0) {
    db.quotes[existingIndex] = quote;
  } else {
    db.quotes.push(quote);
  }
  saveDb(db);
  return true;
};

export const generateQuoteId = (): string => {
    const db = getDb();
    const year = new Date().getFullYear();
    const prefix = `COT${year}`;
    
    // Extra safety, although getDb already handles it
    const quotes = Array.isArray(db.quotes) ? db.quotes : [];

    const existingIds = quotes
        .filter(q => q && typeof q.id_cotacao === 'string' && q.id_cotacao.startsWith(prefix))
        .map(q => {
            const numPart = q.id_cotacao.replace(prefix, '');
            return parseInt(numPart, 10);
        })
        .filter(n => !isNaN(n));

    const max = existingIds.length > 0 ? Math.max(...existingIds) : 0;
    const next = max + 1;
    
    return `${prefix}${next.toString().padStart(4, '0')}`;
}
