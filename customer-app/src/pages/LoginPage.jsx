import React, { useState } from "react";
import {
  Smartphone,
  LockKeyhole,
  Eye,
  EyeOff,
  Check,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ENDPOINTS } from "../utils/api";
import { useCustomerProfile } from "../context/CustomerProfileContext";

// ─────────────────────────────────────────────
// Custom SVG Icon Components
// ─────────────────────────────────────────────

const LeafOutlineIcon = () => (
  <svg width="20" height="20" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 24C14 24 5 19 5 11C5 7.13 8.13 4 12 4C14.5 4 17.5 5.5 19.5 7.5C21.5 9.5 23 12.5 23 15C23 20 18 24 14 24Z" />
    <path d="M14 24C14 20 13 16 10 13" />
    <path d="M14 24C15 19 16.5 15 20 13" />
  </svg>
);

const DeliveryTruckIcon = () => (
  <svg width="22" height="20" viewBox="0 0 30 28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="8" width="18" height="13" rx="2" />
    <path d="M20 11L25 11L28 16V21H20V11Z" />
    <circle cx="7" cy="22" r="2.5" />
    <circle cx="23" cy="22" r="2.5" />
    <line x1="2" y1="14" x2="20" y2="14" />
  </svg>
);

const DiscountBadgeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 3L16.5 5L19.5 4L21 7L24 8.5L23 11.5L25 14L23 16.5L24 19.5L21 21L19.5 24L16.5 23L14 25L11.5 23L8.5 24L7 21L4 19.5L5 16.5L3 14L5 11.5L4 8.5L7 7L8.5 4L11.5 5L14 3Z" />
    <line x1="10" y1="18" x2="18" y2="10" />
    <circle cx="10.5" cy="10.5" r="1.5" />
    <circle cx="17.5" cy="17.5" r="1.5" />
  </svg>
);

const BusinessPartnersIcon = () => (
  <svg width="24" height="20" viewBox="0 0 32 28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="16" cy="9" r="3.5" />
    <path d="M9 26C9 21.58 12.13 18 16 18C19.87 18 23 21.58 23 26" />
    <circle cx="6" cy="11" r="2.5" />
    <path d="M1 25C1 21.69 3.24 19 6 19C7.05 19 8.03 19.37 8.85 20" />
    <circle cx="26" cy="11" r="2.5" />
    <path d="M31 25C31 21.69 28.76 19 26 19C24.95 19 23.97 19.37 23.15 20" />
  </svg>
);

const WheatOutlineIcon = () => (
  <svg width="22" height="22" viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="15" y1="27" x2="15" y2="6" />
    <path d="M15 20C15 20 10 18 10 13C10 13 13 14 15 16" />
    <path d="M15 20C15 20 20 18 20 13C20 13 17 14 15 16" />
    <path d="M15 16C15 16 10 14 10 9C10 9 13 10 15 12" />
    <path d="M15 16C15 16 20 14 20 9C20 9 17 10 15 12" />
    <path d="M15 12C15 12 12 10 13 6C13 6 14.5 7 15 9" />
    <path d="M15 12C15 12 18 10 17 6C17 6 15.5 7 15 9" />
  </svg>
);

const HandshakeOutlineIcon = () => (
  <svg width="24" height="20" viewBox="0 0 32 28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 10L8 5L14 10H18L24 5L30 10" />
    <path d="M2 10L5 22H10L16 16L22 22H27L30 10" />
    <path d="M14 10L16 12L18 10" />
    <path d="M10 22L16 16L22 22" />
  </svg>
);

const GrowthChartIcon = () => (
  <svg width="22" height="20" viewBox="0 0 30 28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="24" x2="27" y2="24" />
    <line x1="3" y1="24" x2="3" y2="4" />
    <rect x="5" y="16" width="4" height="8" rx="1" />
    <rect x="11" y="11" width="4" height="13" rx="1" />
    <rect x="17" y="6" width="4" height="18" rx="1" />
    <path d="M23 8L27 4" />
    <path d="M25 4L27 4L27 6" />
  </svg>
);

// ─────────────────────────────────────────────
// Feature Item Component
// ─────────────────────────────────────────────

