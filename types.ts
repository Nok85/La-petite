
// --- Enums ---
export enum UserProfile {
  ADMIN = 'Administrador',
  USER = 'Usuário',
}

export enum UserStatus {
  ACTIVE = 'Ativo',
  INACTIVE = 'Inativo',
}

export enum QuoteStatus {
  OPEN = 'Em Aberto',
  LOST = 'Perdida',
  CONCLUDED = 'Concluída',
}

export enum LostReason {
  PRICE_HOME = 'Preço: fazer em casa fica mais barato',
  NOT_ADAPTED = 'Não adaptou a AN',
  PRICE_COMPETITOR = 'Preço: concorrente fez/faz mais barato',
  PRICE_EXPENSIVE = 'Preço: achou caro',
  TOO_MUCH_WORK = 'Acha trabalhoso servir a AN',
}

// --- Interfaces ---

export interface User {
  id: string;
  usuario: string; // Login key
  email: string;
  senha_hash: string;
  perfil: UserProfile;
  status: UserStatus;
  acessos: string[]; // List of module IDs allowed
}

export interface InputType {
  id: string;
  nome: string;
  color?: string; // Hex code or tailwind class for UI grouping
}

export interface InputFamily {
  id: string;
  nome: string;
  tipo_insumo_id: string;
}

export interface InputItem {
  id: string;
  tipo_insumo_id: string; // Foreign key
  familia_id: string; // Foreign key
  insumo: string;
  codigo: string;
  qte_unitaria: number;
  preco: number;
  atualizado_em: string; // ISO Date
  perda: number; // Percentage 0-100
  // Calculated fields (stored for performance or calc on fly)
  qte_corrigida: number;
  preco_corrigido: number;
}

export interface DietItem {
  input_id: string;
  amount: number; // Amount used in the diet
}

export interface QuoteDiet {
  id: number; // 1, 2, 3, 4
  name: string;
  items: Record<string, number>; // Map input_id -> amount
}

export interface Quote {
  id_cotacao: string;
  cliente?: string;
  data_criacao: string;
  status: QuoteStatus;
  motivo_perda?: LostReason;
  observacoes?: string;
  diets: QuoteDiet[]; // Array of 4 diets
  margin_simulation?: number; // Last simulated margin
}

// --- Constants for Modules ---
export const MODULES = {
  COCKPIT_INPUTS: 'cockpit_inputs',
  COCKPIT_BUDGET: 'cockpit_budget',
  COCKPIT_HISTORY: 'cockpit_history',
  COCKPIT_FULL: 'cockpit_full',
  ADMIN_USERS: 'admin_users',
  AUX_TABLES: 'aux_tables',
};
