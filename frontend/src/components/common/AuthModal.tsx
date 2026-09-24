import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useLanguage } from '../../context/LanguageContext';
import '../../auth-modal.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'login',
}) => {
  const [isActive, setIsActive] = useState(defaultTab === 'register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { login, register, isLoading } = useAuthStore();
  const { t } = useLanguage();

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      await login(email, password);
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Login failed');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      await register({
        email,
        password,
        full_name: fullName,
      });
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Registration failed');
    }
  };

  // Inline style for CSS custom properties needed for the animation delay
  const styleWithVars = (i: number, j: number) => ({
    '--i': i,
    '--j': j,
  } as React.CSSProperties);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-clay-900/60 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div 
        className={`auth-wrapper ${isActive ? 'active' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 text-cream-50/70 hover:text-white rounded-full bg-black/20 hover:bg-black/40 transition-colors backdrop-blur-md"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <span className="bg-animate"></span>
        <span className="bg-animate2"></span>

        {/* LOGIN FORM */}
        <div className="form-box auth-form-box login">
          <h2 className="animation" style={styleWithVars(0, 21)}>{t('auth.login', 'Login')}</h2>
          
          {formError && !isActive && (
            <div className="mt-4 p-2 bg-red-500/20 border border-red-500/50 text-red-200 text-xs rounded-xl flex items-center space-x-2 animation" style={styleWithVars(0.5, 21.5)}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="flex space-x-2 mt-4 mb-2 animation" style={styleWithVars(0.7, 21.7)}>
            <button 
              onClick={() => { setEmail('admin@bowlsnjars.com'); setPassword('admin123'); }}
              className="flex-1 py-1.5 px-3 bg-terracotta-500/20 hover:bg-terracotta-500/40 border border-terracotta-500/30 rounded-lg text-xs text-terracotta-200 transition-colors"
              type="button"
            >
              Test Admin
            </button>
            <button 
              onClick={() => { setEmail('customer@bowlsnjars.com'); setPassword('customer123'); }}
              className="flex-1 py-1.5 px-3 bg-sage-500/20 hover:bg-sage-500/40 border border-sage-500/30 rounded-lg text-xs text-sage-200 transition-colors"
              type="button"
            >
              Test User
            </button>
          </div>

          <form onSubmit={handleLogin}>
            <div className="input-box auth-input-box animation" style={styleWithVars(1, 22)}>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              <label>{t('auth.email', 'Email Address')}</label>
              <Mail className="w-4 h-4 absolute top-1/2 right-0 -translate-y-1/2 text-cream-50/70" />
            </div>
            <div className="input-box auth-input-box animation" style={styleWithVars(2, 23)}>
              <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} />
              <label>{t('auth.password', 'Password')}</label>
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute top-1/2 right-0 -translate-y-1/2 text-cream-50/70 hover:text-white transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button className="auth-btn animation" type="submit" style={styleWithVars(3, 24)} disabled={isLoading}>
              {isLoading ? '...' : t('auth.login', 'Login')}
            </button>
            <div className="logreg-link animation" style={styleWithVars(4, 25)}>
              <p>Don't have an account? <br /> <a href="#" onClick={(e) => { e.preventDefault(); setIsActive(true); setFormError(null); }}>Sign up</a></p>
            </div>
          </form>
        </div>

        {/* LOGIN INFO TEXT */}
        <div className="info-text login">
          <h2 className="animation" style={styleWithVars(0, 20)}>Welcome back!</h2>
          <p className="animation" style={styleWithVars(1, 21)}>We're happy to have you with us back again! Reconnect with our handcrafted rituals.</p>
        </div>

        {/* REGISTER FORM */}
        <div className="form-box auth-form-box register">
          <h2 className="animation" style={styleWithVars(17, 0)}>{t('auth.register', 'Sign up')}</h2>
          
          {formError && isActive && (
            <div className="mt-4 p-2 bg-red-500/20 border border-red-500/50 text-red-200 text-xs rounded-xl flex items-center space-x-2 animation" style={styleWithVars(17.5, 0.5)}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="input-box auth-input-box animation" style={styleWithVars(18, 1)}>
              <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <label>{t('checkout.full_name', 'Full Name')}</label>
              <UserIcon className="w-4 h-4 absolute top-1/2 right-0 -translate-y-1/2 text-cream-50/70" />
            </div>
            <div className="input-box auth-input-box animation" style={styleWithVars(19, 2)}>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              <label>{t('auth.email', 'Email')}</label>
              <Mail className="w-4 h-4 absolute top-1/2 right-0 -translate-y-1/2 text-cream-50/70" />
            </div>
            <div className="input-box auth-input-box animation" style={styleWithVars(20, 3)}>
              <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} />
              <label>{t('auth.password', 'Password')}</label>
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute top-1/2 right-0 -translate-y-1/2 text-cream-50/70 hover:text-white transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button className="auth-btn animation" type="submit" style={styleWithVars(21, 4)} disabled={isLoading}>
              {isLoading ? '...' : t('auth.register', 'Sign up')}
            </button>
            <div className="logreg-link animation" style={styleWithVars(22, 5)}>
              <p>Already have an account? <br /> <a href="#" onClick={(e) => { e.preventDefault(); setIsActive(false); setFormError(null); }}>Login</a></p>
            </div>
          </form>
        </div>

        {/* REGISTER INFO TEXT */}
        <div className="info-text register">
          <h2 className="animation" style={styleWithVars(17, 0)}>Welcome!</h2>
          <p className="animation" style={styleWithVars(18, 1)}>Join our community of handcrafted living enthusiasts. We're delighted to have you.</p>
        </div>

      </div>
    </div>
  );
};
