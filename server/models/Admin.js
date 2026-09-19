// Admin Account Model Definition

export function formatAdminDoc(data) {
  const nowIso = new Date().toISOString();
  const email = (data.email || '').trim().toLowerCase();

  return {
    email,
    name: data.name || email.split('@')[0],
    role: data.role || 'admin',
    passwordHash: data.passwordHash || '',
    createdAt: data.createdAt || nowIso,
    updatedAt: nowIso
  };
}

export default {
  formatAdminDoc
};
