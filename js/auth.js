/**
 * KanbanPro — auth.js
 * Autenticação + controle de acesso por setor e role.
 */
import { supabase } from "./supabase-config.js";

export let currentUser = null;

// ── Permissões por role ───────────────────────────────────────
const PERMISSIONS = {
  admin: ["view_all", "manage_users", "manage_cards", "delete_cards", "manage_announcements"],
  gerente: ["view_all", "manage_cards", "delete_own", "manage_announcements"],
  colaborador: ["view_sector", "create_cards", "edit_own_cards"],
};

export async function requireAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = "./login.html";
    return null;
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (!profile?.active) {
    await supabase.auth.signOut();
    window.location.href = "./login.html?msg=conta_inativa";
    return null;
  }
  currentUser = { ...session.user, ...profile };
  return currentUser;
}

export async function requireGuest() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) window.location.href = "./kanban.html";
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
  window.location.href = "./login.html";
}

export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + "/reset-password.html",
  });
  if (error) throw error;
}

export function hasPermission(perm) {
  if (!currentUser) return false;
  return PERMISSIONS[currentUser.role]?.includes(perm) ?? false;
}

export async function logAction(cardId, action, details = {}) {
  if (!currentUser) return;
  await supabase.from("activity_log").insert({
    card_id: cardId,
    user_id: currentUser.id,
    user_name: currentUser.full_name || currentUser.email,
    action,
    details,
    sector: currentUser.sector,
  });
}

// ── Labels amigáveis de setor ─────────────────────────────────
export const SECTOR_LABELS = {
  desenvolvimento: "Desenvolvimento",
  locadora: "Locadora",
  leilao: "Leilão",
};

export const SECTOR_COLORS = {
  desenvolvimento: "#3b82f6",
  locadora:        "#16a34a",
  leilao:          "#d97706",
};

// ── Colunas Kanban por setor ──────────────────────────────────
export const SECTOR_COLUMNS = {
  desenvolvimento: [
    { id: "backlog",     label: "Backlog",        color: "#6b7280" },
    { id: "todo",        label: "A Fazer",         color: "#3b82f6" },
    { id: "in_progress", label: "Em Andamento",    color: "#f59e0b" },
    { id: "review",      label: "Em Revisão",      color: "#8b5cf6" },
    { id: "testing",     label: "Testes",          color: "#06b6d4" },
    { id: "done",        label: "Concluído",       color: "#22c55e" },
  ],
  locadora: [
    { id: "solicitado",  label: "Solicitado",      color: "#6b7280" },
    { id: "aprovado",    label: "Aprovado",        color: "#3b82f6" },
    { id: "em_locacao",  label: "Em Locação",      color: "#f59e0b" },
    { id: "pendente",    label: "Pendente Dev.",   color: "#ef4444" },
    { id: "devolvido",   label: "Devolvido",       color: "#22c55e" },
  ],
  leilao: [
    { id: "prospeccao",  label: "Prospecção",      color: "#6b7280" },
    { id: "avaliacao",   label: "Avaliação",       color: "#3b82f6" },
    { id: "publicado",   label: "Publicado",       color: "#f59e0b" },
    { id: "em_leilao",   label: "Em Leilão",       color: "#8b5cf6" },
    { id: "arrematado",  label: "Arrematado",      color: "#22c55e" },
    { id: "cancelado",   label: "Cancelado",       color: "#ef4444" },
  ],
};
