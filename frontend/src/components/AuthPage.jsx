import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Lock, User, Zap, Eye, EyeOff, Sparkles, MoveRight, Inbox, CheckCircle, ShieldCheck } from "lucide-react"
import toast from "react-hot-toast"
import { Toaster } from "react-hot-toast"
import { login, signup, googleLogin } from "../api"
import { useGoogleLogin } from "@react-oauth/google"

function getStrength(pw) {
  let s = 0
  if (pw.length >= 6)  s++
  if (pw.length >= 10) s++
  if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
}

const colorMap = ["#ef4444", "#ef4444", "#f59e0b", "#22c55e", "#22c55e"]

export default function AuthPage({ onLogin }) {
  const [isSignup,     setIsSignup]     = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [form,         setForm]         = useState({ name:"", email:"", password:"" })

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  const strength = getStrength(form.password)

  const switchMode = () => { setIsSignup(s => !s); setForm({ name:"", email:"", password:"" }) }

  const handleGoogleSuccess = async (tokenResponse) => {
    setLoading(true)
    try {
      const result = await googleLogin(tokenResponse.access_token)
      localStorage.setItem("token", result.access_token)
      localStorage.setItem("user_name", result.user_name)
      localStorage.setItem("user_email", result.user_email)
      localStorage.setItem("google_token", tokenResponse.access_token)
      onLogin(result)
      toast.success(`Welcome, ${result.user_name}!`)
    } catch {
      toast.error("Google login failed")
    } finally {
      setLoading(false)
    }
  }

  const googleLoginHook = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => toast.error("Google login failed"),
    scope: "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send",
    flow :"implicit",
  })

  const handleSubmit = async () => {
    if (isSignup && (!form.name || form.name.trim().length < 2)) { toast.error("Name must be at least 2 characters"); return }
    if (!form.email)  { toast.error("Email is required"); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { toast.error("Please enter a valid email address"); return }
    if (!form.password) { toast.error("Password is required"); return }
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return }

    setLoading(true)
    try {
      if (isSignup) {
        await signup(form.name, form.email, form.password)
        toast.success("Account created! Please log in.")
        setIsSignup(false); setForm({ name:"", email:"", password:"" }); return
      }
      const result = await login(form.email, form.password)
      toast.success(`Welcome back, ${result.user_name}!`)
      localStorage.setItem("token",      result.access_token)
      localStorage.setItem("user_name",  result.user_name)
      localStorage.setItem("user_email", result.user_email)
      onLogin(result)
    } catch (err) {
      const detail = err.response?.data?.detail
      if (typeof detail === "string")   toast.error(detail)
      else if (Array.isArray(detail))   toast.error(detail.map(e => e.msg).join(", "))
      else                              toast.error("Authentication failed")
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#030712] font-['DM_Sans'] flex relative overflow-hidden text-slate-200">
      <Toaster position="top-right" toastOptions={{ style:{ background:"#0f172a", color:"#fff", border:"1px solid #1e293b" } }}/>
      
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute top-[40%] right-[5%] w-[40%] h-[60%] bg-violet-600/20 rounded-full blur-[140px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[100px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-50" />
      </div>

      <div className="w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row z-10 relative">
        
        {/* Left Section - Hero Landing */}
        <div className="flex-1 px-8 pt-12 pb-8 lg:p-20 flex flex-col justify-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}>
            
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold tracking-wide uppercase mb-6">
              <Sparkles size={14} className="text-indigo-400"/> New: Gmail API Integration
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold font-['Syne'] text-white leading-[1.05] tracking-tight mb-6">
              Manage emails with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">AI Intelligence.</span>
            </h1>
            
            <p className="text-lg text-slate-400 max-w-xl leading-relaxed mb-10">
              Fetch, categorize, summarize, and reply to your emails effortlessly. Elevate your productivity with a beautiful AI-powered inbox.
            </p>

            <div className="flex flex-col sm:flex-row gap-6">
              {[
                { icon: ShieldCheck, title: "Secure OAuth", desc: "Connect securely via Google" },
                { icon: Inbox, title: "Smart Inbox", desc: "Automated categorizations" },
                { icon: CheckCircle, title: "Tone Replies", desc: "Generate 1-click responses" }
              ].map((ft, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                    <ft.icon size={18} className="text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{ft.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{ft.desc}</p>
                  </div>
                </div>
              ))}
            </div>

          </motion.div>
        </div>

        {/* Right Section - Auth Form */}
        <div className="w-full lg:w-[500px] p-8 lg:p-12 flex items-center justify-center lg:justify-end">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Zap size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-['Syne'] text-white">AI Email</h2>
                <p className="text-[10px] text-indigo-300 font-bold tracking-widest uppercase">Workspace</p>
              </div>
            </div>

            <div className="flex bg-slate-800/50 p-1 rounded-xl mb-8 border border-slate-700/50">
              {["Login", "Signup"].map((tab) => {
                const isActive = tab === "Login" ? !isSignup : isSignup;
                return (
                  <button
                    key={tab}
                    onClick={() => { setIsSignup(tab === "Signup"); setForm({ name: "", email: "", password: "" }) }}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                      isActive ? "bg-indigo-500 text-white shadow-md" : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                    }`}
                  >
                    {tab}
                  </button>
                )
              })}
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {isSignup && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input name="name" placeholder="John Doe" value={form.name} onChange={handleChange} className="w-full bg-slate-900/50 border border-slate-700 text-white text-sm rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} className="w-full bg-slate-900/50 border border-slate-700 text-white text-sm rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={form.password} onChange={handleChange} onKeyDown={e=>e.key==="Enter"&&handleSubmit()} className="w-full bg-slate-900/50 border border-slate-700 text-white text-sm rounded-xl py-3 pl-11 pr-11 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600" />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {isSignup && form.password.length > 0 && (
                  <div className="flex gap-1 mt-2 px-1">
                    {[1, 2, 3, 4].map(n => (
                      <div key={n} className={`h-1 flex-1 rounded-full ${n <= strength ? `bg-[${colorMap[strength]}]` : "bg-slate-700"}`} style={{ backgroundColor: n <= strength ? colorMap[strength] : undefined }} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button onClick={handleSubmit} disabled={loading} className="w-full mt-8 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isSignup ? "Create Account" : "Sign In"}
                  <MoveRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-slate-700" />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Or</span>
              <div className="flex-1 h-px bg-slate-700" />
            </div>

            <button onClick={() => googleLoginHook()} className="w-full bg-white hover:bg-slate-50 text-slate-800 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-3">
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

          </motion.div>
        </div>
      </div>
    </div>
  )
}