import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Store, Lock, ArrowRight, Mail, Phone, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store'
import { authApi } from '@/lib/api'
import { toast } from 'sonner'

function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * 100 - 50, 
            y: Math.random() * 100 - 50,
            scale: 0 
          }}
          animate={{ 
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
            scale: [0, 1, 0],
          }}
          transition={{ 
            duration: 4 + Math.random() * 2, 
            repeat: Infinity,
            delay: i * 0.5
          }}
          className={`absolute rounded-full blur-[80px] opacity-30 ${
            i % 2 === 0 ? 'bg-primary' : 'bg-purple-500'
          }`}
          style={{
            width: 100 + Math.random() * 150,
            height: 100 + Math.random() * 150,
            top: `${20 + i * 15}%`,
            left: `${10 + i * 20}%`,
          }}
        />
      ))}
    </div>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const setAuth = useAuthStore((state) => state.setAuth)
  const from = (location.state as any)?.from || '/home'
  
  const [loginMethod, setLoginMethod] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('demo@openmart.com')
  const [password, setPassword] = useState('admin123')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'Sign In - OpenMart'
  }, [])

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const redirectByRole = (role: string) => {
    const redirectPath = from !== '/home' ? from : (
      role === 'SHOP_OWNER' ? '/shop/dashboard' :
      role === 'DELIVERY_BOY' ? '/delivery/dashboard' :
      role === 'ADMIN' ? '/admin' :
      '/home'
    )
    navigate(redirectPath, { replace: true })
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please enter email and password')
      return
    }
    setLoading(true)
    setError('')
    try {
      const response = await authApi.login(email, password)
      const userData = response.data.data
      if (!userData || !userData.user || !userData.token) {
        setError('Login failed: Invalid server response')
        return
      }
      setAuth(userData.user, userData.token, userData.refreshToken)
      redirectByRole(userData.user.role)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone) {
      setError('Please enter your phone number')
      return
    }
    setLoading(true)
    setError('')
    try {
      await authApi.sendOtp(phone)
      setOtpSent(true)
      setCountdown(60)
      toast.success('OTP sent to your phone')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp || otp.length < 6) {
      setError('Please enter the 6-digit OTP')
      return
    }
    setLoading(true)
    setError('')
    try {
      const response = await authApi.verifyOtp(phone, otp)
      const userData = response.data.data
      if (!userData || !userData.user || !userData.token) {
        setError('Login failed: Invalid server response')
        return
      }
      setAuth(userData.user, userData.token, userData.refreshToken)
      toast.success('Login successful!')
      redirectByRole(userData.user.role)
    } catch (err: any) {
      setError(err.response?.data?.error || 'OTP verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed inset-0 gradient-mesh opacity-50" />
      <div className="fixed inset-0 noise" />
      <FloatingOrbs />
      
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
            className="inline-flex"
          >
            <Link to="/" className="inline-flex items-center gap-2">
              <motion.div
                whileHover={{ rotate: 5, scale: 1.05 }}
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/20"
              >
                <Store className="w-7 h-7 text-primary" />
              </motion.div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
                OpenMart
              </span>
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl">
            <CardHeader className="space-y-1 text-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <CardTitle className="text-3xl font-bold">Welcome back</CardTitle>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <CardDescription className="text-base">Sign in to continue your journey</CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent>
              {/* Login Method Tabs */}
              <div className="flex gap-2 mb-6 p-1 rounded-lg bg-secondary/50">
                <button
                  type="button"
                  onClick={() => { setLoginMethod('email'); setError(''); setOtpSent(false) }}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    loginMethod === 'email' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginMethod('otp'); setError(''); setOtpSent(false) }}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    loginMethod === 'otp' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Phone className="w-4 h-4 inline mr-1" />
                  Phone OTP
                </button>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-4"
                >
                  {error}
                </motion.div>
              )}

              {/* Email Login */}
              {loginMethod === 'email' && (
                <form onSubmit={handleEmailLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Password</Label>
                      <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showPassword ? '🙈' : '👁'}
                      </button>
                    </div>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button type="submit" className="w-full h-12 text-base relative overflow-hidden group" disabled={loading}>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-primary to-green-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {loading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                        ) : (
                          <>
                            Sign In
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </span>
                    </Button>
                  </motion.div>
                </form>
              )}

              {/* Phone OTP Login */}
              {loginMethod === 'otp' && (
                <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-5">
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="tel"
                        placeholder="+91 xxxxx xxxxx"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {otpSent && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <Label>Enter OTP</Label>
                      <div className="relative">
                        <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="6-digit OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="pl-10"
                          maxLength={6}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {countdown > 0 ? `Resend in ${countdown}s` : 'Did not receive OTP?'}
                        </span>
                        {countdown <= 0 && (
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            className="text-primary hover:underline"
                          >
                            Resend OTP
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button type="submit" className="w-full h-12 text-base relative overflow-hidden group" disabled={loading}>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-primary to-green-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {loading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                        ) : otpSent ? (
                          <>
                            Verify & Login
                            <ShieldCheck className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            Send OTP
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </span>
                    </Button>
                  </motion.div>
                </form>
              )}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 text-center text-sm"
              >
                <span className="text-muted-foreground">Don't have an account? </span>
                <Link to="/register" className="text-primary hover:underline font-medium">
                  Register
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-4 text-center"
              >
                <Link to="/admin-login" className="text-sm text-purple-500 hover:underline">
                  Admin Login →
                </Link>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
