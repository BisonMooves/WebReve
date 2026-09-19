// Inquiry & Conversation Model Definition and Data Access Methods

export const InquiryStatus = {
  NEW: 'new',
  AWAITING_REPLY: 'awaiting_reply',
  ACTIVE: 'active',
  WON: 'won',
  LOST: 'lost'
};

/**
 * Validate and format an incoming inquiry / conversation payload
 */
export function formatInquiryDoc(data, existing = null) {
  const nowIso = new Date().toISOString();
  const email = (data.email || '').trim().toLowerCase();
  const id = data.id || existing?.id || `conv-${Date.now()}`;
  const reference = data.reference || existing?.reference || `WBR-2026-0001`;

  return {
    id,
    reference,
    name: (data.name || existing?.name || 'Anonymous Client').trim(),
    email,
    whatsapp: (data.whatsapp || existing?.whatsapp || '').trim(),
    plan: data.plan || existing?.plan || 'Dynamic Build',
    extraMonths: data.extraMonths !== undefined ? Number(data.extraMonths) : (existing?.extraMonths || 0),
    total: data.total !== undefined ? Number(data.total) : (data.totalPrice !== undefined ? Number(data.totalPrice) : (existing?.total || 10000)),
    budget: data.budget || existing?.budget || '',
    projectType: data.projectType || existing?.projectType || '',
    status: data.status || existing?.status || InquiryStatus.NEW,
    unreadCount: data.unreadCount !== undefined ? Number(data.unreadCount) : (existing?.unreadCount || 1),
    lastMessageAt: data.lastMessageAt || existing?.lastMessageAt || nowIso,
    createdAt: existing?.createdAt || data.createdAt || nowIso,
    updatedAt: nowIso
  };
}

export default {
  InquiryStatus,
  formatInquiryDoc
};
