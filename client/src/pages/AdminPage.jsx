import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdminData } from '../context/AdminContext';
import { useAuth } from '../context/AuthContext';
import AdminAuthGate from '../components/AdminAuthGate';
import ImageUploader from '../components/ImageUploader';
import { apiUrl, resolveImageUrl } from '../config/api';
import {
  LayoutDashboard,
  FolderKanban,
  Inbox,
  MessageSquare,
  Quote,
  Settings,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  Briefcase,
  Search,
  X,
  Mail,
  RefreshCw,
  Database,
  ChevronDown,
  LogOut,
  ShieldCheck,
  KeyRound,
  Loader2,
  AlertCircle,
  MoveUp,
  MoveDown,
  Copy,
  Sparkles,
  Film,
  Send,
  Phone,
  MessageCircle,
  ExternalLink,
  User,
  StickyNote,
  CornerDownRight,
  Check,
  Filter,
  ArrowLeft,
  Calendar,
  Layers,
  UploadCloud,
  Image as ImageIcon,
  Sliders,
  Grid
} from 'lucide-react';

function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatPlanAndTerms(item) {
  if (!item) return 'Custom Scope';
  const planName = item.plan || item.projectType || 'Dynamic Build';
  const extra = Number(item.extraMonths) || 0;

  if (planName.toLowerCase().includes('static')) {
    return extra > 0 ? `Static Launch · Base project + ${extra} extra` : `Static Launch · Base project`;
  }
  if (planName.toLowerCase().includes('care')) {
    return extra > 0 ? `Dynamic + Care · 12 months included + ${extra} extra` : `Dynamic + Care · 12 months included`;
  }
  if (planName.toLowerCase().includes('dynamic')) {
    return extra > 0 ? `Dynamic Build · 3 months included + ${extra} extra` : `Dynamic Build · 3 months included`;
  }
  return extra > 0 ? `${planName} · +${extra} extra months` : `${planName} · Custom terms`;
}

