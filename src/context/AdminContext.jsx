import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { projects as defaultProjects } from '../data/projects';
import { testimonials as defaultTestimonials } from '../data/testimonials';
import { agencyInfo as defaultAgencyInfo } from '../data/agencyInfo';

const AdminContext = createContext();

export function AdminProvider({ children }) {
  // 1. Projects State
  const [projects, setProjects] = useState(() => {
    try {
      const saved = localStorage.getItem('webreve_projects');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((p) => {
          if (!p.galleryItems || p.galleryItems.length === 0) {
            const defaultMatch = defaultProjects.find((dp) => dp.id === p.id);
            if (defaultMatch && defaultMatch.galleryItems) {
              return { ...p, galleryItems: defaultMatch.galleryItems };
            }
          }
          return p;
        });
      }
      return defaultProjects;
    } catch {
      return defaultProjects;
    }
  });

  // 2. Conversations & Messages State (Single Source of Truth)
  const [conversations, setConversations] = useState(() => {
    try {
      const saved = localStorage.getItem('webreve_conversations');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Exclude legacy seeded sample threads
        return parsed.filter((c) => !['conv-1', 'conv-2', 'conv-3'].includes(c.id));
      }
      return [];
    } catch {
      return [];
    }
  });

  // 3. Inquiries / Leads (Read-Only Projection over Conversations)
  const inquiries = conversations
    .filter((c) => !c.deletedAt)
    .map((c) => ({
      id: c.id,
      reference: c.reference || `WBR-2026-0001`,
      name: c.name,
      email: c.email,
      whatsapp: c.whatsapp,
      plan: c.plan,
      extraMonths: c.extraMonths || 0,
      total: c.total,
      projectType: c.plan,
      budget: `₹${(c.total || 10000).toLocaleString()}`,
      status: c.status,
      unreadCount: c.unreadCount || 0,
      message: c.preview,
      date: c.createdAt,
      createdAt: c.createdAt,
      lastMessageAt: c.lastMessageAt
    }));

  // 4. Testimonials State
  const [testimonials, setTestimonials] = useState(() => {
    try {
      const saved = localStorage.getItem('webreve_testimonials');
      return saved ? JSON.parse(saved) : defaultTestimonials;
    } catch {
      return defaultTestimonials;
    }
  });

  // 5. Agency Info State
  const [agencyInfo, setAgencyInfo] = useState(() => {
    try {
      const saved = localStorage.getItem('webreve_agency_info');
      return saved ? JSON.parse(saved) : defaultAgencyInfo;
    } catch {
      return defaultAgencyInfo;
    }
  });

  const [activeThread, setActiveThread] = useState(null); // { conversation, messages: [] }
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [stats, setStats] = useState({
    newLeads: 0,
    awaitingReply: 0,
    activeConversations: 0,
    wonThisMonthCount: 0,
    wonRevenue: 0,
    totalUnread: 0
  });

  const getAuthHeader = () => {
    const token = localStorage.getItem('webreve_admin_token') || localStorage.getItem('webreve_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('webreve_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('webreve_testimonials', JSON.stringify(testimonials));
  }, [testimonials]);

  useEffect(() => {
    localStorage.setItem('webreve_agency_info', JSON.stringify(agencyInfo));
  }, [agencyInfo]);

  useEffect(() => {
    localStorage.setItem('webreve_conversations', JSON.stringify(conversations));
  }, [conversations]);

  // Fetch Stats from Server
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { ...getAuthHeader() }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.stats) {
          setStats(data.stats);
          return;
        }
      }
    } catch {
      // Fallback: compute from latest conversations
    }

    setConversations((currentConvs) => {
      const activeConvs = currentConvs.filter((c) => !c.deletedAt);
      const newL = activeConvs.filter((c) => c.status === 'new').length;
      const awaitR = activeConvs.filter((c) => c.status === 'awaiting_reply').length;
      const actC = activeConvs.filter((c) => c.status === 'active').length;
      const wonL = activeConvs.filter((c) => c.status === 'won');
      const wonCount = wonL.length;
      const wonRev = wonL.reduce((sum, c) => sum + (Number(c.total) || 0), 0);
      const unread = activeConvs.reduce(
        (sum, c) => sum + (Number(c.unreadCount) || (c.status === 'new' || c.status === 'awaiting_reply' ? 1 : 0)),
        0
      );
      setStats({
        newLeads: newL,
        awaitingReply: awaitR,
        activeConversations: actC,
        wonThisMonthCount: wonCount,
        wonRevenue: wonRev,
        totalUnread: unread
      });
      return currentConvs;
    });
  }, []);

  // Fetch Conversations from Server (Silently updates without flickering if conversations are already loaded)
  const fetchConversations = useCallback(async (status = 'all', q = '', showLoader = false) => {
    if (showLoader) {
      setIsLoadingConversations(true);
    }
    try {
      const queryParams = new URLSearchParams();
      if (status && status !== 'all') queryParams.set('status', status);
      if (q && q.trim()) queryParams.set('q', q.trim());

      const res = await fetch(`/api/admin/conversations?${queryParams.toString()}`, {
        headers: { ...getAuthHeader() }
      });

      if (res.ok) {
        const data = await res.json();
        if (data.conversations) {
          setConversations(data.conversations);
        }
      }
    } catch (err) {
      console.warn('Using local conversations fallback:', err);
    } finally {
      setIsLoadingConversations(false);
      fetchStats();
    }
  }, [fetchStats]);

  // Fetch Conversation Details & Messages (Instant optimistic render + smooth background fetch)
  const fetchConversationById = useCallback(async (id) => {
    if (!id) return null;
    
    // Instant optimistic selection from local memory
    setConversations((currentConvs) => {
      const match = currentConvs.find((c) => c.id === id);
      if (match) {
        setActiveThread((prev) => {
          if (prev && prev.conversation?.id === id) {
            return prev;
          }
          return {
            conversation: { ...match, unreadCount: 0 },
            messages: prev?.conversation?.id === id ? prev.messages : [
              {
                id: `msg-${id}-preview`,
                conversationId: id,
                type: 'inbound',
                channel: 'form',
                body: match.preview || 'Initial inquiry details.',
                createdAt: match.createdAt,
                readAt: new Date().toISOString()
              }
            ]
          };
        });
      }
      return currentConvs.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c));
    });

    try {
      const res = await fetch(`/api/admin/conversations/${id}`, {
        headers: { ...getAuthHeader() }
      });

      if (res.ok) {
        const data = await res.json();
        setActiveThread(data);
        return data;
      }
    } catch (err) {
      console.error('Failed to load thread:', err);
    } finally {
      setIsLoadingThread(false);
      fetchStats();
    }
    return null;
  }, [fetchStats]);

  // Send Message (Outbound Email, Internal Note, or Inbound Client Message)
  const sendMessage = async (conversationId, { type, channel, body, subject }) => {
    try {
      const res = await fetch(`/api/admin/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ type, channel, body, subject })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message.');
      }

      // Update active thread
      if (activeThread && activeThread.conversation.id === conversationId) {
        setActiveThread((prev) => ({
          conversation: data.conversation || {
            ...prev.conversation,
            status: type === 'outbound' ? 'active' : prev.conversation.status,
            lastMessageAt: new Date().toISOString()
          },
          messages: [...prev.messages, data.message]
        }));
      }

      // Refresh conversations list & stats
      fetchConversations();
      return { success: true, message: data.message };
    } catch (err) {
      console.error('Error in sendMessage:', err);
      return { success: false, error: err.message };
    }
  };

  // Update Conversation Status
  const updateConversationStatus = async (conversationId, status) => {
    try {
      const res = await fetch(`/api/admin/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ status })
      });

      const data = await res.json();

      // Update local state
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, status } : c))
      );

      if (activeThread && activeThread.conversation.id === conversationId) {
        setActiveThread((prev) => ({
          ...prev,
          conversation: { ...prev.conversation, status }
        }));
      }

      fetchStats();
      return { success: true };
    } catch (err) {
      console.error('Error updating status:', err);
      // Fallback local update
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, status } : c))
      );
      if (activeThread && activeThread.conversation.id === conversationId) {
        setActiveThread((prev) => ({
          ...prev,
          conversation: { ...prev.conversation, status }
        }));
      }
      fetchStats();
      return { success: true };
    }
  };

  // Project CRUD Actions
  const addProject = (projectData) => {
    const newProject = {
      ...projectData,
      id: projectData.id || `proj-${Date.now()}`,
      deliverables: projectData.deliverables || ["UX Strategy", "Bespoke Design", "React Build"],
      mockups: projectData.mockups || (projectData.image ? [projectData.image] : []),
      galleryItems: projectData.galleryItems || (projectData.image ? [
        {
          id: `g-${Date.now()}-1`,
          title: `${projectData.title} · Platform Overview`,
          cat: "Desktop",
          kind: "desktop",
          tone: "ink",
          c: 8,
          r: 4,
          src: projectData.image,
          note: projectData.tagline || "Primary interface overview and conversion flow."
        }
      ] : []),
      metrics: projectData.metrics || [{ label: "Conversion Rate", value: "+120%" }]
    };
    setProjects((prev) => [newProject, ...prev]);
    return newProject;
  };

  const updateProject = (id, updatedFields) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
    );
  };

  const deleteProject = (id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  // Delete / Soft-Delete Conversation
  const deleteConversation = async (id) => {
    try {
      const res = await fetch(`/api/admin/conversations/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() }
      });
      if (!res.ok) {
        console.warn('Server delete returned non-ok status');
      }
    } catch (err) {
      console.warn('Network error during delete:', err);
    } finally {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeThread && activeThread.conversation?.id === id) {
        setActiveThread(null);
      }
      fetchStats();
    }
    return { success: true };
  };

  const deleteInquiry = (id) => deleteConversation(id);

  const updateInquiryStatus = (id, status) => {
    const canonicalStatus = (status || 'new').toLowerCase().replace(' ', '_');
    return updateConversationStatus(id, canonicalStatus);
  };

  // Inquiry Submission (Contact Form Integration)
  const addInquiry = async (inquiryData) => {
    const res = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inquiryData)
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to submit inquiry to server.');
    }

    if (data.conversation) {
      setConversations((prev) => {
        const filtered = prev.filter((c) => c.id !== data.conversation.id && !['conv-1', 'conv-2', 'conv-3'].includes(c.id));
        const updated = [data.conversation, ...filtered];
        try {
          localStorage.setItem('webreve_conversations', JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }

    try {
      await fetchConversations();
    } catch {}
    try {
      await fetchStats();
    } catch {}

    return data;
  };

  // Testimonials CRUD Actions
  const addTestimonial = (testimonialData) => {
    const newTestimonial = {
      ...testimonialData,
      id: testimonialData.id || Date.now(),
      rating: testimonialData.rating || 5
    };
    setTestimonials((prev) => [newTestimonial, ...prev]);
    return newTestimonial;
  };

  const updateTestimonial = (id, updatedFields) => {
    setTestimonials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updatedFields } : t))
    );
  };

  const deleteTestimonial = (id) => {
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
  };

  // Agency Info Actions
  const updateAgencyInfo = (updatedFields) => {
    setAgencyInfo((prev) => ({ ...prev, ...updatedFields }));
  };

  const resetToDefaults = () => {
    setProjects(defaultProjects);
    setTestimonials(defaultTestimonials);
    setAgencyInfo(defaultAgencyInfo);
    setConversations([]);
    setActiveThread(null);
    localStorage.removeItem('webreve_projects');
    localStorage.removeItem('webreve_inquiries');
    localStorage.removeItem('webreve_testimonials');
    localStorage.removeItem('webreve_agency_info');
    localStorage.removeItem('webreve_conversations');
    fetchStats();
  };

  // Calculate unread conversations count
  const unreadConversationsCount = conversations.reduce(
    (count, conv) =>
      count +
      (Number(conv.unreadCount) ||
      (conv.status === 'awaiting_reply' || conv.status === 'new' ? 1 : 0)),
    0
  );

  return (
    <AdminContext.Provider
      value={{
        projects,
        inquiries,
        testimonials,
        agencyInfo,
        conversations,
        activeThread,
        isLoadingConversations,
        isLoadingThread,
        unreadConversationsCount,
        stats,
        fetchStats,
        fetchConversations,
        fetchConversationById,
        sendMessage,
        updateConversationStatus,
        deleteConversation,
        addProject,
        updateProject,
        deleteProject,
        addInquiry,
        updateInquiryStatus,
        deleteInquiry,
        addTestimonial,
        updateTestimonial,
        deleteTestimonial,
        updateAgencyInfo,
        resetToDefaults
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdminData() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdminData must be used within an AdminProvider");
  }
  return context;
}
