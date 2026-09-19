import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Fingerprint
} from 'lucide-react';

export default function AdminAuthGate() {
  const { allowedEmails, checkEmail, setPassword, login } = useAuth();

  const [email, setEmail] = useState('');
  const [step, setStep] = useState('email'); // 'email' | 'setPassword' | 'login'
  const [password, setPasswordInput] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Step 1: Submit Email
  const handleEmailSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const normalized = email.trim().toLowerCase();
    if (!normalized) {
      setErrorMessage('Please enter your authorized administrator email.');
      return;
    }

    if (!allowedEmails.includes(normalized)) {
      setErrorMessage(`Access Denied: "${email.trim()}" is not an authorized administrator email.`);
      return;
    }

    setIsLoading(true);

    try {
      const result = await checkEmail(normalized);

      if (!result.allowed) {
        setErrorMessage(result.error || 'Access Denied: Unauthorized email address.');
      } else if (result.isFirstTime || !result.hasPassword) {
        setStep('setPassword');
        setSuccessMessage('First-time admin session. Please create your secure master passkey.');
      } else {
        setStep('login');
      }
    } catch {
      setErrorMessage('Unable to reach authentication server. Please check connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2A: Set Password (First time)
  const handleSetPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 6) {
      setErrorMessage('Passkey must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passkeys do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await setPassword(email.trim().toLowerCase(), password);
      if (!result.success) {
        setErrorMessage(result.error || 'Failed to save passkey.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error configuring passkey.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2B: Login with existing password
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!password) {
      setErrorMessage('Please enter your master passkey.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(email.trim().toLowerCase(), password);
      if (!result.success) {
        setErrorMessage(result.error || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0A09] text-[#F0EBE1] font-sans flex flex-col justify-between p-4 sm:p-10 lg:p-12 relative overflow-hidden selection:bg-[#C1512F] selection:text-white">
      
      {/* Background Architectural Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#F0EBE1 1px, transparent 1px)',
          backgroundSize: '28px 28px'
        }}
      />

      {/* Ambient Lighting Spheres */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#C1512F]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#E27D5F]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#1A1512] rounded-full blur-[160px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="flex items-center justify-between z-20 max-w-5xl mx-auto w-full gap-2">
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-7 sm:w-8 h-7 sm:h-8 bg-[#1A1512] border border-white/15 flex items-center justify-center text-white font-display font-black text-xs sm:text-sm group-hover:border-[#C1512F] transition-colors">
            W
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-display font-extrabold text-xl sm:text-2xl tracking-tight text-[#F0EBE1] group-hover:text-white transition-colors">
              WEBRÊVE
            </span>
            <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-[#C1512F] inline-block" />
          </div>
        </Link>

        {/* System Protected Badge & Back Button */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/10 font-mono text-[10px] text-[#F0EBE1]/70">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            <span className="tracking-widest uppercase">SECURE PORTAL</span>
          </div>

          <Link
            to="/"
            className="group px-2.5 sm:px-3.5 py-1 sm:py-1.5 bg-white/[0.05] hover:bg-[#C1512F] border border-white/10 hover:border-[#C1512F] font-mono text-[10px] sm:text-[11px] font-bold tracking-widest text-[#F0EBE1] hover:text-white transition-all flex items-center gap-1.5 sm:gap-2"
          >
            <ArrowLeft className="w-3 sm:w-3.5 h-3 sm:h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>RETURN TO SITE</span>
          </Link>
        </div>
      </header>

      {/* Center Auth Card */}
      <main className="max-w-lg w-full mx-auto my-6 sm:my-12 z-20 relative">
        <div className="bg-[#14110F]/90 backdrop-blur-2xl border border-white/15 shadow-[0_25px_70px_rgba(0,0,0,0.85)] p-5 sm:p-10 relative overflow-hidden">
          
          {/* Subtle Corner Accents */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#C1512F]" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#C1512F]" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#C1512F]" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#C1512F]" />

          {/* Top Protocol Bar */}
          <div className="flex items-center justify-between pb-4 sm:pb-6 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="px-2 sm:px-2.5 py-1 bg-[#C1512F]/15 border border-[#C1512F]/40 text-[#C1512F] font-mono text-[9px] sm:text-[10px] font-bold tracking-widest uppercase flex items-center gap-1 sm:gap-1.5">
                <ShieldCheck className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                <span>EXECUTIVE GATEWAY</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 font-mono text-[9px] sm:text-[10px] text-[#F0EBE1]/50 tracking-widest uppercase">
              <Fingerprint className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#C1512F]" />
              <span>
                {step === 'email' && 'IDENTITY'}
                {step === 'setPassword' && 'SETUP'}
                {step === 'login' && 'VERIFICATION'}
              </span>
            </div>
          </div>

          {/* Heading Section */}
          <div className="pt-4 sm:pt-6 pb-4 sm:pb-6 space-y-1 sm:space-y-1.5">
            <h1 className="font-display text-xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#F0EBE1]">
              {step === 'email' && 'ADMIN ACCESS PORTAL'}
              {step === 'setPassword' && 'CREATE MASTER PASSKEY'}
              {step === 'login' && 'AUTHENTICATE PASSKEY'}
            </h1>
            <p className="font-mono text-[10px] sm:text-[11px] text-[#F0EBE1]/60 tracking-wider uppercase">
              {step === 'email' && 'Enter your authorized email to access the executive suite.'}
              {step === 'setPassword' && 'Create your master passkey for all future administrative access.'}
              {step === 'login' && 'Enter your master passkey to continue.'}
            </p>
          </div>

          {/* Status Alerts */}
          <AnimatePresence mode="wait">
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="p-3.5 mb-5 bg-[#C1512F]/15 border border-[#C1512F]/50 text-[#FFA488] font-mono text-[11px] flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#C1512F]" />
                <div className="flex-1 leading-relaxed">{errorMessage}</div>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="p-3.5 mb-5 bg-[#10B981]/15 border border-[#10B981]/50 text-[#6EE7B7] font-mono text-[11px] flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#10B981]" />
                <div className="flex-1 leading-relaxed">{successMessage}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STEP 1: EMAIL INPUT */}
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#F0EBE1]/80 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#C1512F]" />
                  <span>ADMINISTRATOR EMAIL</span>
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full p-3.5 bg-black/40 border border-white/15 focus:border-[#C1512F] focus:ring-1 focus:ring-[#C1512F] text-[#F0EBE1] placeholder:text-[#F0EBE1]/30 text-sm font-sans normal-case focus:outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full py-3.5 bg-[#C1512F] hover:bg-[#A94324] text-white font-mono text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(193,81,47,0.3)] hover:shadow-[0_6px_25px_rgba(193,81,47,0.5)] mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>VERIFYING AUTHORIZATION...</span>
                  </>
                ) : (
                  <>
                    <span>CONTINUE</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2A: FIRST TIME INITIALIZATION */}
          {step === 'setPassword' && (
            <form onSubmit={handleSetPasswordSubmit} className="space-y-5">
              
              {/* Selected Account Capsule */}
              <div className="p-3 bg-white/[0.03] border border-white/10 flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#C1512F] animate-pulse" />
                  <span className="text-[11px] text-[#F0EBE1] font-bold normal-case">{email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-[10px] text-[#C1512F] hover:underline font-bold tracking-wider uppercase"
                >
                  CHANGE EMAIL
                </button>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#F0EBE1]/80 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#C1512F]" />
                  <span>CREATE MASTER PASSKEY (MIN 6 CHARS)</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    autoCapitalize="none"
                    autoCorrect="off"
                    value={password}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter passkey"
                    className="w-full p-3.5 pr-10 bg-black/40 border border-white/15 focus:border-[#C1512F] focus:ring-1 focus:ring-[#C1512F] text-[#F0EBE1] placeholder:text-[#F0EBE1]/30 text-sm font-sans normal-case focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#F0EBE1]/50 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#F0EBE1]/80 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#C1512F]" />
                  <span>CONFIRM MASTER PASSKEY</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm passkey"
                    className="w-full p-3.5 pr-10 bg-black/40 border border-white/15 focus:border-[#C1512F] focus:ring-1 focus:ring-[#C1512F] text-[#F0EBE1] placeholder:text-[#F0EBE1]/30 text-sm font-sans normal-case focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#F0EBE1]/50 hover:text-white cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col xs:flex-row gap-2 sm:gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="w-full xs:w-1/3 py-3 sm:py-3.5 border border-white/20 hover:bg-white/5 font-mono font-bold uppercase tracking-widest cursor-pointer text-[10px] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>BACK</span>
                </button>

                <button
                  type="submit"
                  disabled={isLoading || password.length < 6}
                  className="w-full xs:w-2/3 py-3 sm:py-3.5 bg-[#C1512F] hover:bg-[#A94324] text-white font-mono font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(193,81,47,0.3)]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>CONFIGURING...</span>
                    </>
                  ) : (
                    <>
                      <span>SAVE & UNLOCK</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2B: RETURNING ADMIN LOGIN */}
          {step === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 sm:space-y-5">
              
              {/* Selected Account Capsule */}
              <div className="p-3 bg-white/[0.03] border border-white/10 flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 bg-[#C1512F] text-white flex items-center justify-center font-mono text-[10px] font-bold uppercase shrink-0">
                    {email.slice(0, 2)}
                  </div>
                  <span className="text-[11px] text-[#F0EBE1] font-bold normal-case truncate max-w-[180px]">{email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-[10px] text-[#C1512F] hover:underline font-bold tracking-wider uppercase shrink-0 cursor-pointer"
                >
                  CHANGE EMAIL
                </button>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#F0EBE1]/80 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#C1512F]" />
                  <span>MASTER PASSKEY</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    autoCapitalize="none"
                    autoCorrect="off"
                    value={password}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter passkey"
                    className="w-full p-3.5 pr-10 bg-black/40 border border-white/15 focus:border-[#C1512F] focus:ring-1 focus:ring-[#C1512F] text-[#F0EBE1] placeholder:text-[#F0EBE1]/30 text-sm font-sans normal-case focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#F0EBE1]/50 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col xs:flex-row gap-2 sm:gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="w-full xs:w-1/3 py-3 sm:py-3.5 border border-white/20 hover:bg-white/5 font-mono font-bold uppercase tracking-widest cursor-pointer text-[10px] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>BACK</span>
                </button>

                <button
                  type="submit"
                  disabled={isLoading || !password}
                  className="w-full xs:w-2/3 py-3 sm:py-3.5 bg-[#C1512F] hover:bg-[#A94324] text-white font-mono font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(193,81,47,0.3)] hover:shadow-[0_6px_25px_rgba(193,81,47,0.5)]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>AUTHENTICATING...</span>
                    </>
                  ) : (
                    <>
                      <span>UNLOCK SUITE</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Bottom Legal / Studio Note */}
      <footer className="max-w-5xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-2 text-[#F0EBE1]/40 font-mono text-[10px] tracking-widest uppercase z-20 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <span>© {new Date().getFullYear()} WEBRÊVE STUDIO</span>
          <span>•</span>
          <span>EXECUTIVE MANAGEMENT PORTAL</span>
        </div>
        <div className="flex items-center gap-4 text-[#F0EBE1]/30">
          <span>PARIS</span>
          <span>•</span>
          <span>NEW YORK</span>
          <span>•</span>
          <span>TOKYO</span>
        </div>
      </footer>
    </div>
  );
}