export default function AdminPage() {
  const { currentUser, logout, changePassword, isLoading: isAuthLoading } = useAuth();
  const {
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
    syncProjectsToMongo,
    fetchProjects,
    updateInquiryStatus,
    deleteInquiry,
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
    updateAgencyInfo,
    resetToDefaults
  } = useAdminData();

  const [isSyncingProjects, setIsSyncingProjects] = useState(false);

  const handleSyncAllProjects = async () => {
    setIsSyncingProjects(true);
    const res = await syncProjectsToMongo();
    setIsSyncingProjects(false);
    if (res.success) {
      showToast(`✅ Synced ${res.count || projects.length} project(s) directly to MongoDB Atlas!`);
    } else {
      showToast(`⚠️ Sync failed: ${res.error || 'Server error'}`);
    }
  };

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'projects' | 'inquiries' | 'conversations' | 'testimonials' | 'settings'
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Conversations State
  const [conversationFilter, setConversationFilter] = useState('all'); // 'all' | 'new' | 'awaiting_reply' | 'active' | 'closed'
  const [conversationSearch, setConversationSearch] = useState('');
  const [activeComposerTab, setActiveComposerTab] = useState('email'); // 'email' | 'note'
  const [composerText, setComposerText] = useState('');
  const [composerSubject, setComposerSubject] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [composerError, setComposerError] = useState(null);
  const [mobileThreadView, setMobileThreadView] = useState(false); // Mobile: false = list, true = thread

  // Modal for logging client offline reply
  const [isAddClientMsgOpen, setIsAddClientMsgOpen] = useState(false);
  const [clientMsgChannel, setClientMsgChannel] = useState('email'); // 'email' | 'whatsapp' | 'manual'
  const [clientMsgText, setClientMsgText] = useState('');
  const [isLoggingClientMsg, setIsLoggingClientMsg] = useState(false);

  // Password Change Modal State
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const standardCategories = ["SaaS & AI", "E-Commerce", "Fintech", "Luxury & Brand"];
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryVal, setCustomCategoryVal] = useState('');

  // Project Modal State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectModalTab, setProjectModalTab] = useState('metadata'); // 'metadata' | 'gallery'
  const [editingProject, setEditingProject] = useState(null);
  const [projectForm, setProjectForm] = useState({
    title: '',
    client: '',
    category: 'SaaS & AI',
    result: '+120% Conversion',
    tagline: '',
    liveUrl: '',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
    problem: '',
    solution: '',
    metric1Label: 'Conversion Uplift',
    metric1Val: '+120%',
    metric2Label: 'New ARR',
    metric2Val: '$4.2M',
    galleryItems: []
  });

  // Testimonial Modal State
  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [testimonialForm, setTestimonialForm] = useState({
    author: '',
    role: '',
    company: '',
    quote: '',
    impact: '3x Pipeline Growth',
    highlight: 'Payback in 14 Days',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop',
    rating: 5
  });

  // Lead Detail Modal
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    if (currentUser) {
      fetchStats();
      fetchConversations();
    }
  }, [currentUser]);

  // Handle Thread Selection
  const handleSelectThread = (convId) => {
    fetchConversationById(convId);
    setMobileThreadView(true);
    setComposerError(null);
  };

  // Open Thread Directly from Inquiry
  const handleOpenThreadFromInquiry = (inq) => {
    handleSelectThread(inq.id);
    setActiveTab('conversations');
  };

  // Send Reply / Internal Note
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!composerText.trim() || !activeThread) return;

    setIsSendingMessage(true);
    setComposerError(null);

    const type = activeComposerTab === 'email' ? 'outbound' : 'note';
    const channel = activeComposerTab === 'email' ? 'email' : 'manual';

    const result = await sendMessage(activeThread.conversation.id, {
      type,
      channel,
      body: composerText.trim(),
      subject: composerSubject.trim() || undefined
    });

    setIsSendingMessage(false);

    if (result.success) {
      setComposerText('');
      setComposerSubject('');
      showToast(activeComposerTab === 'email' ? 'Outbound email sent and logged.' : 'Internal note saved.');
    } else {
      setComposerError(result.error || 'Failed to dispatch message.');
    }
  };

  // Log Client Message (e.g. received via WhatsApp or phone call)
  const handleAddClientMessageSubmit = async (e) => {
    e.preventDefault();
    if (!clientMsgText.trim() || !activeThread) return;

    setIsLoggingClientMsg(true);
    const result = await sendMessage(activeThread.conversation.id, {
      type: 'inbound',
      channel: clientMsgChannel,
      body: clientMsgText.trim()
    });

    setIsLoggingClientMsg(false);

    if (result.success) {
      setClientMsgText('');
      setIsAddClientMsgOpen(false);
      showToast('Client message added to thread.');
    } else {
      alert(result.error || 'Failed to add client message.');
    }
  };

  // Copy WhatsApp Link with Pre-filled Message
  const handleCopyWhatsAppLink = () => {
    if (!activeThread || !activeThread.conversation) return;
    const conv = activeThread.conversation;
    const cleanPhone = (conv.whatsapp || '').replace(/[^0-9]/g, '');
    const prefilledText = encodeURIComponent(
      `Hi ${conv.name}, this is Aditya from WebRêve Studio regarding your ${conv.plan || 'custom website'} project inquiry.`
    );
    const link = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${prefilledText}`
      : `https://wa.me/?text=${prefilledText}`;

    navigator.clipboard.writeText(link);
    showToast('WhatsApp link copied with drafted message!');
  };

  // Create Project from Lead
  const handleCreateProjectFromLead = (conv) => {
    setEditingProject(null);
    setProjectForm({
      title: `${conv.name} · Platform Launch`,
      client: conv.name,
      category: conv.plan === 'Static Launch' ? 'Luxury & Brand' : 'SaaS & AI',
      result: '+140% Conversion',
      tagline: `Bespoke digital architecture engineered for ${conv.name}.`,
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
      problem: `Prospect initiated inquiry with ${conv.plan} (Estimate: ₹${(conv.total || 0).toLocaleString()}).`,
      solution: 'Engineered high-converting React application with ultra-responsive UX flows.',
      metric1Label: 'Conversion Uplift',
      metric1Val: '+140%',
      metric2Label: 'Launch Speed',
      metric2Val: '14 Days',
      galleryItems: createDefaultGalleryItems(conv.name)
    });
    setActiveTab('projects');
    setIsProjectModalOpen(true);
    showToast('Pre-populated new project from lead details.');
  };

  // Gallery Item Template Generator
  const createDefaultGalleryItems = (title = "Platform Overview", coverImg = "") => [
    {
      id: `frame-${Date.now()}-1`,
      title: `${title || 'Platform'} · Hero Workspace`,
      cat: "Desktop",
      kind: "desktop",
      tone: "ink",
      c: 8,
      r: 4,
      src: coverImg || "",
      note: "Primary headline and instant 1-click booking flow above the fold."
    },
    {
      id: `frame-${Date.now()}-2`,
      title: "Mobile Responsive Flow",
      cat: "Mobile",
      kind: "mobile",
      tone: "rust",
      c: 4,
      r: 4,
      src: "",
      note: "Optimized gesture navigation with sub-second touch feedback."
    }
  ];

  // Gallery Management Helpers
  const handleAddBlankGalleryItem = () => {
    const newItem = {
      id: `frame-${Date.now()}-${(projectForm.galleryItems?.length || 0) + 1}`,
      title: 'New Interface View',
      cat: 'Desktop',
      kind: 'desktop',
      tone: 'ink',
      c: 8,
      r: 4,
      src: '',
      note: 'Key workflow feature and interactive presentation.'
    };
    setProjectForm(prev => ({
      ...prev,
      galleryItems: [...(prev.galleryItems || []), newItem]
    }));
  };

  const handleUpdateGalleryItem = (index, field, value) => {
    setProjectForm(prev => {
      const items = [...(prev.galleryItems || [])];
      if (items[index]) {
        items[index] = { ...items[index], [field]: value };
        // Sync kind with cat
        if (field === 'cat') {
          const lower = value.toLowerCase();
          if (lower.includes('desktop')) {
            items[index].kind = 'desktop';
            items[index].c = 8;
          } else if (lower.includes('mobile')) {
            items[index].kind = 'mobile';
            items[index].c = 4;
          } else if (lower.includes('detail')) {
            items[index].kind = 'detail';
            items[index].c = 4;
          } else {
            items[index].kind = 'system';
            items[index].c = 5;
          }
        }
      }
      return { ...prev, galleryItems: items };
    });
  };

  const handleDeleteGalleryItem = (index) => {
    setProjectForm(prev => ({
      ...prev,
      galleryItems: (prev.galleryItems || []).filter((_, i) => i !== index)
    }));
  };

  const [isBatchUploadingGallery, setIsBatchUploadingGallery] = useState(false);

  const handleBatchGalleryUpload = async (files) => {
    if (!files || files.length === 0) return;
    setIsBatchUploadingGallery(true);
    const newItems = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      try {
        const formData = new FormData();
        formData.append('image', file);
        const response = await fetch(apiUrl('/api/upload'), {
          method: 'POST',
          body: formData
        });
        const contentType = response.headers.get('content-type') || '';
        let url = '';
        if (response.ok && contentType.includes('application/json')) {
          const data = await response.json();
          url = data.url;
        }
        if (!url) {
          // Client-side high-res base64 fallback
          url = await new Promise((res) => {
            const r = new FileReader();
            r.onload = (e) => res(e.target?.result || '');
            r.readAsDataURL(file);
          });
        }
        if (url) {
          const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
          const isWide = i % 2 === 0;
          newItems.push({
            id: `frame-${Date.now()}-${i}`,
            title: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
            cat: isWide ? "Desktop" : "Mobile",
            kind: isWide ? "desktop" : "mobile",
            tone: i % 3 === 0 ? "ink" : i % 3 === 1 ? "rust" : "paper",
            c: isWide ? 8 : 4,
            r: 4,
            src: url,
            note: `${cleanName} interactive screen view.`
          });
        }
      } catch (err) {
        console.warn("Gallery batch upload notice:", err.message);
      }
    }
    setIsBatchUploadingGallery(false);
    if (newItems.length > 0) {
      setProjectForm(prev => ({
        ...prev,
        galleryItems: [...(prev.galleryItems || []), ...newItems]
      }));
      showToast(`Added ${newItems.length} image(s) to gallery.`);
    }
  };

  // Open Project Modal
  const openProjectModal = (proj = null) => {
    if (proj) {
      setEditingProject(proj);
      const isCustom = !standardCategories.includes(proj.category);
      setIsCustomCategory(isCustom);
      setCustomCategoryVal(isCustom ? proj.category : '');

      setProjectForm({
        title: proj.title || '',
        client: proj.client || '',
        category: proj.category || 'SaaS & AI',
        result: proj.result || '+120% Conversion',
        tagline: proj.tagline || '',
        liveUrl: proj.liveUrl || '',
        image: proj.image || '',
        problem: proj.problem || '',
        solution: proj.solution || '',
        metric1Label: proj.metrics?.[0]?.label || 'Conversion Uplift',
        metric1Val: proj.metrics?.[0]?.value || '+120%',
        metric2Label: proj.metrics?.[1]?.label || 'New ARR',
        metric2Val: proj.metrics?.[1]?.value || '$4.2M',
        galleryItems: proj.galleryItems || createDefaultGalleryItems(proj.title, proj.image)
      });
    } else {
      setEditingProject(null);
      setIsCustomCategory(false);
      setCustomCategoryVal('');
      const defaultTitle = 'New Client Platform';
      const defaultImg = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop';
      setProjectForm({
        title: '',
        client: '',
        category: 'SaaS & AI',
        result: '+120% Conversion',
        tagline: '',
        liveUrl: '',
        image: defaultImg,
        problem: '',
        solution: '',
        metric1Label: 'Conversion Uplift',
        metric1Val: '+120%',
        metric2Label: 'New ARR',
        metric2Val: '$4.2M',
        galleryItems: createDefaultGalleryItems(defaultTitle, defaultImg)
      });
    }
    setProjectModalTab('metadata');
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = (e) => {
    e.preventDefault();
    if (!projectForm.title.trim()) return;

    const payload = {
      title: projectForm.title,
      client: projectForm.client || projectForm.title,
      category: isCustomCategory ? customCategoryVal.trim() || 'Custom' : projectForm.category,
      result: projectForm.result,
      tagline: projectForm.tagline || 'Bespoke high-performance digital build.',
      liveUrl: projectForm.liveUrl?.trim() || '',
      image: projectForm.image,
      problem: projectForm.problem || 'Legacy user experience and low conversion efficiency.',
      solution: projectForm.solution || 'Re-architected UX flow and ultra-fast visual presentation.',
      metrics: [
        { label: projectForm.metric1Label, value: projectForm.metric1Val },
        { label: projectForm.metric2Label, value: projectForm.metric2Val }
      ],
      galleryItems: projectForm.galleryItems
    };

    if (editingProject) {
      updateProject(editingProject.id, payload);
      showToast('Project updated.');
    } else {
      addProject(payload);
      showToast('New project created.');
    }
    setIsProjectModalOpen(false);
  };

  // Open Testimonial Modal
  const openTestimonialModal = (testi = null) => {
    if (testi) {
      setEditingTestimonial(testi);
      setTestimonialForm({
        author: testi.author || '',
        role: testi.role || '',
        company: testi.company || '',
        quote: testi.quote || '',
        impact: testi.impact || '',
        highlight: testi.highlight || '',
        avatar: testi.avatar || '',
        rating: testi.rating || 5
      });
    } else {
      setEditingTestimonial(null);
      setTestimonialForm({
        author: '',
        role: 'Founder & CEO',
        company: '',
        quote: '',
        impact: '+250% Growth',
        highlight: 'Exceptional ROI',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop',
        rating: 5
      });
    }
    setIsTestimonialModalOpen(true);
  };

  const handleSaveTestimonial = (e) => {
    e.preventDefault();
    if (!testimonialForm.author.trim() || !testimonialForm.quote.trim()) return;

    const payload = {
      author: testimonialForm.author,
      role: testimonialForm.role,
      company: testimonialForm.company,
      quote: testimonialForm.quote,
      impact: testimonialForm.impact,
      highlight: testimonialForm.highlight,
      avatar: testimonialForm.avatar,
      rating: Number(testimonialForm.rating) || 5
    };

    if (editingTestimonial) {
      updateTestimonial(editingTestimonial.id, payload);
      showToast('Testimonial updated.');
    } else {
      addTestimonial(payload);
      showToast('Testimonial added.');
    }
    setIsTestimonialModalOpen(false);
  };

  // Filtered Conversations List
  const filteredConversations = conversations.filter((c) => {
    // 1. Status Filter
    if (conversationFilter !== 'all') {
      if (conversationFilter === 'closed') {
        if (c.status !== 'won' && c.status !== 'lost') return false;
      } else if (c.status !== conversationFilter) {
        return false;
      }
    }
    // 2. Search Query
    if (conversationSearch && conversationSearch.trim()) {
      const q = conversationSearch.toLowerCase().trim();
      const matchName = (c.name || '').toLowerCase().includes(q);
      const matchEmail = (c.email || '').toLowerCase().includes(q);
      const matchPlan = (c.plan || '').toLowerCase().includes(q);
      const matchPreview = (c.preview || '').toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPlan && !matchPreview) return false;
    }
    return true;
  });

  // Filtered Inquiries
  const filteredInquiries = inquiries.filter(
    (inq) =>
      inq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inq.projectType && inq.projectType.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (inq.status && inq.status.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Filtered Projects
  const filteredProjects = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.client && p.client.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordChangeError(null);
    setIsChangingPassword(true);
    try {
      const res = await changePassword(oldPassword, newPassword);
      if (res.success) {
        showToast('Password updated in MongoDB.');
        setIsChangePasswordOpen(false);
        setOldPassword('');
        setNewPassword('');
      } else {
        setPasswordChangeError(res.error || 'Failed to update password.');
      }
    } catch (err) {
      setPasswordChangeError(err.message || 'Error updating password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // 1. Loading State
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#0E0C0A] flex flex-col items-center justify-center font-mono text-xs text-[#F0EBE1] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#C1512F]" />
        <span className="tracking-widest uppercase font-bold">VERIFYING EXECUTIVE CREDENTIALS...</span>
      </div>
    );
  }

  // 2. Unauthenticated Gate
  if (!currentUser) {
    return <AdminAuthGate />;
  }

  return (
    <div className="min-h-screen bg-[#F0EBE1] text-[#1A1512] font-sans flex flex-col w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1A1512] text-white px-5 py-3 shadow-2xl border border-[#C1512F] font-mono text-xs font-bold tracking-widest flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#C1512F]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#F0EBE1] border-b border-[#1A1512]/15 px-3 sm:px-6 md:px-10 py-3 sm:py-3.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Link to="/" className="flex items-center gap-1 group shrink-0">
            <span className="font-display font-extrabold text-xl sm:text-2xl tracking-tight text-[#1A1512]">
              WEBREVE
            </span>
            <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-[#C1512F] inline-block mb-1" />
          </Link>
          <span className="hidden xs:inline-block font-mono text-[9px] sm:text-[10px] font-bold tracking-widest px-2 sm:px-2.5 py-0.5 bg-[#1A1512] text-white uppercase shrink-0">
            ADMIN
          </span>
          <div className="hidden lg:flex items-center gap-1.5 font-mono text-[10px] text-[#1A1512]/70 bg-[#1A1512]/5 px-2.5 py-0.5 border border-[#1A1512]/15 truncate max-w-[200px]">
            <ShieldCheck className="w-3 h-3 text-[#C1512F] shrink-0" />
            <span className="font-bold truncate">{currentUser.email}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            onClick={() => {
              if (window.confirm('Reset all modified projects, inquiries and conversations back to template defaults?')) {
                resetToDefaults();
                showToast('Reset back to factory defaults.');
              }
            }}
            className="hidden xl:flex items-center gap-1.5 text-xs font-mono font-bold tracking-widest text-[#1A1512]/50 hover:text-[#C1512F] transition-colors cursor-pointer"
            title="Reset to Template Defaults"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>RESET DATA</span>
          </button>

          <Link
            to="/"
            className="px-2.5 sm:px-3 py-1 sm:py-1.5 border border-[#1A1512] bg-[#1A1512] text-white hover:bg-[#C1512F] hover:border-[#C1512F] transition-colors text-[10px] sm:text-xs font-mono font-bold tracking-widest flex items-center gap-1 sm:gap-1.5"
          >
            <span>LIVE SITE</span>
            <ArrowUpRight className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
          </Link>

          <button
            onClick={logout}
            className="px-2.5 sm:px-3 py-1 sm:py-1.5 border border-[#1A1512]/30 hover:bg-[#C1512F] hover:text-white hover:border-[#C1512F] transition-colors text-[10px] sm:text-xs font-mono font-bold tracking-widest flex items-center gap-1 sm:gap-1.5 cursor-pointer"
            title="Log out of Admin Suite"
          >
            <LogOut className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
            <span>LOGOUT</span>
          </button>
        </div>
      </header>

      {/* Admin Layout Body */}
      <div className="flex-1 flex flex-col md:flex-row w-full">
        {/* Sidebar Nav: Horizontal scroll on mobile, Vertical on desktop */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[#1A1512]/15 bg-[#F0EBE1] p-3 sm:p-4 md:p-6 md:space-y-6 shrink-0">
          <div className="space-y-1">
            <span className="hidden md:block font-mono text-[10px] font-bold tracking-widest text-[#1A1512]/40 uppercase">
              NAVIGATION
            </span>

            <nav className="flex md:flex-col overflow-x-auto md:overflow-visible gap-1.5 md:space-y-1 md:pt-2 font-mono text-xs font-bold tracking-widest scrollbar-none py-1 md:py-0">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center justify-between px-3 py-2 sm:py-2.5 text-left transition-colors cursor-pointer whitespace-nowrap shrink-0 md:w-full ${
                  activeTab === 'overview'
                    ? 'bg-[#1A1512] text-white'
                    : 'bg-[#1A1512]/5 md:bg-transparent text-[#1A1512]/70 hover:bg-[#1A1512]/10 md:hover:bg-[#1A1512]/5 hover:text-[#1A1512]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  <span>OVERVIEW</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('projects')}
                className={`flex items-center justify-between gap-2 px-3 py-2 sm:py-2.5 text-left transition-colors cursor-pointer whitespace-nowrap shrink-0 md:w-full ${
                  activeTab === 'projects'
                    ? 'bg-[#1A1512] text-white'
                    : 'bg-[#1A1512]/5 md:bg-transparent text-[#1A1512]/70 hover:bg-[#1A1512]/10 md:hover:bg-[#1A1512]/5 hover:text-[#1A1512]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FolderKanban className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  <span>PROJECTS</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.2 border ${activeTab === 'projects' ? 'border-white/30 text-white' : 'border-[#1A1512]/20 text-[#1A1512]/70'}`}>
                  {projects.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('inquiries')}
                className={`flex items-center justify-between gap-2 px-3 py-2 sm:py-2.5 text-left transition-colors cursor-pointer whitespace-nowrap shrink-0 md:w-full ${
                  activeTab === 'inquiries'
                    ? 'bg-[#1A1512] text-white'
                    : 'bg-[#1A1512]/5 md:bg-transparent text-[#1A1512]/70 hover:bg-[#1A1512]/10 md:hover:bg-[#1A1512]/5 hover:text-[#1A1512]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Inbox className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  <span>LEADS & INBOX</span>
                </div>
                {stats.newLeads > 0 ? (
                  <span className="bg-[#C1512F] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-xs">
                    {stats.newLeads}
                  </span>
                ) : (
                  <span className={`text-[10px] px-1.5 py-0.2 border ${activeTab === 'inquiries' ? 'border-white/30 text-white' : 'border-[#1A1512]/20 text-[#1A1512]/70'}`}>
                    {inquiries.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setActiveTab('conversations');
                  if (!activeThread && conversations.length > 0) {
                    handleSelectThread(conversations[0].id);
                  }
                }}
                className={`flex items-center justify-between gap-2 px-3 py-2 sm:py-2.5 text-left transition-colors cursor-pointer whitespace-nowrap shrink-0 md:w-full ${
                  activeTab === 'conversations'
                    ? 'bg-[#1A1512] text-white'
                    : 'bg-[#1A1512]/5 md:bg-transparent text-[#1A1512]/70 hover:bg-[#1A1512]/10 md:hover:bg-[#1A1512]/5 hover:text-[#1A1512]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  <span>CONVERSATIONS</span>
                </div>
                {unreadConversationsCount > 0 ? (
                  <span className="bg-[#C1512F] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-xs">
                    {unreadConversationsCount}
                  </span>
                ) : (
                  <span className={`text-[10px] px-1.5 py-0.2 border ${activeTab === 'conversations' ? 'border-white/30 text-white' : 'border-[#1A1512]/20 text-[#1A1512]/70'}`}>
                    {conversations.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('testimonials')}
                className={`flex items-center justify-between gap-2 px-3 py-2 sm:py-2.5 text-left transition-colors cursor-pointer whitespace-nowrap shrink-0 md:w-full ${
                  activeTab === 'testimonials'
                    ? 'bg-[#1A1512] text-white'
                    : 'bg-[#1A1512]/5 md:bg-transparent text-[#1A1512]/70 hover:bg-[#1A1512]/10 md:hover:bg-[#1A1512]/5 hover:text-[#1A1512]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Quote className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  <span>TESTIMONIALS</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.2 border ${activeTab === 'testimonials' ? 'border-white/30 text-white' : 'border-[#1A1512]/20 text-[#1A1512]/70'}`}>
                  {testimonials.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center justify-between gap-2 px-3 py-2 sm:py-2.5 text-left transition-colors cursor-pointer whitespace-nowrap shrink-0 md:w-full ${
                  activeTab === 'settings'
                    ? 'bg-[#1A1512] text-white'
                    : 'bg-[#1A1512]/5 md:bg-transparent text-[#1A1512]/70 hover:bg-[#1A1512]/10 md:hover:bg-[#1A1512]/5 hover:text-[#1A1512]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  <span>AGENCY INFO</span>
                </div>
              </button>
            </nav>
          </div>

          <div className="hidden md:block pt-6 border-t border-[#1A1512]/15 font-mono text-[11px] space-y-2">
            <div className="text-[#1A1512]/50 uppercase tracking-widest">STATUS</div>
            <div className="flex items-center gap-2 text-[#1A1512]">
              <span className="w-2 h-2 bg-[#10B981] inline-block animate-pulse" />
              <span className="font-bold">AVAILABILITY:</span>
            </div>
            <p className="text-[10px] text-[#1A1512]/70">{agencyInfo.contact?.availability || 'Accepting Q4 Client Projects'}</p>
          </div>
        </aside>

        {/* Main Admin Content Area */}
        <main className="flex-1 p-3 sm:p-6 md:p-8 w-full max-w-none overflow-x-hidden">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 sm:space-y-8 w-full">
              {/* Header */}
              <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[#1A1512]/15 pb-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display uppercase tracking-tight">
                    STUDIO OVERVIEW
                  </h1>
                  <p className="font-mono text-xs text-[#1A1512]/60 uppercase tracking-widest mt-1">
                    PERFORMANCE METRICS & REAL-TIME PIPELINE HEALTH
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => openProjectModal()}
                    className="px-4 py-2 bg-[#1A1512] text-white hover:bg-[#C1512F] font-mono text-xs font-bold tracking-widest flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>NEW PROJECT</span>
                  </button>
                </div>
              </div>

              {/* KPI Cards Grid (Real Counts) */}
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="border border-[#1A1512]/15 p-4 sm:p-5 bg-[#F0EBE1] space-y-1.5 sm:space-y-2">
                  <div className="flex items-center justify-between text-[#1A1512]/50 font-mono text-[10px] sm:text-[11px] font-bold tracking-widest">
                    <span>DELIVERED WORK</span>
                    <Briefcase className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#C1512F]" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold font-display text-[#1A1512]">
                    {projects.length}
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-[#1A1512]/60 font-mono">
                    Live Case Studies
                  </p>
                </div>

                <div className="border border-[#1A1512]/15 p-4 sm:p-5 bg-[#F0EBE1] space-y-1.5 sm:space-y-2">
                  <div className="flex items-center justify-between text-[#1A1512]/50 font-mono text-[10px] sm:text-[11px] font-bold tracking-widest">
                    <span>NEW LEADS</span>
                    <Inbox className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#C1512F]" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold font-display text-[#1A1512]">
                    {stats.newLeads}
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-[#1A1512]/60 font-mono">
                    Awaiting Discovery
                  </p>
                </div>

                <div className="border border-[#1A1512]/15 p-4 sm:p-5 bg-[#F0EBE1] space-y-1.5 sm:space-y-2">
                  <div className="flex items-center justify-between text-[#1A1512]/50 font-mono text-[10px] sm:text-[11px] font-bold tracking-widest">
                    <span>AWAITING REPLY</span>
                    <MessageSquare className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#C1512F]" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold font-display text-[#1A1512]">
                    {stats.awaitingReply}
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-[#1A1512]/60 font-mono">
                    Action Required
                  </p>
                </div>

                <div className="border border-[#1A1512]/15 p-4 sm:p-5 bg-[#F0EBE1] space-y-1.5 sm:space-y-2">
                  <div className="flex items-center justify-between text-[#1A1512]/50 font-mono text-[10px] sm:text-[11px] font-bold tracking-widest">
                    <span>WON THIS MONTH</span>
                    <TrendingUp className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#C1512F]" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold font-display text-[#1A1512] truncate">
                    {stats.wonThisMonthCount} <span className="text-xs sm:text-sm font-mono font-normal text-[#1A1512]/60">(₹{stats.wonRevenue.toLocaleString()})</span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-[#1A1512]/60 font-mono">
                    Signed & Converted
                  </p>
                </div>
              </div>

              {/* Recent Inquiries Quick Table */}
              <div className="border border-[#1A1512]/15 p-4 sm:p-6 space-y-4 bg-[#F0EBE1]">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1A1512]/15 pb-3">
                  <h3 className="font-display text-xl sm:text-2xl font-bold uppercase">
                    RECENT CLIENT INQUIRIES
                  </h3>
                  <button
                    onClick={() => setActiveTab('conversations')}
                    className="font-mono text-xs font-bold text-[#C1512F] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>VIEW CONVERSATIONS</span>
                    <span>→</span>
                  </button>
                </div>

                <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                  <table className="w-full text-left font-mono text-xs min-w-[560px]">
                    <thead>
                      <tr className="border-b border-[#1A1512]/10 text-[#1A1512]/50 font-bold text-[10px] uppercase">
                        <th className="py-2.5 px-3">PROSPECT</th>
                        <th className="py-2.5 px-3">PLAN & SCOPE</th>
                        <th className="py-2.5 px-3">TOTAL</th>
                        <th className="py-2.5 px-3">STATUS</th>
                        <th className="py-2.5 px-3 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1A1512]/10">
                      {inquiries.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-8 text-center text-[#1A1512]/50 font-mono text-xs">
                            No inquiries yet. Inquiries from your contact form will appear here.
                          </td>
                        </tr>
                      ) : (
                        inquiries.slice(0, 5).map((inq) => (
                          <tr key={inq.id} className="hover:bg-[#1A1512]/5 transition-colors">
                            <td className="py-3 px-3">
                              <div className="font-bold text-[#1A1512]">{inq.name}</div>
                              <div className="text-[10px] text-[#1A1512]/50 font-normal truncate max-w-[160px]">{inq.email}</div>
                            </td>
                            <td className="py-3 px-3 text-[#1A1512]/80">
                              <span className="font-bold">{formatPlanAndTerms(inq)}</span>
                            </td>
                            <td className="py-3 px-3 text-[#1A1512] font-bold">
                              {inq.total ? `₹${inq.total.toLocaleString()}` : inq.budget || '₹10,000'}
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                                  inq.status === 'new'
                                    ? 'bg-[#C1512F] text-white'
                                    : inq.status === 'awaiting_reply'
                                    ? 'bg-[#C1512F]/80 text-white'
                                    : inq.status === 'active'
                                    ? 'bg-[#1A1512] text-white'
                                    : inq.status === 'won'
                                    ? 'bg-[#10B981] text-white'
                                    : 'bg-[#1A1512]/10 text-[#1A1512]'
                                }`}
                              >
                                {(inq.status || 'new').replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => handleOpenThreadFromInquiry(inq)}
                                className="text-[#1A1512] hover:text-[#C1512F] font-bold cursor-pointer underline flex items-center justify-end gap-1 ml-auto"
                              >
                                <span>VIEW THREAD</span>
                                <CornerDownRight className="w-3 h-3" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CONVERSATIONS (TWO PANE SUITE) */}
          {activeTab === 'conversations' && (
            <div className="space-y-4 sm:space-y-6 w-full">
              {/* Header */}
              <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-[#1A1512]/15 pb-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display uppercase tracking-tight">
                    CONVERSATIONS
                  </h1>
                  <p className="font-mono text-[10px] sm:text-xs text-[#1A1512]/60 uppercase tracking-widest mt-1">
                    CLIENT THREADS, INBOUND INQUIRIES & DIRECT EMAIL DISPATCH
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-[#1A1512]/60">
                    {conversations.length} Active Threads
                  </span>
                </div>
              </div>

              {/* Two Pane Layout Container */}
              <div className="border border-[#1A1512]/20 bg-[#F0EBE1] grid grid-cols-1 lg:grid-cols-12 min-h-[500px] lg:min-h-[680px]">
                
                {/* LEFT PANE: THREADS LIST (Hidden on mobile if thread view is open) */}
                <div
                  className={`lg:col-span-4 border-b lg:border-b-0 lg:border-r border-[#1A1512]/15 flex flex-col bg-[#F0EBE1] ${
                    mobileThreadView ? 'hidden lg:flex' : 'flex'
                  }`}
                >
                  {/* Search Bar */}
                  <div className="p-3 border-b border-[#1A1512]/15">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#1A1512]/40" />
                      <input
                        type="text"
                        placeholder="Search name, email, message..."
                        value={conversationSearch}
                        onChange={(e) => setConversationSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-[#E8E2D7] border border-[#1A1512]/15 text-xs font-sans text-[#1A1512] placeholder-[#1A1512]/40 focus:outline-none focus:border-[#1A1512]"
                      />
                    </div>
                  </div>

                  {/* Filter Chips */}
                  <div className="px-3 py-2.5 border-b border-[#1A1512]/15 flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono font-bold uppercase scrollbar-none">
                    {[
                      { id: 'all', label: 'ALL' },
                      { id: 'new', label: 'NEW' },
                      { id: 'awaiting_reply', label: 'AWAITING REPLY' },
                      { id: 'active', label: 'ACTIVE' },
                      { id: 'closed', label: 'CLOSED' }
                    ].map((chip) => (
                      <button
                        key={chip.id}
                        onClick={() => setConversationFilter(chip.id)}
                        className={`px-2.5 py-1 transition-colors whitespace-nowrap cursor-pointer ${
                          conversationFilter === chip.id
                            ? 'bg-[#1A1512] text-white'
                            : 'bg-[#1A1512]/5 text-[#1A1512]/70 hover:bg-[#1A1512]/10'
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>

                  {/* Threads List */}
                  <div className="flex-1 overflow-y-auto divide-y divide-[#1A1512]/10 max-h-[580px]">
                    {isLoadingConversations && conversations.length === 0 ? (
                      <div className="p-8 text-center text-xs font-mono text-[#1A1512]/50 flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#C1512F]" />
                        <span>LOADING THREADS...</span>
                      </div>
                    ) : filteredConversations.length === 0 ? (
                      <div className="p-8 text-center text-xs font-mono text-[#1A1512]/60 space-y-2">
                        <MessageSquare className="w-6 h-6 text-[#1A1512]/30 mx-auto" />
                        <p>No conversations yet. Inquiries from your contact form will appear here.</p>
                      </div>
                    ) : (
                      filteredConversations.map((thread) => {
                        const isSelected = activeThread?.conversation?.id === thread.id;
                        const hasUnread = (thread.unreadCount && thread.unreadCount > 0) || thread.status === 'awaiting_reply' || thread.status === 'new';

                        return (
                          <div
                            key={thread.id}
                            onClick={() => handleSelectThread(thread.id)}
                            className={`p-3.5 transition-colors cursor-pointer text-left space-y-1.5 ${
                              isSelected
                                ? 'bg-[#E8E2D7] border-l-4 border-l-[#C1512F]'
                                : 'hover:bg-[#1A1512]/5'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                {hasUnread && (
                                  <span className="w-2 h-2 bg-[#C1512F] inline-block shrink-0" title="Unread" />
                                )}
                                <span className={`font-sans font-bold text-xs truncate ${isSelected ? 'text-[#1A1512]' : 'text-[#1A1512]'}`}>
                                  {thread.name}
                                </span>
                              </div>
                              <span className="font-mono text-[10px] text-[#1A1512]/50 shrink-0">
                                {formatRelativeTime(thread.lastMessageAt || thread.createdAt)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[9px] uppercase px-1.5 py-0.2 bg-[#1A1512]/5 border border-[#1A1512]/10 text-[#1A1512]/70 font-bold shrink-0">
                                {thread.plan || 'Dynamic Build'}
                              </span>
                              <span className={`text-[9px] font-mono font-bold uppercase ${
                                thread.status === 'won' ? 'text-[#10B981]' : thread.status === 'lost' ? 'text-[#1A1512]/40' : 'text-[#C1512F]'
                              }`}>
                                • {thread.status.replace('_', ' ')}
                              </span>
                            </div>

                            <p className="text-xs text-[#1A1512]/70 line-clamp-1 font-sans">
                              {thread.preview || 'No message content'}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* RIGHT PANE: THREAD DETAIL & COMPOSER (Visible on desktop or when mobileThreadView is true) */}
                <div
                  className={`lg:col-span-8 flex flex-col justify-between bg-[#F0EBE1] ${
                    !mobileThreadView ? 'hidden lg:flex' : 'flex'
                  }`}
                >
                  {activeThread && activeThread.conversation ? (
                    <div className="flex flex-col h-full justify-between">
                      {/* Thread Header */}
                      <div className="p-4 sm:p-5 border-b border-[#1A1512]/15 bg-[#E8E2D7] space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            {/* Mobile Back Button */}
                            <button
                              onClick={() => setMobileThreadView(false)}
                              className="lg:hidden p-1.5 border border-[#1A1512]/20 hover:bg-[#1A1512] hover:text-white cursor-pointer"
                              title="Back to list"
                            >
                              <ArrowLeft className="w-4 h-4" />
                            </button>

                            <div>
                              <h2 className="text-xl sm:text-2xl font-display font-extrabold uppercase tracking-tight text-[#1A1512]">
                                {activeThread.conversation.name}
                              </h2>
                              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#1A1512]/70 mt-0.5">
                                <a
                                  href={`mailto:${activeThread.conversation.email}`}
                                  className="hover:text-[#C1512F] flex items-center gap-1 font-bold"
                                >
                                  <Mail className="w-3 h-3" />
                                  <span>{activeThread.conversation.email}</span>
                                </a>
                                {activeThread.conversation.whatsapp && (
                                  <a
                                    href={`https://wa.me/${activeThread.conversation.whatsapp.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="hover:text-[#C1512F] flex items-center gap-1 font-bold"
                                  >
                                    <Phone className="w-3 h-3 text-[#10B981]" />
                                    <span>{activeThread.conversation.whatsapp}</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Status Dropdown */}
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-[#1A1512]/60 uppercase font-bold">STATUS:</span>
                            <div className="relative">
                              <select
                                value={activeThread.conversation.status || 'new'}
                                onChange={(e) => updateConversationStatus(activeThread.conversation.id, e.target.value)}
                                className="appearance-none pr-7 pl-2.5 py-1 bg-[#F0EBE1] border border-[#1A1512] font-mono text-xs font-bold uppercase focus:outline-none cursor-pointer"
                              >
                                <option value="new">NEW</option>
                                <option value="awaiting_reply">AWAITING REPLY</option>
                                <option value="active">ACTIVE</option>
                                <option value="won">WON</option>
                                <option value="lost">LOST</option>
                              </select>
                              <ChevronDown className="w-3.5 h-3.5 text-[#1A1512] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Delete thread with ${activeThread.conversation.name}?`)) {
                                  deleteConversation(activeThread.conversation.id);
                                  showToast('Thread deleted.');
                                }
                              }}
                              className="p-1 border border-[#1A1512]/20 hover:bg-[#C1512F] hover:text-white hover:border-[#C1512F] transition-colors cursor-pointer inline-flex items-center justify-center ml-1"
                              title="Delete Thread"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Plan & Terms Banner */}
                        <div className="p-2.5 bg-[#F0EBE1] border border-[#1A1512]/15 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#1A1512] uppercase">
                              {activeThread.conversation.plan || 'Dynamic Build'}
                            </span>
                            {activeThread.conversation.extraMonths > 0 ? (
                              <span className="text-[#1A1512]/70">
                                • {activeThread.conversation.extraMonths} extra months maintenance
                              </span>
                            ) : null}
                          </div>
                          <div className="font-bold text-[#1A1512]">
                            TOTAL: ₹{(activeThread.conversation.total || 10000).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Message Timeline */}
                      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[380px] bg-[#F0EBE1]">
                        {isLoadingThread && (!activeThread.messages || activeThread.messages.length === 0) ? (
                          <div className="p-12 text-center text-xs font-mono text-[#1A1512]/50 flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-[#C1512F]" />
                            <span>FETCHING MESSAGES...</span>
                          </div>
                        ) : activeThread.messages && activeThread.messages.length > 0 ? (
                          activeThread.messages.map((msg) => {
                            if (msg.type === 'note') {
                              return (
                                <div
                                  key={msg.id}
                                  className="p-4 border-2 border-dashed border-[#C1512F] bg-[#C1512F]/5 space-y-1 max-w-2xl mx-auto font-sans"
                                >
                                  <div className="flex items-center justify-between text-[10px] font-mono text-[#C1512F] font-bold uppercase tracking-wider">
                                    <div className="flex items-center gap-1.5">
                                      <StickyNote className="w-3.5 h-3.5" />
                                      <span>INTERNAL NOTE · ONLY YOU CAN SEE THIS</span>
                                    </div>
                                    <span>{formatRelativeTime(msg.createdAt)}</span>
                                  </div>
                                  <p className="text-xs text-[#1A1512] whitespace-pre-wrap leading-relaxed">
                                    {msg.body}
                                  </p>
                                </div>
                              );
                            }

                            if (msg.type === 'outbound') {
                              return (
                                <div key={msg.id} className="flex justify-end">
                                  <div className="p-4 bg-[#1A1512] text-[#F0EBE1] max-w-xl space-y-1.5 shadow-md">
                                    <div className="flex items-center justify-between gap-4 text-[10px] font-mono text-[#F0EBE1]/60 font-bold uppercase">
                                      <div className="flex items-center gap-1">
                                        <Send className="w-3 h-3 text-[#C1512F]" />
                                        <span>YOU ({msg.channel.toUpperCase()})</span>
                                      </div>
                                      <span>{formatRelativeTime(msg.createdAt)}</span>
                                    </div>
                                    <p className="text-xs text-[#F0EBE1] whitespace-pre-wrap leading-relaxed font-sans">
                                      {msg.body}
                                    </p>
                                  </div>
                                </div>
                              );
                            }

                            // Inbound message (default)
                            return (
                              <div key={msg.id} className="flex justify-start">
                                <div className="p-4 bg-[#E8E2D7] border border-[#1A1512]/15 text-[#1A1512] max-w-xl space-y-1.5 shadow-sm">
                                  <div className="flex items-center justify-between gap-4 text-[10px] font-mono text-[#1A1512]/60 font-bold uppercase">
                                    <div className="flex items-center gap-1">
                                      <User className="w-3 h-3 text-[#C1512F]" />
                                      <span>{activeThread.conversation.name} ({msg.channel.toUpperCase()})</span>
                                    </div>
                                    <span>{formatRelativeTime(msg.createdAt)}</span>
                                  </div>
                                  <p className="text-xs text-[#1A1512] whitespace-pre-wrap leading-relaxed font-sans">
                                    {msg.body}
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-8 text-center text-xs font-mono text-[#1A1512]/50">
                            NO MESSAGES LOGGED YET.
                          </div>
                        )}
                      </div>

                      {/* Composer & Quick Actions */}
                      <div className="p-4 border-t border-[#1A1512]/15 bg-[#E8E2D7] space-y-3">
                        
                        {/* Composer Tabs */}
                        <div className="flex items-center justify-between border-b border-[#1A1512]/15 pb-2">
                          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase">
                            <button
                              onClick={() => setActiveComposerTab('email')}
                              className={`px-3 py-1 transition-colors cursor-pointer flex items-center gap-1.5 ${
                                activeComposerTab === 'email'
                                  ? 'bg-[#1A1512] text-white'
                                  : 'text-[#1A1512]/60 hover:text-[#1A1512]'
                              }`}
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>REPLY BY EMAIL</span>
                            </button>
                            <button
                              onClick={() => setActiveComposerTab('note')}
                              className={`px-3 py-1 transition-colors cursor-pointer flex items-center gap-1.5 ${
                                activeComposerTab === 'note'
                                  ? 'bg-[#1A1512] text-white'
                                  : 'text-[#1A1512]/60 hover:text-[#1A1512]'
                              }`}
                            >
                              <StickyNote className="w-3.5 h-3.5" />
                              <span>INTERNAL NOTE</span>
                            </button>
                          </div>
                        </div>

                        {/* Error Banner */}
                        {composerError && (
                          <div className="p-2.5 bg-[#C1512F]/10 border border-[#C1512F] text-[#C1512F] text-xs font-mono flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              <span>{composerError}</span>
                            </div>
                            <button
                              onClick={() => handleSendMessage()}
                              className="font-bold underline hover:text-[#1A1512]"
                            >
                              Retry
                            </button>
                          </div>
                        )}

                        {/* Composer Inputs */}
                        <form onSubmit={handleSendMessage} className="space-y-2">
                          <textarea
                            rows={3}
                            value={composerText}
                            onChange={(e) => setComposerText(e.target.value)}
                            placeholder={
                              activeComposerTab === 'email'
                                ? `Write an outbound email to ${activeThread.conversation.email}...`
                                : "Write an internal note (only visible to you)..."
                            }
                            className="w-full p-3 bg-[#F0EBE1] border border-[#1A1512]/20 text-xs font-sans text-[#1A1512] placeholder-[#1A1512]/40 focus:outline-none focus:border-[#1A1512] resize-none"
                          />

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                            {/* Quick Actions Toolbar */}
                            <div className="flex flex-wrap items-center gap-1.5 text-[9px] sm:text-[10px] font-mono font-bold uppercase">
                              <button
                                type="button"
                                onClick={handleCopyWhatsAppLink}
                                className="px-2 py-1 border border-[#1A1512]/30 bg-[#F0EBE1] hover:bg-[#1A1512] hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                                title="Copy pre-filled WhatsApp link"
                              >
                                <Phone className="w-3 h-3 text-[#10B981]" />
                                <span>COPY WA LINK</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setIsAddClientMsgOpen(true)}
                                className="px-2 py-1 border border-[#1A1512]/30 bg-[#F0EBE1] hover:bg-[#1A1512] hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                                title="Log a client response received elsewhere"
                              >
                                <Plus className="w-3 h-3" />
                                <span>ADD CLIENT MSG</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  updateConversationStatus(activeThread.conversation.id, 'won');
                                  showToast('Lead marked as WON!');
                                }}
                                className="px-2 py-1 border border-[#10B981] bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981] hover:text-white transition-colors cursor-pointer"
                              >
                                MARK WON
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  updateConversationStatus(activeThread.conversation.id, 'lost');
                                  showToast('Lead marked as lost.');
                                }}
                                className="px-2 py-1 border border-[#1A1512]/20 text-[#1A1512]/60 hover:bg-[#1A1512] hover:text-white transition-colors cursor-pointer"
                              >
                                MARK LOST
                              </button>

                              <button
                                type="button"
                                onClick={() => handleCreateProjectFromLead(activeThread.conversation)}
                                className="px-2 py-1 border border-[#C1512F] text-[#C1512F] bg-[#C1512F]/10 hover:bg-[#C1512F] hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <FolderKanban className="w-3 h-3" />
                                <span>CREATE PROJECT</span>
                              </button>
                            </div>

                            {/* Submit Button */}
                            <button
                              type="submit"
                              disabled={isSendingMessage || !composerText.trim()}
                              className="w-full sm:w-auto px-5 py-2 bg-[#1A1512] hover:bg-[#C1512F] disabled:bg-[#1A1512]/40 text-white font-mono text-xs font-bold tracking-widest uppercase transition-colors cursor-pointer flex items-center justify-center gap-1.5 sm:ml-auto"
                            >
                              {isSendingMessage ? (
                                <span>DISPATCHING...</span>
                              ) : activeComposerTab === 'email' ? (
                                <>
                                  <span>SEND EMAIL</span>
                                  <Send className="w-3 h-3" />
                                </>
                              ) : (
                                <span>SAVE NOTE</span>
                              )}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center h-full text-[#1A1512]/60 font-mono space-y-3">
                      <div className="w-12 h-12 border border-[#1A1512]/20 flex items-center justify-center text-[#1A1512]/40">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-xs uppercase text-[#1A1512]">
                        {conversations.length === 0 ? 'NO CONVERSATIONS YET' : 'SELECT A CONVERSATION THREAD'}
                      </div>
                      <p className="text-xs text-[#1A1512]/70 max-w-sm font-sans">
                        {conversations.length === 0
                          ? 'No conversations yet. Inquiries from your contact form will appear here.'
                          : 'Choose a client lead from the left pane to view messages, dispatch email replies, or save internal notes.'}
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: PROJECTS DELIVERED */}
          {activeTab === 'projects' && (
            <div className="space-y-6 w-full">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[#1A1512]/15 pb-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display uppercase tracking-tight">
                    PROJECTS DELIVERED
                  </h1>
                  <p className="font-mono text-xs text-[#1A1512]/60 uppercase tracking-widest mt-1">
                    MANAGE PORTFOLIO CASE STUDIES
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#1A1512]/40" />
                    <input
                      type="text"
                      placeholder="SEARCH PROJECTS..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full sm:w-auto pl-9 pr-3 py-2 border border-[#1A1512]/20 font-mono text-xs focus:outline-none focus:border-[#1A1512] bg-[#F0EBE1]"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={isSyncingProjects}
                    onClick={handleSyncAllProjects}
                    className="px-3.5 py-2 border border-[#1A1512]/30 hover:border-[#1A1512] bg-[#F0EBE1] hover:bg-[#1A1512] hover:text-white font-mono text-xs font-bold tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                    title="Push and sync all current portfolio projects directly to MongoDB Atlas database"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingProjects ? 'animate-spin text-[#C1512F]' : ''}`} />
                    <span>{isSyncingProjects ? 'SYNCING...' : 'SYNC TO MONGO'}</span>
                  </button>
                  <button
                    onClick={() => openProjectModal()}
                    className="px-4 py-2 bg-[#1A1512] text-white hover:bg-[#C1512F] font-mono text-xs font-bold tracking-widest flex items-center gap-2 transition-colors cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>ADD PROJECT</span>
                  </button>
                </div>
              </div>

              {/* Projects Grid */}
              {filteredProjects.length === 0 ? (
                <div className="border border-[#1A1512]/15 bg-[#F0EBE1] p-10 sm:p-14 text-center space-y-4">
                  <div className="font-mono text-xs text-[#1A1512]/50 uppercase tracking-widest font-bold">
                    [ NO PROJECTS REGISTERED ]
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl font-extrabold uppercase text-[#1A1512]">
                    PORTFOLIO DIRECTORY IS EMPTY
                  </h3>
                  <p className="font-mono text-xs text-[#1A1512]/70 max-w-md mx-auto leading-relaxed">
                    All default projects have been removed. Click below to add your first real project with custom images, mockups, and live URLs.
                  </p>
                  <div>
                    <button
                      onClick={() => openProjectModal()}
                      className="px-5 py-2.5 bg-[#1A1512] text-white hover:bg-[#C1512F] font-mono text-xs font-bold tracking-widest inline-flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>CREATE FIRST PROJECT</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {filteredProjects.map((project, index) => (
                    <div
                      key={project.id}
                      className="border border-[#1A1512]/15 bg-[#F0EBE1] flex flex-col justify-between"
                    >
                      <div className="relative aspect-[16/9] overflow-hidden bg-[#1A1512]/5 border-b border-[#1A1512]/15">
                        <img
                          src={resolveImageUrl(project.image)}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                        {project.result && project.result.trim() && (
                          <div className="absolute top-3 left-3">
                            <span className="px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest uppercase bg-[#1A1512] text-white">
                              {project.result}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-baseline justify-between gap-2">
                            <h3 className="text-xl sm:text-2xl font-extrabold font-display uppercase tracking-tight text-[#1A1512]">
                              0{index + 1} / {project.title}
                            </h3>
                            <span className="font-mono text-[10px] uppercase font-bold text-[#1A1512]/60 border border-[#1A1512]/20 px-2 py-0.5 shrink-0">
                              {project.category}
                            </span>
                          </div>
                          <p className="text-xs text-[#1A1512]/70 font-mono mt-1">
                            Client: <span className="font-bold text-[#1A1512]">{project.client}</span>
                          </p>
                          <p className="text-xs text-[#1A1512]/60 font-sans mt-2 line-clamp-2">
                            {project.tagline}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-[#1A1512]/10 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openProjectModal(project)}
                              className="px-3 py-1.5 border border-[#1A1512] bg-[#F0EBE1] hover:bg-[#1A1512] hover:text-white font-mono text-xs font-bold uppercase transition-colors cursor-pointer"
                            >
                              EDIT CASE STUDY
                            </button>
                            {project.liveUrl && (
                              <a
                                href={project.liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1.5 border border-[#1A1512]/30 hover:border-[#1A1512] text-[#1A1512] hover:text-[#C1512F] font-mono text-[10px] font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer bg-[#E8E2D7]/50"
                                title="Visit live site"
                              >
                                <span>LIVE SITE</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete "${project.title}"?`)) {
                                deleteProject(project.id);
                                showToast('Project deleted.');
                              }
                            }}
                            className="p-1.5 border border-[#1A1512]/20 hover:bg-[#C1512F] hover:text-white hover:border-[#C1512F] transition-colors cursor-pointer"
                            title="Delete Project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: INQUIRIES (LEADS & INBOX) */}
          {activeTab === 'inquiries' && (
            <div className="space-y-6 w-full">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[#1A1512]/15 pb-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display uppercase tracking-tight">
                    LEADS & INBOX
                  </h1>
                  <p className="font-mono text-xs text-[#1A1512]/60 uppercase tracking-widest mt-1">
                    CLIENT DISCOVERY INQUIRIES & PIPELINE
                  </p>
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#1A1512]/40" />
                  <input
                    type="text"
                    placeholder="SEARCH LEADS..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-auto pl-9 pr-3 py-2 border border-[#1A1512]/20 font-mono text-xs focus:outline-none focus:border-[#1A1512] bg-[#F0EBE1]"
                  />
                </div>
              </div>

              {/* Inquiries Table */}
              <div className="border border-[#1A1512]/15 bg-[#F0EBE1] overflow-x-auto -mx-3 sm:mx-0">
                <table className="w-full text-left font-mono text-xs min-w-[640px]">
                  <thead>
                    <tr className="border-b border-[#1A1512]/15 bg-[#1A1512]/5 text-[#1A1512]/60 font-bold uppercase tracking-widest text-[10px]">
                      <th className="py-3 px-4">PROSPECT</th>
                      <th className="py-3 px-4">PLAN & TERMS</th>
                      <th className="py-3 px-4">TOTAL</th>
                      <th className="py-3 px-4">DATE</th>
                      <th className="py-3 px-4">STATUS</th>
                      <th className="py-3 px-4 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A1512]/10">
                    {filteredInquiries.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-[#1A1512]/60 font-mono text-xs">
                          No inquiries yet. Inquiries from your contact form will appear here.
                        </td>
                      </tr>
                    ) : (
                      filteredInquiries.map((inq) => (
                        <tr key={inq.id} className="hover:bg-[#1A1512]/5 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-[#1A1512]">{inq.name}</div>
                            <div className="text-[10px] text-[#1A1512]/60 font-normal">{inq.email}</div>
                            {inq.whatsapp && (
                              <div className="text-[10px] text-[#10B981] font-normal">{inq.whatsapp}</div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-[#1A1512]/80 font-bold">
                            {formatPlanAndTerms(inq)}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-[#1A1512]">
                            {inq.total ? `₹${inq.total.toLocaleString()}` : inq.budget || '₹10,000'}
                          </td>
                          <td className="py-3.5 px-4 text-[10px] text-[#1A1512]/60">
                            {inq.date ? new Date(inq.date).toLocaleDateString() : 'Recent'}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="relative inline-block">
                              <select
                                value={inq.status || 'new'}
                                onChange={(e) => {
                                  updateInquiryStatus(inq.id, e.target.value);
                                  showToast(`Status updated to "${e.target.value.replace('_', ' ').toUpperCase()}"`);
                                }}
                                className="appearance-none pr-6 pl-2 py-1 bg-[#F0EBE1] border border-[#1A1512]/20 font-mono text-[10px] font-bold uppercase tracking-wider focus:outline-none focus:border-[#1A1512] cursor-pointer"
                              >
                                <option value="new">NEW</option>
                                <option value="awaiting_reply">AWAITING REPLY</option>
                                <option value="active">ACTIVE</option>
                                <option value="won">WON</option>
                                <option value="lost">LOST</option>
                              </select>
                              <ChevronDown className="w-3 h-3 text-[#1A1512]/50 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            <button
                              onClick={() => handleOpenThreadFromInquiry(inq)}
                              className="px-2.5 py-1 bg-[#1A1512] text-white hover:bg-[#C1512F] text-[10px] font-bold tracking-widest transition-colors cursor-pointer"
                            >
                              OPEN THREAD
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Delete lead/conversation with ${inq.name}? This will remove all associated messages.`)) {
                                  deleteConversation(inq.id);
                                  showToast('Conversation deleted.');
                                }
                              }}
                              className="p-1 border border-[#1A1512]/20 hover:bg-[#C1512F] hover:text-white hover:border-[#C1512F] text-[10px] transition-colors cursor-pointer inline-flex items-center justify-center"
                              title="Delete conversation"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: TESTIMONIALS */}
          {activeTab === 'testimonials' && (
            <div className="space-y-6 w-full">
              <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[#1A1512]/15 pb-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display uppercase tracking-tight">
                    TESTIMONIALS
                  </h1>
                  <p className="font-mono text-xs text-[#1A1512]/60 uppercase tracking-widest mt-1">
                    EXECUTIVE ENDORSEMENTS & SOCIAL PROOF
                  </p>
                </div>
                <button
                  onClick={() => openTestimonialModal()}
                  className="px-4 py-2 bg-[#1A1512] text-white hover:bg-[#C1512F] font-mono text-xs font-bold tracking-widest flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>ADD ENDORSEMENT</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {testimonials.map((testi) => (
                  <div
                    key={testi.id}
                    className="border border-[#1A1512]/15 p-5 sm:p-6 bg-[#F0EBE1] flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-1 text-[#C1512F]">
                        {[...Array(testi.rating || 5)].map((_, i) => (
                          <span key={i} className="text-sm font-bold">★</span>
                        ))}
                      </div>
                      <p className="text-xs text-[#1A1512]/90 font-sans italic leading-relaxed">
                        "{testi.quote}"
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#1A1512]/15 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={resolveImageUrl(testi.avatar)}
                          alt={testi.author}
                          className="w-8 sm:w-9 h-8 sm:h-9 object-cover border border-[#1A1512] shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-[#1A1512] truncate">{testi.author}</div>
                          <div className="text-[10px] text-[#1A1512]/60 font-mono truncate">
                            {testi.role}, {testi.company}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openTestimonialModal(testi)}
                          className="p-1 border border-[#1A1512]/20 hover:bg-[#1A1512] hover:text-white transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete testimonial by ${testi.author}?`)) {
                              deleteTestimonial(testi.id);
                              showToast('Testimonial deleted.');
                            }
                          }}
                          className="p-1 border border-[#1A1512]/20 hover:bg-[#C1512F] hover:text-white hover:border-[#C1512F] transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: AGENCY INFO & SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 sm:space-y-8 max-w-4xl">
              <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[#1A1512]/15 pb-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display uppercase tracking-tight">
                    AGENCY INFO & SETTINGS
                  </h1>
                  <p className="font-mono text-xs text-[#1A1512]/60 uppercase tracking-widest mt-1">
                    GLOBAL BRANDING & EXECUTIVE ACCESS
                  </p>
                </div>
              </div>

              {/* Security & Credentials Card */}
              <div className="border border-[#1A1512] p-6 bg-[#E8E2D7] space-y-4">
                <div className="flex items-center justify-between border-b border-[#1A1512]/15 pb-3">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-[#C1512F]" />
                    <h3 className="font-display text-xl font-bold uppercase">SECURITY & CREDENTIALS</h3>
                  </div>
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-[#10B981] text-white">
                    MONGODB HASHED
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
                  <div>
                    <span className="text-[#1A1512]/60 block text-[10px]">AUTHENTICATED ADMIN</span>
                    <span className="font-bold text-[#1A1512]">{currentUser.email}</span>
                  </div>
                  <button
                    onClick={() => setIsChangePasswordOpen(true)}
                    className="px-4 py-2 border border-[#1A1512] bg-[#1A1512] text-white hover:bg-[#C1512F] font-mono text-xs font-bold tracking-widest transition-colors cursor-pointer"
                  >
                    CHANGE PASSWORD
                  </button>
                </div>
              </div>

              {/* Brand Settings Form */}
              <div className="border border-[#1A1512]/15 p-6 bg-[#F0EBE1] space-y-6">
                <h3 className="font-display text-2xl font-bold uppercase border-b border-[#1A1512]/15 pb-3">
                  BRAND PROFILE
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-mono text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-[#1A1512]/70 uppercase">AGENCY NAME</label>
                    <input
                      type="text"
                      value={agencyInfo.name}
                      onChange={(e) => updateAgencyInfo({ name: e.target.value })}
                      className="w-full p-2.5 border border-[#1A1512]/20 bg-[#F0EBE1] focus:outline-none focus:border-[#1A1512]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#1A1512]/70 uppercase">TAGLINE</label>
                    <input
                      type="text"
                      value={agencyInfo.tagline}
                      onChange={(e) => updateAgencyInfo({ tagline: e.target.value })}
                      className="w-full p-2.5 border border-[#1A1512]/20 bg-[#F0EBE1] focus:outline-none focus:border-[#1A1512]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#1A1512]/70 uppercase">CONTACT EMAIL</label>
                    <input
                      type="email"
                      value={agencyInfo.contact?.email || ''}
                      onChange={(e) =>
                        updateAgencyInfo({
                          contact: { ...agencyInfo.contact, email: e.target.value }
                        })
                      }
                      className="w-full p-2.5 border border-[#1A1512]/20 bg-[#F0EBE1] focus:outline-none focus:border-[#1A1512]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#1A1512]/70 uppercase">STUDIO LOCATION</label>
                    <input
                      type="text"
                      value={agencyInfo.contact?.location || ''}
                      onChange={(e) =>
                        updateAgencyInfo({
                          contact: { ...agencyInfo.contact, location: e.target.value }
                        })
                      }
                      className="w-full p-2.5 border border-[#1A1512]/20 bg-[#F0EBE1] focus:outline-none focus:border-[#1A1512]"
                    />
                  </div>
                </div>

                <div className="space-y-1 font-mono text-xs">
                  <label className="font-bold text-[#1A1512]/70 uppercase">BRAND ETHOS</label>
                  <textarea
                    rows={3}
                    value={agencyInfo.ethos}
                    onChange={(e) => updateAgencyInfo({ ethos: e.target.value })}
                    className="w-full p-2.5 border border-[#1A1512]/20 bg-[#F0EBE1] focus:outline-none focus:border-[#1A1512]"
                  />
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL: ADD CLIENT MESSAGE (OFFLINE INBOUND LOG) */}
      {isAddClientMsgOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1A1512]/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#F0EBE1] border border-[#1A1512] max-w-md w-full p-4 sm:p-6 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-[#1A1512]/15 pb-3">
              <div>
                <span className="font-mono text-[10px] font-bold text-[#C1512F] uppercase">LOG CLIENT RESPONSE</span>
                <h3 className="text-lg sm:text-xl font-display font-extrabold uppercase">ADD CLIENT MESSAGE</h3>
              </div>
              <button
                onClick={() => setIsAddClientMsgOpen(false)}
                className="p-1 border border-[#1A1512]/20 hover:bg-[#1A1512] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddClientMessageSubmit} className="space-y-4 font-mono text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#1A1512]/70 uppercase">RECEIVED VIA CHANNEL</label>
                <select
                  value={clientMsgChannel}
                  onChange={(e) => setClientMsgChannel(e.target.value)}
                  className="w-full p-2.5 border border-[#1A1512]/20 bg-[#F0EBE1] focus:outline-none"
                >
                  <option value="email">Direct Email</option>
                  <option value="whatsapp">WhatsApp / Phone</option>
                  <option value="manual">Discovery Call / Meeting</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#1A1512]/70 uppercase">CLIENT MESSAGE / RESPONSE *</label>
                <textarea
                  rows={4}
                  required
                  value={clientMsgText}
                  onChange={(e) => setClientMsgText(e.target.value)}
                  placeholder="Paste client reply or summarize notes from call..."
                  className="w-full p-2.5 border border-[#1A1512]/20 bg-[#F0EBE1] focus:outline-none resize-none font-sans"
                />
              </div>

              <div className="pt-3 border-t border-[#1A1512]/15 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddClientMsgOpen(false)}
                  className="px-4 py-2 border border-[#1A1512]/30 hover:bg-[#1A1512]/10 cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isLoggingClientMsg || !clientMsgText.trim()}
                  className="px-5 py-2 bg-[#1A1512] text-white hover:bg-[#C1512F] font-bold tracking-widest uppercase cursor-pointer disabled:opacity-50"
                >
                  {isLoggingClientMsg ? 'SAVING...' : 'SAVE TO THREAD'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PROJECT EDIT / CREATE */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1A1512]/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#F0EBE1] border border-[#1A1512] max-w-3xl w-full p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-h-[92vh] overflow-y-auto my-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#1A1512]/15 pb-3 sm:pb-4">
              <div>
                <span className="font-mono text-[10px] font-bold text-[#C1512F] uppercase tracking-widest">
                  PORTFOLIO MANAGEMENT
                </span>
                <h2 className="text-2xl sm:text-3xl font-display font-extrabold uppercase">
                  {editingProject ? 'EDIT PROJECT' : 'NEW PROJECT'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsProjectModalOpen(false)}
                className="p-1.5 border border-[#1A1512]/20 hover:bg-[#1A1512] hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs Header */}
            <div className="flex border border-[#1A1512]/20 bg-[#E8E2D7]/50 p-1 gap-1">
              <button
                type="button"
                onClick={() => setProjectModalTab('metadata')}
                className={`flex-1 py-2.5 px-3 font-mono text-[11px] font-bold uppercase tracking-wider text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  projectModalTab === 'metadata'
                    ? 'bg-[#1A1512] text-white shadow-sm'
                    : 'text-[#1A1512]/70 hover:text-[#1A1512] hover:bg-[#1A1512]/5'
                }`}
              >
                <span>01. CORE & COVER</span>
              </button>
              <button
                type="button"
                onClick={() => setProjectModalTab('gallery')}
                className={`flex-1 py-2.5 px-3 font-mono text-[11px] font-bold uppercase tracking-wider text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  projectModalTab === 'gallery'
                    ? 'bg-[#1A1512] text-white shadow-sm'
                    : 'text-[#1A1512]/70 hover:text-[#1A1512] hover:bg-[#1A1512]/5'
                }`}
              >
                <span>02. GALLERY & IMAGES</span>
                <span className={`px-1.5 py-0.2 text-[9px] font-mono font-bold ${
                  projectModalTab === 'gallery' ? 'bg-[#C1512F] text-white' : 'bg-[#1A1512] text-white'
                }`}>
                  {projectForm.galleryItems?.length || 0}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setProjectModalTab('story')}
                className={`flex-1 py-2.5 px-3 font-mono text-[11px] font-bold uppercase tracking-wider text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  projectModalTab === 'story'
                    ? 'bg-[#1A1512] text-white shadow-sm'
                    : 'text-[#1A1512]/70 hover:text-[#1A1512] hover:bg-[#1A1512]/5'
                }`}
              >
                <span>03. METRICS & STORY</span>
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4 font-mono text-xs">
              {/* TAB 1: CORE & COVER */}
              {projectModalTab === 'metadata' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-[#1A1512]/70 uppercase">PROJECT TITLE *</label>
                      <input
                        type="text"
                        required
                        value={projectForm.title}
                        onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                        placeholder="e.g. BisonMooves Logistics"
                        className="w-full p-2.5 border border-[#1A1512]/20 bg-[#F0EBE1] focus:outline-none focus:border-[#1A1512]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-[#1A1512]/70 uppercase">CLIENT NAME</label>
                      <input
                        type="text"
                        value={projectForm.client}
                        onChange={(e) => setProjectForm({ ...projectForm, client: e.target.value })}
                        placeholder="e.g. BisonMooves Enterprise"
                        className="w-full p-2.5 border border-[#1A1512]/20 bg-[#F0EBE1] focus:outline-none focus:border-[#1A1512]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-[#1A1512]/70 uppercase">CATEGORY</label>
                      <select
                        value={isCustomCategory ? '__custom__' : projectForm.category}
                        onChange={(e) => {
                          if (e.target.value === '__custom__') {
                            setIsCustomCategory(true);
                            if (!customCategoryVal) {
                              setCustomCategoryVal('');
                            }
                          } else {
                            setIsCustomCategory(false);
                            setProjectForm({ ...projectForm, category: e.target.value });
                          }
                        }}
                        className="w-full p-2.5 border border-[#1A1512]/20 bg-[#F0EBE1] focus:outline-none font-mono text-xs"
                      >
                        {standardCategories.map((c) => (
                          <option key={c} value={c}>{c.toUpperCase()}</option>
                        ))}
                        <option value="__custom__">+ CUSTOM CATEGORY...</option>
                      </select>

                      {isCustomCategory && (
                        <input
                          type="text"
                          value={customCategoryVal}
                          onChange={(e) => {
                            setCustomCategoryVal(e.target.value);
                            setProjectForm({ ...projectForm, category: e.target.value });
                          }}
                          placeholder="Type custom category name..."
                          className="w-full mt-2 p-2.5 border border-[#C1512F] bg-[#F0EBE1] focus:outline-none font-mono text-xs"
                          autoFocus
                        />
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-[#1A1512]/70 uppercase">KEY RESULT / BADGE</label>
                      <input
                        type="text"
                        value={projectForm.result}
                        onChange={(e) => setProjectForm({ ...projectForm, result: e.target.value })}
                        placeholder="e.g. +140% Conversion"
                        className="w-full p-2.5 border border-[#1A1512]/20 bg-[#F0EBE1] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#1A1512]/70 uppercase">TAGLINE / SHORT BRIEF</label>
                    <input
                      type="text"
                      value={projectForm.tagline}
                      onChange={(e) => setProjectForm({ ...projectForm, tagline: e.target.value })}
                      placeholder="e.g. Bespoke high-performance digital build."
                      className="w-full p-2.5 border border-[#1A1512]/20 bg-[#F0EBE1] focus:outline-none"
                    />
                  </div>

                  {/* Live Website / Demo URL */}
                  <div className="space-y-1">
                    <label className="font-bold text-[#1A1512]/70 uppercase flex items-center justify-between">
                      <span>LIVE SITE URL / DEMO LINK</span>
                      <span className="text-[10px] text-[#1A1512]/40 font-normal">OPTIONAL (LINKS DIRECTLY TO CLIENT SITE)</span>
                    </label>
                    <div className="relative">
                      <ExternalLink className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#1A1512]/40" />
                      <input
                        type="url"
                        value={projectForm.liveUrl}
                        onChange={(e) => setProjectForm({ ...projectForm, liveUrl: e.target.value })}
                        placeholder="e.g. https://bisonmooves.com or https://client.app"
                        className="w-full pl-9 pr-3 py-2.5 border border-[#1A1512]/20 bg-[#F0EBE1] focus:outline-none focus:border-[#1A1512] font-mono text-xs"
                      />
                    </div>
                  </div>

                  {/* Primary Cover Image */}
                  <div className="space-y-2 pt-2 border-t border-[#1A1512]/15">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-[#1A1512]/80 uppercase tracking-wider">
                        PRIMARY COVER IMAGE (SHOWCASE MASTER)
                      </label>
                      <span className="text-[10px] text-[#1A1512]/60">Used on Home Grid & Case Study Hero</span>
                    </div>
                    <ImageUploader
                      currentImage={projectForm.image}
                      onImageUploaded={(url) => setProjectForm({ ...projectForm, image: url })}
                    />
                  </div>

                  {/* Jump to Gallery Banner */}
                  <div className="p-3 bg-[#E8E2D7] border border-[#1A1512]/20 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-[11px] text-[#1A1512]">
                      <ImageIcon className="w-4 h-4 text-[#C1512F]" />
                      <span>
                        Need to add more images? Manage this project's Bento gallery ({projectForm.galleryItems?.length || 0} images attached).
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProjectModalTab('gallery')}
                      className="px-3 py-1 bg-[#1A1512] text-white hover:bg-[#C1512F] font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer shrink-0"
                    >
                      OPEN GALLERY TAB →
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: GALLERY & MULTIPLE IMAGES */}
              {projectModalTab === 'gallery' && (
                <div className="space-y-4">
                  <div className="p-3 bg-[#E8E2D7]/70 border border-[#1A1512]/15 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1A1512] uppercase tracking-wider">
                        BENTO GALLERY & CASE STUDY SCREENSHOTS
                      </span>
                      <span className="px-2 py-0.5 bg-[#1A1512] text-white font-bold text-[10px]">
                        {projectForm.galleryItems?.length || 0} SCREENSHOTS
                      </span>
                    </div>
                    <p className="text-[10px] text-[#1A1512]/70 font-sans">
                      These images render in the interactive Case Study Bento Grid on the project detail page with lightbox zoom and device filters.
                    </p>
                  </div>

                  {/* Batch Upload Dropzone */}
                  <div className="border-2 border-dashed border-[#1A1512]/30 hover:border-[#C1512F] bg-[#1A1512]/5 p-4 sm:p-6 text-center space-y-3 transition-colors">
                    {isBatchUploadingGallery ? (
                      <div className="py-2 flex flex-col items-center justify-center space-y-2">
                        <Loader2 className="w-6 h-6 animate-spin text-[#C1512F]" />
                        <span className="font-bold uppercase tracking-wider text-[#1A1512]">
                          UPLOADING SCREENSHOTS TO MONGODB GRIDFS...
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 mx-auto border border-[#1A1512]/20 bg-[#F0EBE1] flex items-center justify-center">
                          <UploadCloud className="w-5 h-5 text-[#C1512F]" />
                        </div>
                        <div>
                          <div className="font-bold uppercase tracking-wider text-[#1A1512]">
                            BATCH ADD NEW SCREENSHOTS / IMAGES
                          </div>
                          <p className="text-[10px] text-[#1A1512]/60 mt-0.5">
                            Drag & drop one or multiple image files here, or click button below
                          </p>
                        </div>
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A1512] text-white hover:bg-[#C1512F] font-bold text-[10px] uppercase tracking-widest transition-colors cursor-pointer shadow-md">
                          <Plus className="w-3.5 h-3.5" />
                          <span>SELECT IMAGE FILES (PNG, JPG, WEBP)</span>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                handleBatchGalleryUpload(Array.from(e.target.files));
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </>
                    )}
                  </div>

                  {/* Gallery Items List */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1A1512]/80 uppercase">
                        GALLERY SCREENSHOTS ({projectForm.galleryItems?.length || 0})
                      </span>
                      <button
                        type="button"
                        onClick={handleAddBlankGalleryItem}
                        className="px-2.5 py-1 border border-[#1A1512]/30 hover:border-[#1A1512] hover:bg-[#1A1512] hover:text-white font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+ ADD CARD MANUALLY</span>
                      </button>
                    </div>

                    {(!projectForm.galleryItems || projectForm.galleryItems.length === 0) ? (
                      <div className="p-8 text-center border border-[#1A1512]/15 bg-[#F0EBE1] text-[#1A1512]/60 font-mono text-xs">
                        No screenshots added yet. Upload files above to populate the case study gallery.
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                        {projectForm.galleryItems.map((item, idx) => (
                          <div
                            key={item.id || idx}
                            className="p-3 border border-[#1A1512]/20 bg-[#F0EBE1] space-y-3"
                          >
                            <div className="flex items-center justify-between border-b border-[#1A1512]/10 pb-2">
                              <span className="font-bold text-[#1A1512] text-[11px] flex items-center gap-2">
                                <span className="px-1.5 py-0.2 bg-[#1A1512] text-white text-[9px] font-mono">
                                  #{idx + 1}
                                </span>
                                <span>{item.title || 'Untitled Screenshot'}</span>
                              </span>

                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 border border-[#1A1512]/20 text-[9px] uppercase font-bold text-[#1A1512]/70">
                                  {item.cat || 'Desktop'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteGalleryItem(idx)}
                                  className="p-1 text-[#C1512F] hover:bg-[#C1512F] hover:text-white border border-[#C1512F]/30 transition-colors cursor-pointer"
                                  title="Delete screenshot"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                              {/* Thumbnail & File selector */}
                              <div className="sm:col-span-4 space-y-1.5">
                                <div className="relative aspect-[16/10] w-full bg-[#1A1512]/10 overflow-hidden border border-[#1A1512]/20">
                                  {item.src ? (
                                    <img
                                      src={resolveImageUrl(item.src)}
                                      alt={item.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-[#1A1512]/40 text-[9px] p-2 text-center">
                                      <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                                      <span>NO IMAGE</span>
                                    </div>
                                  )}
                                </div>
                                <label className="block w-full text-center py-1 bg-[#1A1512] text-white hover:bg-[#C1512F] font-bold text-[9px] uppercase tracking-wider transition-colors cursor-pointer">
                                  <span>{item.src ? 'CHANGE IMAGE' : 'UPLOAD IMAGE'}</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        const file = e.target.files[0];
                                        try {
                                          const formData = new FormData();
                                          formData.append('image', file);
                                          const res = await fetch(apiUrl('/api/upload'), {
                                            method: 'POST',
                                            body: formData
                                          });
                                          const contentType = res.headers.get('content-type') || '';
                                          if (res.ok && contentType.includes('application/json')) {
                                            const data = await res.json();
                                            if (data.url) {
                                              handleUpdateGalleryItem(idx, 'src', data.url);
                                              return;
                                            }
                                          }
                                        } catch {}
                                        // base64 fallback
                                        const r = new FileReader();
                                        r.onload = (ev) => {
                                          if (ev.target?.result) {
                                            handleUpdateGalleryItem(idx, 'src', ev.target.result);
                                          }
                                        };
                                        r.readAsDataURL(file);
                                      }
                                    }}
                                    className="hidden"
                                  />
                                </label>
                              </div>

                              {/* Item Details Form */}
                              <div className="sm:col-span-8 space-y-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <div className="space-y-0.5">
                                    <label className="text-[10px] text-[#1A1512]/60 uppercase font-bold">
                                      SCREEN TITLE
                                    </label>
                                    <input
                                      type="text"
                                      value={item.title || ''}
                                      onChange={(e) => handleUpdateGalleryItem(idx, 'title', e.target.value)}
                                      placeholder="e.g. Operations Dashboard"
                                      className="w-full p-1.5 border border-[#1A1512]/20 bg-[#F0EBE1] text-[11px] focus:outline-none"
                                    />
                                  </div>

                                  <div className="space-y-0.5">
                                    <label className="text-[10px] text-[#1A1512]/60 uppercase font-bold">
                                      DEVICE FRAME / CATEGORY
                                    </label>
                                    <select
                                      value={item.cat || 'Desktop'}
                                      onChange={(e) => handleUpdateGalleryItem(idx, 'cat', e.target.value)}
                                      className="w-full p-1.5 border border-[#1A1512]/20 bg-[#F0EBE1] text-[11px] focus:outline-none font-mono"
                                    >
                                      <option value="Desktop">Desktop Hero (Wide)</option>
                                      <option value="Mobile">Mobile Device (Phone Frame)</option>
                                      <option value="Details">Detail / Interactive Card</option>
                                      <option value="Systems">Design System / Typography</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="space-y-0.5">
                                  <label className="text-[10px] text-[#1A1512]/60 uppercase font-bold">
                                    CAPTION / FEATURE NOTE
                                  </label>
                                  <input
                                    type="text"
                                    value={item.note || ''}
                                    onChange={(e) => handleUpdateGalleryItem(idx, 'note', e.target.value)}
                                    placeholder="Brief description of what this interface solves..."
                                    className="w-full p-1.5 border border-[#1A1512]/20 bg-[#F0EBE1] text-[11px] focus:outline-none"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: METRICS & STORY */}
              {projectModalTab === 'story' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="font-bold text-[#1A1512]/70 uppercase">
                      01 / THE STRATEGIC CHALLENGE (PROBLEM)
                    </label>
                    <textarea
                      rows={3}
                      value={projectForm.problem}
                      onChange={(e) => setProjectForm({ ...projectForm, problem: e.target.value })}
                      placeholder="Describe the client's previous obstacles, user friction, or legacy constraints..."
                      className="w-full p-2.5 border border-[#1A1512]/20 bg-[#F0EBE1] focus:outline-none font-sans text-xs resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#1A1512]/70 uppercase">
                      02 / THE ARCHITECTURAL SOLUTION
                    </label>
                    <textarea
                      rows={3}
                      value={projectForm.solution}
                      onChange={(e) => setProjectForm({ ...projectForm, solution: e.target.value })}
                      placeholder="Describe the technical implementation, UX flows, and performance engineering delivered..."
                      className="w-full p-2.5 border border-[#1A1512]/20 bg-[#F0EBE1] focus:outline-none font-sans text-xs resize-none"
                    />
                  </div>

                  <div className="pt-2 border-t border-[#1A1512]/15 space-y-3">
                    <label className="font-bold text-[#1A1512]/80 uppercase tracking-wider block">
                      IMPACT METRICS STRIP
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-3 bg-[#E8E2D7]/50 border border-[#1A1512]/15 space-y-2">
                        <span className="font-bold text-[10px] text-[#1A1512]/60 uppercase">METRIC 1</span>
                        <input
                          type="text"
                          value={projectForm.metric1Label}
                          onChange={(e) => setProjectForm({ ...projectForm, metric1Label: e.target.value })}
                          placeholder="Label (e.g. Conversion Uplift)"
                          className="w-full p-2 border border-[#1A1512]/20 bg-[#F0EBE1] focus:outline-none text-[11px]"
                        />
                        <input
                          type="text"
                          value={projectForm.metric1Val}
                          onChange={(e) => setProjectForm({ ...projectForm, metric1Val: e.target.value })}
                          placeholder="Value (e.g. +140%)"
                          className="w-full p-2 border border-[#1A1512]/20 bg-[#F0EBE1] focus:outline-none font-bold text-sm text-[#C1512F]"
                        />
                      </div>

                      <div className="p-3 bg-[#E8E2D7]/50 border border-[#1A1512]/15 space-y-2">
                        <span className="font-bold text-[10px] text-[#1A1512]/60 uppercase">METRIC 2</span>
                        <input
                          type="text"
                          value={projectForm.metric2Label}
                          onChange={(e) => setProjectForm({ ...projectForm, metric2Label: e.target.value })}
                          placeholder="Label (e.g. New ARR Added)"
                          className="w-full p-2 border border-[#1A1512]/20 bg-[#F0EBE1] focus:outline-none text-[11px]"
                        />
                        <input
                          type="text"
                          value={projectForm.metric2Val}
                          onChange={(e) => setProjectForm({ ...projectForm, metric2Val: e.target.value })}
                          placeholder="Value (e.g. $4.2M)"
                          className="w-full p-2 border border-[#1A1512]/20 bg-[#F0EBE1] focus:outline-none font-bold text-sm text-[#1A1512]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Actions Footer */}
              <div className="pt-4 border-t border-[#1A1512]/15 flex flex-wrap items-center justify-between gap-3">
                <div className="text-[10px] text-[#1A1512]/60">
                  {editingProject ? 'Updating live portfolio in MongoDB' : 'Creating new portfolio item in MongoDB'}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsProjectModalOpen(false)}
                    className="px-4 py-2 border border-[#1A1512]/30 hover:bg-[#1A1512]/10 cursor-pointer font-bold transition-colors"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#1A1512] text-white hover:bg-[#C1512F] font-bold tracking-widest uppercase transition-colors cursor-pointer shadow-lg"
                  >
                    SAVE PROJECT
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TESTIMONIAL EDIT / CREATE */}
      {isTestimonialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1A1512]/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#F0EBE1] border border-[#1A1512] max-w-lg w-full p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 my-auto">
            <div className="flex items-center justify-between border-b border-[#1A1512]/15 pb-3 sm:pb-4">
              <div>
                <span className="font-mono text-[10px] font-bold text-[#C1512F] uppercase tracking-widest">
                  SOCIAL PROOF
                </span>
                <h2 className="text-2xl sm:text-3xl font-display font-extrabold uppercase">
                  {editingTestimonial ? 'EDIT ENDORSEMENT' : 'NEW ENDORSEMENT'}
                </h2>
              </div>
              <button
                onClick={() => setIsTestimonialModalOpen(false)}
                className="p-1.5 border border-[#1A1512]/20 hover:bg-[#1A1512] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTestimonial} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#1A1512]/70 uppercase">AUTHOR *</label>
                  <input
                    type="text"
                    required
                    value={testimonialForm.author}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, author: e.target.value })}
                    className="w-full p-2.5 border border-[#1A1512]/20 bg-[#F0EBE1]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#1A1512]/70 uppercase">COMPANY</label>
                  <input
                    type="text"
                    value={testimonialForm.company}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, company: e.target.value })}
                    className="w-full p-2.5 border border-[#1A1512]/20 bg-[#F0EBE1]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#1A1512]/70 uppercase">CLIENT QUOTE *</label>
                <textarea
                  rows={3}
                  required
                  value={testimonialForm.quote}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, quote: e.target.value })}
                  className="w-full p-2.5 border border-[#1A1512]/20 bg-[#F0EBE1] font-sans"
                />
              </div>

              <div className="pt-4 border-t border-[#1A1512]/15 flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsTestimonialModalOpen(false)}
                  className="px-4 py-2 border border-[#1A1512]/30 hover:bg-[#1A1512]/10 cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#1A1512] text-white hover:bg-[#C1512F] font-bold tracking-widest transition-colors cursor-pointer"
                >
                  SAVE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CHANGE MASTER PASSWORD */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1A1512]/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#F0EBE1] border border-[#1A1512] max-w-md w-full p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 my-auto">
            <div className="flex items-center justify-between border-b border-[#1A1512]/15 pb-3 sm:pb-4">
              <div>
                <span className="font-mono text-[10px] font-bold text-[#C1512F] uppercase tracking-widest">
                  SECURITY & CREDENTIALS
                </span>
                <h2 className="text-xl sm:text-2xl font-display font-extrabold uppercase">
                  CHANGE MASTER PASSWORD
                </h2>
              </div>
              <button
                onClick={() => setIsChangePasswordOpen(false)}
                className="p-1.5 border border-[#1A1512]/20 hover:bg-[#1A1512] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {passwordChangeError && (
              <div className="p-2.5 bg-[#C1512F]/10 border border-[#C1512F] text-[#C1512F] font-mono text-xs flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordChangeError}</span>
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4 font-mono text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#1A1512]/70 uppercase">CURRENT PASSWORD</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 border border-[#1A1512]/20 bg-[#F0EBE1] focus:outline-none focus:border-[#1A1512]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#1A1512]/70 uppercase">NEW PASSWORD (MIN 6 CHARACTERS)</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 border border-[#1A1512]/20 bg-[#F0EBE1] focus:outline-none focus:border-[#1A1512]"
                />
              </div>

              <div className="pt-4 border-t border-[#1A1512]/15 flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordOpen(false)}
                  className="px-4 py-2 border border-[#1A1512]/30 hover:bg-[#1A1512]/10 cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-6 py-2 bg-[#1A1512] text-white hover:bg-[#C1512F] font-bold tracking-widest transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isChangingPassword ? 'HASHING & UPDATING...' : 'UPDATE PASSWORD'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
