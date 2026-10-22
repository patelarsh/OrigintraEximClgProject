import React, { useState, useEffect } from 'react';
import { 
  WifiOff, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { COMPANY_CONFIG } from '../data/company';

interface NoInternetPageProps {
  onRetry?: () => void;
  onNavigate?: (page: string) => void;
}

export const NoInternetPage: React.FC<NoInternetPageProps> = ({
  onRetry,
  onNavigate
}) => {
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [checkResult, setCheckResult] = useState<'offline' | 'online' | null>(null);
  const [countdown, setCountdown] = useState<number>(15);

  // Function to verify real network reachability via ping
  const handleCheckConnection = async () => {
    setIsChecking(true);
    setCheckResult(null);

    try {
      // Test fetch with cache-busting timestamp
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(`/favicon.ico?_ping=${Date.now()}`, {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok || response.type === 'opaque') {
        setCheckResult('online');
        setTimeout(() => {
          if (onRetry) onRetry();
          else window.location.reload();
        }, 800);
      } else {
        setCheckResult('offline');
      }
    } catch {
      // If navigator says online, double check
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        setCheckResult('offline');
      } else {
        setCheckResult('offline');
      }
    } finally {
      setIsChecking(false);
      setCountdown(15);
    }
  };

  // Auto-ping countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleCheckConnection();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Listen for browser online event
  useEffect(() => {
    const handleBrowserOnline = () => {
      setCheckResult('online');
      setTimeout(() => {
        if (onRetry) onRetry();
        else window.location.reload();
      }, 500);
    };

    window.addEventListener('online', handleBrowserOnline);
    return () => window.removeEventListener('online', handleBrowserOnline);
  }, [onRetry]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-between selection:bg-[#0070E0] selection:text-white">
      
      {/* Top Header / Brand Bar */}
      <header className="w-full bg-white border-b border-slate-200/80 py-4 px-6 sm:px-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src="/assets/logo/origintra-official-logo.webp?v=2"
              alt="Origintra Exim"
              className="h-9 sm:h-10 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/logo/origintra-official-logo.png?v=2';
              }}
            />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>Offline Mode</span>
          </div>
        </div>
      </header>

      {/* Main Content Hero */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in duration-300">
          
          {/* Animated Disconnected Icon Graphic */}
          <div className="relative inline-block mx-auto">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-[#0A1C3E] to-[#0A2558] flex items-center justify-center text-white shadow-xl mx-auto border border-blue-900/50">
              <WifiOff className="w-14 h-14 text-white animate-pulse" />
            </div>

            {/* Warning indicator dot */}
            <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-red-500 border-4 border-[#F8FAFC] flex items-center justify-center text-white shadow-md">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>

          {/* Title & Copy */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>No Internet Connection</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-[#0F172A] tracking-tight">
              You are currently offline
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
              We couldn&apos;t connect to the Origintra Exim trade servers. Please check your Wi-Fi, Ethernet, or mobile data connection to resume live export operations.
            </p>
          </div>

          {/* Interactive Reconnect Button & Status */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleCheckConnection}
              disabled={isChecking}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#0A1C3E] hover:bg-[#0070E0] text-white font-semibold text-xs transition-all shadow-md hover:shadow-lg disabled:opacity-60 flex items-center justify-center space-x-2 cursor-pointer group"
            >
              <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
              <span>{isChecking ? 'Checking Connection...' : 'Try Again'}</span>
            </button>

            {onNavigate && (
              <button
                onClick={() => onNavigate('home')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <span>Return to Home</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Auto-reconnect indicator */}
          <div className="text-xs text-slate-400 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-ping" />
            <span>Automatically re-checking connection in <strong className="text-slate-600 font-mono">{countdown}s</strong></span>
          </div>

          {/* Result Banner if connection checked */}
          {checkResult === 'online' && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2 max-w-md mx-auto animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Internet connection restored! Reloading portal...</span>
            </div>
          )}

          {checkResult === 'offline' && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center justify-center gap-2 max-w-md mx-auto animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span>Still offline. Please check your router or mobile network.</span>
            </div>
          )}

          {/* Troubleshooting Checklist Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0070E0]">Step 1</span>
              <h4 className="text-xs font-bold text-slate-800">Check Wi-Fi / LAN</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Ensure Wi-Fi is toggled on or your local Ethernet patch cable is seated properly.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0070E0]">Step 2</span>
              <h4 className="text-xs font-bold text-slate-800">Restart Router</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Reboot your modem, optical gateway, or mobile hotspot to renew your IP lease.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0070E0]">Step 3</span>
              <h4 className="text-xs font-bold text-slate-800">Verify VPN / Proxy</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Disconnect conflicting VPN tunnels that may be intercepting secure HTTPS packets.
              </p>
            </div>
          </div>

          {/* Direct Emergency Trade Desk Contacts */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm text-left space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#0070E0]" />
                <span>Urgent Commercial Procurement Hotline</span>
              </span>
              <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Phone Always Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
              <a
                href={`tel:${COMPANY_CONFIG.phone}`}
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 transition font-medium text-slate-800"
              >
                <Phone className="w-3.5 h-3.5 text-[#0070E0] shrink-0" />
                <span className="truncate">{COMPANY_CONFIG.phoneDisplay || COMPANY_CONFIG.phone}</span>
              </a>

              <a
                href={`mailto:${COMPANY_CONFIG.primaryEmail}`}
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 transition font-medium text-slate-800"
              >
                <Mail className="w-3.5 h-3.5 text-[#0070E0] shrink-0" />
                <span className="truncate">{COMPANY_CONFIG.primaryEmail}</span>
              </a>

              <div className="flex items-center gap-2 p-2 font-medium text-slate-800">
                <MapPin className="w-3.5 h-3.5 text-[#0070E0] shrink-0" />
                <span className="truncate">{COMPANY_CONFIG.headOffice?.state || 'Gujarat'}, India</span>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-200/80 py-4 px-6 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} {COMPANY_CONFIG.name}. International Spices & Agricultural Export Commodities.</p>
      </footer>

    </div>
  );
};