const FeatureItem = ({ icon, line1, line2 }) => (
  <div className="flex flex-col items-center gap-1">
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-[#E52323]"
      style={{ background: "#FFF0EF" }}
    >
      {icon}
    </div>
    <div className="text-center">
      <p className="text-[9px] font-semibold text-[#24313b] leading-none">{line1}</p>
      <p className="text-[9px] font-semibold text-[#24313b] leading-none">{line2}</p>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Side Benefit Component
// ─────────────────────────────────────────────

const SideBenefit = ({ icon, line1, line2 }) => (
  <div className="flex flex-col items-center gap-1.5">
    <div
      className="w-11 h-11 rounded-full flex items-center justify-center"
      style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)" }}
    >
      <div className="text-[#3D2A0E]">{icon}</div>
    </div>
    <div className="text-center">
      <p className="text-[9px] font-bold text-[#24313b] tracking-wide uppercase leading-none">{line1}</p>
      <p className="text-[9px] font-bold text-[#24313b] tracking-wide uppercase leading-none">{line2}</p>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Glass Input Component
// ─────────────────────────────────────────────

const GlassInput = ({ icon, rightSlot, ...inputProps }) => (
  <div
    className="h-[46px] rounded-[14px] flex items-center px-4 gap-3"
    style={{ background: "rgba(0,0,0,0.18)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.6)" }}
  >
    <div className="text-white shrink-0">{icon}</div>
    <input
      className="flex-1 bg-transparent outline-none border-none text-[14px] text-white placeholder:text-white/70 font-medium"
      {...inputProps}
    />
    {rightSlot && <div className="shrink-0">{rightSlot}</div>}
  </div>
);

// ─────────────────────────────────────────────
// Main LoginPage
// ─────────────────────────────────────────────

const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const { setProfile } = useCustomerProfile();
  const [mobile, setMobile] = useState("");
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Send OTP to mobile number
  const handleSendOtp = async () => {
    if (!mobile || mobile.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(ENDPOINTS.SEND_OTP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });
      const json = await res.json();
      if (res.ok && (json.success || json.message)) {
        setStep(2);
      } else {
        setError(json.message || json.detail || "Mobile number not registered. Please contact your sales rep.");
      }
    } catch (err) {
      setError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP and login
  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      setError("Please enter a valid OTP.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(ENDPOINTS.VERIFY_OTP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, otp }),
      });
      const json = await res.json();
      if (res.ok && (json.token || json.access_token || json.data?.token || json.data?.access_token)) {
        const token = json.token || json.access_token || json.data?.token || json.data?.access_token;
        const customer = json.customer || json.user || json.data?.customer || json.data?.user || null;
        
        // Save token & customer info
        localStorage.setItem("customer_token", token);
        if (customer) {
          localStorage.setItem("customer_data", JSON.stringify(customer));
          setProfile(customer);
        }
        if (rememberMe) localStorage.setItem("customer_mobile", mobile);
        
        onLogin();
        navigate("/dashboard");
      } else {
        setError(json.message || json.detail || "Incorrect OTP! Please check and try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (step === 1) handleSendOtp();
    else handleVerifyOtp();
  };

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden" style={{ fontFamily: "'Inter', 'Outfit', sans-serif" }}>

      {/* ── Background ── */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/login.png')" }}
      />

      {/* ── UI Layer ── */}
      <div className="relative z-10 h-full w-full flex">

        {/* Left Benefits — desktop only */}
        <div className="hidden lg:flex flex-col justify-center w-[340px] xl:w-[420px] pl-8 xl:pl-12 shrink-0 h-full">
          <div 
            className="p-8 rounded-[24px] shadow-2xl"
            style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.4)" }}
          >
            <h3 className="text-[22px] font-bold text-white mb-2 leading-tight">Empowering Your Wholesale Business</h3>
            <p className="text-[13px] text-white/85 mb-8 leading-relaxed">
              Join thousands of businesses sourcing high-quality agricultural products directly from trusted sources.
            </p>
            
            <div className="grid grid-cols-2 gap-y-7 gap-x-4">
              {/* Feature 1 */}
              <div className="flex flex-col gap-2.5">
                <div className="w-11 h-11 rounded-full flex items-center justify-center bg-white/25 text-white shadow-sm border border-white/30">
                  <LeafOutlineIcon />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-white leading-tight">Wide Range</p>
                  <p className="text-[11px] text-white/70 mt-0.5">Top quality grains</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col gap-2.5">
                <div className="w-11 h-11 rounded-full flex items-center justify-center bg-white/25 text-white shadow-sm border border-white/30">
                  <DeliveryTruckIcon />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-white leading-tight">Reliable Supply</p>
                  <p className="text-[11px] text-white/70 mt-0.5">On-time delivery</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col gap-2.5">
                <div className="w-11 h-11 rounded-full flex items-center justify-center bg-white/25 text-white shadow-sm border border-white/30">
                  <DiscountBadgeIcon />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-white leading-tight">Best Prices</p>
                  <p className="text-[11px] text-white/70 mt-0.5">Wholesale rates</p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="flex flex-col gap-2.5">
                <div className="w-11 h-11 rounded-full flex items-center justify-center bg-white/25 text-white shadow-sm border border-white/30">
                  <BusinessPartnersIcon />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-white leading-tight">1000+ Partners</p>
                  <p className="text-[11px] text-white/70 mt-0.5">Trusted network</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column */}
        <div className="flex-1 flex flex-col items-center px-4 py-3 h-full overflow-y-auto overflow-x-hidden no-scrollbar">

          {/* Logo */}
          <div className="flex justify-center mt-12">

            <img
              src="https://sadapoorna.in/icons/Group.png"
              alt="Sadapoorna"
              className="w-[190px] max-w-[65vw] h-auto"
            />
          </div>

          {/* Tagline */}
          <div className="mt-8 text-center">
            <p className="text-[8px] tracking-[2.5px] font-semibold text-[#24313b] uppercase">
              PURE ESSENTIALS FOR A BRIGHTER TOMORROW
            </p>
            <div className="mx-auto mt-1 h-[3px] w-[40px] rounded-full bg-[#E52323]" />
          </div>

          {/* Hero Heading */}
          <div className="mt-10 text-center leading-tight">
            <h1 className="text-[24px] sm:text-[26px] font-bold text-[#17232D] leading-[1.05]">
              Trusted by
            </h1>
            <h2 className="text-[22px] sm:text-[24px] font-bold text-[#E52323] leading-[1.05]">
              Growing Businesses
            </h2>
          </div>

          {/* Category */}
          <p className="mt-1.5 text-[13px] text-[#29353F] font-medium text-center">
            Grains | Pulses | Rice | Edible Oils | And More
          </p>



          {/* ── Login Section ── */}
          <div className="mt-20 w-full max-w-[340px]">

            <form onSubmit={handleLogin} className="space-y-3">

              {/* Mobile Input */}
              <GlassInput
                icon={<Smartphone size={18} strokeWidth={1.8} />}
                type="tel"
                placeholder="Enter Mobile Number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                maxLength={10}
                inputMode="numeric"
                autoComplete="tel"
                disabled={step === 2}
                style={step === 2 ? { opacity: 0.7 } : {}}
              />

              {/* OTP Input */}
              {step === 2 && (
                <GlassInput
                  icon={<LockKeyhole size={18} strokeWidth={1.8} />}
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                />
              )}

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2.5 bg-[#EF2026]/20 border border-[#EF2026]/40 backdrop-blur-md rounded-[12px] py-2 px-3 animate-[pulse_1.5s_ease-in-out_infinite]">
                  <div className="text-[#EF2026] shrink-0 bg-white/90 p-1 rounded-full">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                  </div>
                  <p className="text-white text-[12.5px] font-medium tracking-wide">
                    {error}
                  </p>
                </div>
              )}

              {/* Controls */}
              {step === 1 ? (
                <div className="flex items-center justify-between pt-0.5 pb-0.5">
                  <button
                    type="button"
                    onClick={() => setRememberMe((v) => !v)}
                    className="flex items-center gap-1.5"
                  >
                    <span
                      className="w-[20px] h-[20px] rounded-[4px] flex items-center justify-center shrink-0 transition"
                      style={{
                        background: rememberMe ? "#E52323" : "rgba(0,0,0,0.18)",
                        backdropFilter: "blur(8px)",
                        border: rememberMe ? "none" : "1.5px solid rgba(255,255,255,0.6)",
                      }}
                    >
                      {rememberMe && <Check size={14} strokeWidth={2.5} className="text-white" />}
                    </span>
                    <span className="text-[12px] font-medium text-white">Remember me</span>
                  </button>
                </div>
              ) : (
                <div className="flex justify-end pt-0.5 pb-0.5">
                  <button type="button" onClick={() => { setStep(1); setOtp(""); setError(""); }} className="text-[12px] font-medium text-white hover:underline">
                    Change Mobile Number
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[48px] rounded-full flex items-center justify-between px-6 text-white transition active:scale-[0.98] disabled:opacity-60"
                style={{ background: "#EF2026" }}
              >
                <span className="text-[18px] font-semibold">
                  {isLoading ? "Please wait..." : step === 1 ? "Get OTP" : "Verify & Login"}
                </span>
                <ArrowRight size={22} strokeWidth={1.8} />
              </button>

              {/* Contact Sales */}
              <p className="text-center text-[12px] pt-1 pb-1">
                <span className="text-white/70">New to Sadapoorna? </span>
                <button type="button" className="text-white font-semibold hover:underline">
                  Contact your sales rep
                </button>
              </p>

            </form>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-4 pb-2 text-center text-white">
            <p className="tracking-[4px] text-[9px] font-semibold uppercase">SADAPOORNA</p>
            <p className="mt-0.5 tracking-[2px] text-[7px] text-white/70 uppercase">WHOLESALE TODAY. A BETTER TOMORROW.</p>
          </div>

        </div>

        {/* Right — invisible spacer to keep center content truly centered on desktop */}
        <div className="hidden lg:block w-[340px] xl:w-[420px] shrink-0" />

      </div>
    </div>
  );
};

export default LoginPage;


