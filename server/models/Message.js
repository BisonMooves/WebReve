// Message Model Definition and Data Formatting

export const MessageType = {
  INBOUND: 'inbound',
  OUTBOUND: 'outbound',
  INTERNAL_NOTE: 'internal_note'
};

export const MessageChannel = {
  FORM: 'form',
  EMAIL: 'email',
  WHATSAPP: 'whatsapp',
  SYSTEM: 'system'
};

/**
 * Validate and format an incoming message document
 */
export function formatMessageDoc(data) {
  const nowIso = new Date().toISOString();
  const id = data.id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  return {
    _id: id,
    id,
    conversationId: data.conversationId,
    type: data.type || MessageType.INBOUND,
    channel: data.channel || MessageChannel.FORM,
    body: (data.body || data.message || '').trim(),
    subject: data.subject ? data.subject.trim() : null,
    readAt: data.readAt || (data.type === MessageType.OUTBOUND ? nowIso : null),
    createdAt: data.createdAt || nowIso
  };
}

export default {
  MessageType,
  MessageChannel,
  formatMessageDoc
};
