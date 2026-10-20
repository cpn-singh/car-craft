/**
 * AuthModal.jsx
 * -------------------
 * User Authentication & Account Management Studio.
 * Handles Secure User Registration and Login.
 * Persists user details in SQLite database and syncs location preferences.
 */

import React, { useState } from 'react';
import { loginUser, registerUser, INDIAN_STATES } from '../services/api.js';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialTab = 'login' }) {
  const [tab, setTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regState, setRegState] = useState('Maharashtra');
  const [regCity, setRegCity] = useState('Mumbai');
  const [regPassword, setRegPassword] = useState('');

  if (!isOpen) return null;

  async function handleLoginSubmit(e) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const data = await loginUser({
        username: loginIdentifier.trim(),
        password: loginPassword,
      });
      setSuccessMsg(`Welcome back, ${data.user?.first_name || data.user?.username}!`);
      setTimeout(() => {
        onAuthSuccess(data.user);
        onClose();
      }, 700);
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    const nameParts = regFullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    try {
      const data = await registerUser({
        username: regUsername.trim() || regEmail.split('@')[0],
        email: regEmail.trim(),
        password: regPassword,
        first_name: firstName,
        last_name: lastName,
        phone: regPhone.trim(),
        state: regState,
        city: regCity.trim() || 'Mumbai',
      });
      setSuccessMsg('Account created successfully! Your profile is saved in the database.');
      setTimeout(() => {
        onAuthSuccess(data.user);
        onClose();
      }, 900);
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg bg-[#141613] border border-white/15 rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-[#171916] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-serif text-xl font-normal text-[#c5a77a] border border-[#c5a77a]/70 w-8 h-8 grid place-items-center rounded-xs shrink-0">
              A
            </span>
            <div>
              <span className="text-[9px] tracking-[0.22em] text-[#c5a77a] uppercase font-semibold block">
                Aurel Atelier Member Portal
              </span>
              <h2 className="font-serif text-lg text-white m-0 font-normal">
                {tab === 'login' ? 'Sign In to Your Account' : 'Create User Profile'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/60 hover:text-white text-lg p-1 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* Tab switchers */}
        <div className="grid grid-cols-2 border-b border-white/10 bg-[#121310]">
          <button
            type="button"
            className={`py-3 text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer border-b-2 ${tab === 'login'
                ? 'border-[#c5a77a] text-[#c5a77a] bg-white/5'
                : 'border-transparent text-[#888] hover:text-white'
              }`}
            onClick={() => { setTab('login'); setErrorMsg(null); setSuccessMsg(null); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`py-3 text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer border-b-2 ${tab === 'register'
                ? 'border-[#c5a77a] text-[#c5a77a] bg-white/5'
                : 'border-transparent text-[#888] hover:text-white'
              }`}
            onClick={() => { setTab('register'); setErrorMsg(null); setSuccessMsg(null); }}
          >
            Create Account
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xs text-red-200 text-xs">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-[#c5a77a]-950/60 border border-[#c5a77a]-500/40 rounded-xs text-[#c5a77a]-200 text-xs flex items-center gap-2">
              <span>✓</span>
              <span>{successMsg}</span>
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#aaa] mb-1.5 font-medium">
                  Username or Email
                </label>
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="e.g. rahul.sharma or rahul@example.com"
                  className="w-full bg-white/5 border border-white/15 px-3.5 py-2.5 rounded-xs text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#c5a77a]"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#aaa] mb-1.5 font-medium">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/15 px-3.5 py-2.5 rounded-xs text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#c5a77a]"
                />
              </div>

              <div className="p-3 bg-white/5 border border-white/10 rounded-xs text-[11px] text-[#aaa]">
                <strong className="text-white block mb-0.5">Note on Database Storage:</strong>
                Only your personal profile and session credentials are saved in the secure SQLite database. Automotive listings, parts, and verified dealer prices are searched live on the internet and localized for your state.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#c5a77a] hover:bg-[#d8bb8d] text-[#11120f] font-semibold text-xs uppercase tracking-wider rounded-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In to Member Atelier'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#aaa] mb-1 font-medium">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="e.g. Aditya Roy Kapur"
                  className="w-full bg-white/5 border border-white/15 px-3 py-2 rounded-xs text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#c5a77a]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#aaa] mb-1 font-medium">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="aditya_roy"
                    className="w-full bg-white/5 border border-white/15 px-3 py-2 rounded-xs text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#c5a77a]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#aaa] mb-1 font-medium">
                    Phone (+91)
                  </label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="98200 12345"
                    className="w-full bg-white/5 border border-white/15 px-3 py-2 rounded-xs text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#c5a77a]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#aaa] mb-1 font-medium">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="aditya@example.com"
                  className="w-full bg-white/5 border border-white/15 px-3 py-2 rounded-xs text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#c5a77a]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#aaa] mb-1 font-medium">
                    Home State (Location)
                  </label>
                  <select
                    value={regState}
                    onChange={(e) => setRegState(e.target.value)}
                    className="w-full bg-[#181a17] border border-white/15 px-3 py-2 rounded-xs text-xs text-white focus:outline-none focus:border-[#c5a77a] cursor-pointer"
                  >
                    {(INDIAN_STATES || []).filter((s) => s !== 'All India').map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#aaa] mb-1 font-medium">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    placeholder="Mumbai / Pune"
                    className="w-full bg-white/5 border border-white/15 px-3 py-2 rounded-xs text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#c5a77a]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#aaa] mb-1 font-medium">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/15 px-3 py-2 rounded-xs text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#c5a77a]"
                />
              </div>

              <div className="text-[10px] text-[#888] leading-relaxed">
                By creating an account, your user credentials and state location will be saved in the database. Automotive quotes and dealership inventories are automatically pulled live from across the web.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#c5a77a] hover:bg-[#d8bb8d] text-[#11120f] font-semibold text-xs uppercase tracking-wider rounded-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Creating Profile...' : 'Save Profile & Register'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
