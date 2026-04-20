import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useInView, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { ArrowRight, MapPin, ShoppingBag, Truck, Store, Star, Clock, Shield, TrendingUp, Package, Phone, CheckCircle2, Zap, Plus, Check, XCircle, Heart, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PrimaryFlowButton, SecondaryFlowButton, OutlineFlowButton } from '@/components/ui/flow-button'
import { Card, CardContent } from '@/components/ui/card'
import { useSeo } from '@/hooks/useSeo'
import { HowItWorks } from '@/components/shared/HowItWorks'
import Footer from '@/components/layout/Footer'

// ─── Animation Tokens ───
const EASING = {
  enter: [0.22, 1, 0.36, 1] as const,
  move: [0.25, 1, 0.5, 1] as const,
}

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASING.enter } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
}

const floatAnimation = {
  y: [-8, 8, -8],
  transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
}

// ─── Data ───
const featuredShops = [
  { id: '1', name: 'Sindhi General Store', rating: 4.8, deliveryTime: '15-25 min', distance: '0.5 km', category: 'Grocery', image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=300&fit=crop' },
  { id: '2', name: 'Fresh Dairy Farm', rating: 4.9, deliveryTime: '10-20 min', distance: '0.3 km', category: 'Dairy', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop' },
  { id: '3', name: 'Green Valley Grocers', rating: 4.7, deliveryTime: '20-30 min', distance: '0.8 km', category: 'Fruits', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop' },
]

const shopOwnerSteps = [
  { step: 1, icon: Store, title: 'Register Your Shop', description: 'Create your shop profile in 2 minutes. Add your shop name, location, and category.', color: 'from-primary to-emerald-600' },
  { step: 2, icon: Package, title: 'List Your Products', description: 'Add products with photos, prices, and stock. Our dashboard makes it effortless.', color: 'from-blue-500 to-cyan-500' },
  { step: 3, icon: TrendingUp, title: 'Start Getting Orders', description: 'Customers discover your shop, place orders, and our delivery partners handle the rest.', color: 'from-purple-500 to-pink-500' },
]

const comparisonData = [
  { feature: 'Online Storefront', openmart: true, whatsapp: false, instagram: false, phone: false },
  { feature: 'Auto Order Management', openmart: true, whatsapp: false, instagram: false, phone: false },
  { feature: 'Delivery Partner Network', openmart: true, whatsapp: false, instagram: false, phone: false },
  { feature: 'Sales Analytics', openmart: true, whatsapp: false, instagram: false, phone: false },
  { feature: 'Customer Reviews', openmart: true, whatsapp: false, instagram: true, phone: false },
  { feature: 'Inventory Tracking', openmart: true, whatsapp: false, instagram: false, phone: false },
  { feature: 'COD Payments', openmart: true, whatsapp: false, instagram: false, phone: true },
  { feature: 'Zero Setup Cost', openmart: true, whatsapp: true, instagram: true, phone: true },
]

const testimonials = [
  { name: 'Rajesh Kumar', shop: 'Sindhi General Store', quote: 'OpenMart doubled my monthly revenue. I reach customers I never could before, and the delivery partners handle everything.', rating: 5, initials: 'RK' },
  { name: 'Priya Sharma', shop: 'Fresh Dairy Farm', quote: 'The dashboard is so easy to use. I listed 200 products in one evening and got my first order the next morning.', rating: 5, initials: 'PS' },
  { name: 'Amit Patel', shop: 'Green Valley Grocers', quote: 'Best decision for my shop. The analytics help me understand what customers want, and I never run out of stock now.', rating: 5, initials: 'AP' },
]

const customerBenefits = [
  { icon: Zap, title: 'Lightning-Fast Delivery', description: 'Get your essentials delivered in 15-30 minutes from nearby shops.' },
  { icon: Heart, title: 'Support Local Shops', description: 'Shop from neighborhood stores and help your community thrive.' },
  { icon: Shield, title: 'Secure & Transparent', description: 'COD only — pay when you receive. No hidden charges, ever.' },
  { icon: Phone, title: 'Live Order Tracking', description: 'Track your order in real-time from shop to your doorstep.' },
  { icon: Star, title: 'Quality Products', description: 'Verified shops with ratings and reviews you can trust.' },
  { icon: ShoppingBag, title: 'Wide Selection', description: 'Groceries, dairy, fresh produce, household items — all in one place.' },
]

const faqs = [
  { q: 'How much does it cost to register my shop?', a: 'Registration is completely free. We only charge a small commission on completed orders, so you only pay when you earn.' },
  { q: 'Do I need technical knowledge to use OpenMart?', a: 'Not at all. Our dashboard is designed for simplicity. If you can use WhatsApp, you can use OpenMart.' },
  { q: 'Who handles the delivery?', a: 'Our network of verified delivery partners picks up orders from your shop and delivers them to customers. You just pack the order.' },
  { q: 'How do I get paid?', a: 'Payments are settled directly to your bank account on a weekly basis. You can track all earnings in your dashboard.' },
  { q: 'Can I manage my inventory from the app?', a: 'Yes! Update stock, prices, and product details anytime from your shop dashboard — on mobile or desktop.' },
  { q: 'Is there a minimum order requirement?', a: 'No minimum orders required. Whether you get 1 order or 100, our platform works the same way.' },
]

const stats = [
  { value: 500, suffix: '+', label: 'Local Shops' },
  { value: 10, suffix: 'K+', label: 'Happy Customers' },
  { value: 50, suffix: 'K+', label: 'Orders Delivered' },
  { value: 4.8, suffix: '', label: 'Average Rating', isDecimal: true },
]

// ─── Animated Components ───

function AnimatedBackground() {
  const reduceMotion = useReducedMotion()
  if (reduceMotion) return null
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]"
      />
      <motion.div 
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[100px]"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)]" />
    </div>
  )
}

function ScrollProgress() {
  const reduceMotion = useReducedMotion()
  if (reduceMotion) return null
  const { scrollYProgress } = useScroll()
  return (
    <motion.div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '3px',
        background: 'linear-gradient(90deg, #10b981, #059669)',
        transformOrigin: '0%', scaleX: scrollYProgress, zIndex: 100,
      }}
    />
  )
}

function BackToTop() {
  const [visible, setVisible] = useState(false)
  const reduceMotion = useReducedMotion()
  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 600)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  if (!visible) return null
  return (
    <motion.button
      initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      style={{
        position: 'fixed', bottom: '24px', right: '24px', width: '48px', height: '48px',
        borderRadius: '12px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)', zIndex: 50,
      }}
    >
      <ChevronUp style={{ width: '20px', height: '20px', color: '#ffffff' }} />
    </motion.button>
  )
}

function Avatar({ initials, size = 40 }: { initials: string; size?: number }) {
  const colors = ['bg-primary/20 text-primary', 'bg-blue-500/20 text-blue-400', 'bg-purple-500/20 text-purple-400']
  const idx = initials.charCodeAt(0) % colors.length
  return (
    <div className={`rounded-full ${colors[idx]} flex items-center justify-center font-semibold`}
      style={{ width: `${size}px`, height: `${size}px`, fontSize: `${size * 0.35}px` }} aria-hidden="true">
      {initials}
    </div>
  )
}

function ImageWithPlaceholder({ src, alt, className, aspectRatio = 'aspect-square' }: { src: string; alt: string; className?: string; aspectRatio?: string }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <div className={`relative ${aspectRatio} overflow-hidden ${className || ''}`}>
      {!loaded && <div className="absolute inset-0 bg-secondary/30 animate-pulse" />}
      <img src={src} alt={alt} loading="lazy" onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        style={{ aspectRatio: aspectRatio === 'aspect-square' ? '1/1' : '16/9' }} />
    </div>
  )
}

function ScrollIndicator() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
    >
      <span className="text-xs text-muted-foreground uppercase tracking-widest">Scroll</span>
      <motion.div 
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2"
      >
        <motion.div 
          animate={{ opacity: [1, 0.5, 1], y: [0, 12, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-1.5 h-1.5 rounded-full bg-primary"
        />
      </motion.div>
    </motion.div>
  )
}

function AnimatedStat({ value, suffix, isDecimal }: { value: number; suffix: string; isDecimal?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return
    const duration = 1500
    const steps = 40
    const increment = value / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(isDecimal ? Math.round(current * 10) / 10 : Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [isInView, value, isDecimal])

  return <span ref={ref}>{isDecimal ? count.toFixed(1) : count}{suffix}</span>
}

function AnimatedIcon({ icon: Icon, className }: { icon: React.ComponentType<any>; className?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      ref={ref}
      initial={reduceMotion ? {} : { scale: 0.5, opacity: 0, rotate: -10 }}
      animate={isInView ? { scale: 1, opacity: 1, rotate: 0 } : {}}
      transition={reduceMotion ? {} : { type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
      className={className}
    >
      <Icon className="w-6 h-6 text-primary" />
    </motion.div>
  )
}

function StaggeredHeading({ text, className }: { text: string; className?: string }) {
  const reduceMotion = useReducedMotion()
  const words = text.split(' ')
  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? {} : { delay: 0.3 + i * 0.1, duration: 0.4, ease: EASING.enter }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}

function ParallaxImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [-20, 20])
  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      <img src={src} alt={alt} className="w-full h-full object-cover" />
    </motion.div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <motion.div
      style={{
        borderRadius: '12px',
        overflow: 'hidden',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        transition: 'all 0.3s ease',
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        style={{
          width: '100%',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: '#e2e8f0',
          fontSize: '16px',
          fontWeight: 600,
          fontFamily: 'inherit',
          textAlign: 'left',
        }}
      >
        {question}
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ display: 'flex', alignItems: 'center', color: '#10b981', minWidth: '44px', minHeight: '44px', justifyContent: 'center' }}
        >
          <Plus style={{ width: '20px', height: '20px' }} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASING.enter }}
          >
            <div style={{ padding: '0 24px 20px', color: '#94a3b8', fontSize: '15px', lineHeight: 1.6 }}>
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Main Landing Component ───

export default function Landing() {
  const [searchQuery, setSearchQuery] = useState('')

  useSeo({
    title: 'OpenMart - Your Local Marketplace',
    description: 'Discover local shops, groceries, and essentials near you. Order online and get delivery to your doorstep.',
    keywords: 'online shopping, grocery delivery, local shops, essentials, near me',
  })

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <ScrollProgress />
      <BackToTop />
      <div className="fixed inset-0 gradient-mesh opacity-50" />
      <div className="fixed inset-0 noise" />
      <AnimatedBackground />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <Link to="/" aria-label="OpenMart home">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Store className="w-6 h-6 text-primary" />
                </div>
              </Link>
              <span className="text-xl font-bold tracking-tight">OpenMart</span>
            </motion.div>
            
            <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
              {['Shops', 'For Shops', 'About'].map((item, i) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  {item}
                </motion.a>
              ))}
            </nav>
            
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm" aria-label="Sign in to your account">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button size="sm" aria-label="Create a new account">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ─── HERO: Dual-Audience ─── */}
      <section className="relative min-h-dvh flex items-center pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-3 md:space-y-6 lg:space-y-8"
            >
              {/* Badge */}
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-primary/10 border border-primary/20">
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                  <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                </motion.div>
                <span className="text-xs md:text-sm font-medium text-primary">Serving Sindhi Railway, 442105</span>
              </motion.div>
              
              {/* Headline */}
              <motion.h1 variants={fadeInUp} className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-7xl font-bold leading-tight">
                <StaggeredHeading text="Your Local" />
                <motion.span 
                  initial={{ backgroundPosition: '200% 0' }}
                  animate={{ backgroundPosition: '-200% 0' }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-green-400 to-primary bg-[length:200%_auto]"
                >
                  <StaggeredHeading text="Marketplace" />
                </motion.span>
              </motion.h1>
              
              {/* Subheadline */}
              <motion.p variants={fadeInUp} className="text-sm sm:text-base md:text-lg text-muted-foreground">
                For customers: Shop from neighborhood stores, delivered fast.
                <br />
                <span className="text-primary font-medium">For shops: Go online in 2 minutes, zero setup cost.</span>
              </motion.p>

              {/* Search + CTAs */}
              <motion.div variants={fadeInUp} className="space-y-3">
                {/* Search Bar */}
                <motion.div 
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                >
                  <div
                    style={{
                      position: 'relative',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      background: 'rgba(255, 255, 255, 0.03)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
                      transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)'
                      e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.12), 0 0 0 2px rgba(16, 185, 129, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
                      e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
                    }}
                  >
                    <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 1, display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(16, 185, 129, 0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                      </svg>
                    </div>
                    <input type="text" placeholder="Search shops or products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', height: '48px', padding: '0 48px 0 40px', background: 'transparent', border: 'none', outline: 'none', color: '#e2e8f0', fontSize: '15px', fontWeight: 400, fontFamily: 'inherit' }} />
                    <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} style={{ position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)', width: '38px', height: '38px', borderRadius: '8px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)' }} onMouseLeave={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                    </motion.button>
                  </div>
                </motion.div>

                {/* CTA Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  <PrimaryFlowButton href="/home" size="md">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', whiteSpace: 'nowrap' }}>Browse Shops <ArrowRight style={{ width: '16px', height: '16px' }} /></span>
                  </PrimaryFlowButton>
                  <SecondaryFlowButton href="/register?role=SHOP_OWNER" size="md">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', whiteSpace: 'nowrap' }}>Sell on OpenMart <ArrowRight style={{ width: '16px', height: '16px' }} /></span>
                  </SecondaryFlowButton>
                </div>
              </motion.div>

              {/* Social Proof */}
              <motion.div variants={fadeInUp} className="flex items-center gap-6 md:gap-8 pt-2">
                <div className="flex -space-x-3" aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <motion.div key={i} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5 + i * 0.1, type: 'spring', stiffness: 300 }} className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-background bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-xs md:text-sm font-medium">{i}</motion.div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1" aria-label="5 out of 5 stars">
                    {[1, 2, 3, 4, 5].map((i) => (<Star key={i} className="w-3.5 h-3.5 md:w-4 md:h-4 fill-primary text-primary" aria-hidden="true" />))}
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground">2,000+ happy customers</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Featured Shops - Bento Grid (Hidden on Mobile) */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: EASING.enter }} className="relative hidden md:block">
              <div className="grid grid-cols-2 gap-3 lg:gap-4">
                {/* Card 1 - Spans 2 rows on the left */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4, ease: EASING.enter }} className="row-span-2">
                  <Link to={`/shops/${featuredShops[0].id}`}>
                    <Card className="overflow-hidden group hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer h-full">
                      <div className="relative h-full min-h-[280px] lg:min-h-[340px]">
                        <ImageWithPlaceholder src={featuredShops[0].image} alt={featuredShops[0].name} className="group-hover:scale-105 transition-transform duration-500 h-full" aspectRatio="aspect-square" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                        {/* Rating Badge */}
                        <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm">
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                          <span className="text-sm font-medium text-white">{featuredShops[0].rating}</span>
                        </div>
                        {/* Category Badge */}
                        <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-primary/90 backdrop-blur-sm">
                          <span className="text-xs font-semibold text-white uppercase tracking-wide">{featuredShops[0].category}</span>
                        </div>
                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-5">
                          <h3 className="text-xl lg:text-2xl font-bold text-white mb-2">{featuredShops[0].name}</h3>
                          <div className="flex items-center gap-5 text-sm text-white/80">
                            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" aria-hidden="true" />{featuredShops[0].deliveryTime}</span>
                            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" aria-hidden="true" />{featuredShops[0].distance}</span>
                          </div>
                        </div>
                        {/* Arrow */}
                        <div className="absolute bottom-5 right-5">
                          <motion.div initial={{ x: 0 }} whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-primary/80 transition-colors">
                              <ArrowRight className="w-5 h-5 text-white" />
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>

                {/* Card 2 - Top right */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.4, ease: EASING.enter }}>
                  <Link to={`/shops/${featuredShops[1].id}`}>
                    <Card className="overflow-hidden group hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer">
                      <div className="flex">
                        <div className="relative w-28 h-28 lg:w-32 lg:h-32 shrink-0 overflow-hidden">
                          <ImageWithPlaceholder src={featuredShops[1].image} alt={featuredShops[1].name} className="group-hover:scale-110 transition-transform duration-500" aspectRatio="aspect-square" />
                          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
                          <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/40 backdrop-blur-sm">
                            <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                            <span className="text-[10px] font-medium text-white">{featuredShops[1].rating}</span>
                          </div>
                        </div>
                        <div className="flex flex-col justify-between p-3 lg:p-4 flex-1 min-w-0">
                          <div>
                            <h3 className="text-sm lg:text-base font-bold text-foreground group-hover:text-primary transition-colors truncate">{featuredShops[1].name}</h3>
                            <span className="inline-block mt-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">{featuredShops[1].category}</span>
                          </div>
                          <div className="flex items-center gap-3 lg:gap-4 text-xs lg:text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3 lg:w-3.5 lg:h-3.5" aria-hidden="true" />{featuredShops[1].deliveryTime}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3 lg:w-3.5 lg:h-3.5" aria-hidden="true" />{featuredShops[1].distance}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>

                {/* Card 3 - Bottom right */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.4, ease: EASING.enter }}>
                  <Link to={`/shops/${featuredShops[2].id}`}>
                    <Card className="overflow-hidden group hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer">
                      <div className="flex">
                        <div className="relative w-28 h-28 lg:w-32 lg:h-32 shrink-0 overflow-hidden">
                          <ImageWithPlaceholder src={featuredShops[2].image} alt={featuredShops[2].name} className="group-hover:scale-110 transition-transform duration-500" aspectRatio="aspect-square" />
                          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
                          <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/40 backdrop-blur-sm">
                            <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                            <span className="text-[10px] font-medium text-white">{featuredShops[2].rating}</span>
                          </div>
                        </div>
                        <div className="flex flex-col justify-between p-3 lg:p-4 flex-1 min-w-0">
                          <div>
                            <h3 className="text-sm lg:text-base font-bold text-foreground group-hover:text-primary transition-colors truncate">{featuredShops[2].name}</h3>
                            <span className="inline-block mt-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">{featuredShops[2].category}</span>
                          </div>
                          <div className="flex items-center gap-3 lg:gap-4 text-xs lg:text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3 lg:w-3.5 lg:h-3.5" aria-hidden="true" />{featuredShops[2].deliveryTime}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3 lg:w-3.5 lg:h-3.5" aria-hidden="true" />{featuredShops[2].distance}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
        <ScrollIndicator />
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="py-12 border-y border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: i * 0.1, duration: 0.4, ease: EASING.enter }} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary"><AnimatedStat value={stat.value} suffix={stat.suffix} isDecimal={stat.isDecimal} /></p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }} className="text-center mt-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Zap className="w-4 h-4" />
              Zero commission for first 3 months — Register now
            </span>
          </motion.div>
        </div>
      </section>

      {/* ─── HOW IT WORKS (Customers) ─── */}
      <HowItWorks />

      {/* ─── SHOP OWNER JOURNEY ─── */}
      <section id="for-shops" className="py-20 bg-card/50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">For Shop Owners</span>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Get Online in 3 Simple Steps</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">No technical skills needed. If you can use WhatsApp, you can use OpenMart.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {shopOwnerSteps.map((step, i) => (
              <motion.div key={step.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: i * 0.15, duration: 0.5, ease: EASING.enter }} whileHover={{ y: -6 }} className="relative">
                <Card className="h-full hover:border-primary/30 transition-colors">
                  <CardContent className="p-8 text-center">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-6`}>
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center">{step.step}</div>
                    <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
                {i < shopOwnerSteps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 text-primary">
                    <ArrowRight className="w-8 h-8" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mt-12">
            <PrimaryFlowButton href="/register?role=SHOP_OWNER">
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>Register Your Shop — It's Free <ArrowRight style={{ width: '18px', height: '18px' }} /></span>
            </PrimaryFlowButton>
          </motion.div>
        </div>
      </section>

      {/* ─── PLATFORM PREVIEW ─── */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Powerful Dashboard, Simple to Use</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Manage products, track orders, and grow your business — all from one place.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, ease: EASING.enter }}
            className="relative max-w-5xl mx-auto"
          >
            {/* Browser Mockup */}
            <div style={{ borderRadius: '16px', overflow: 'hidden', background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4)' }}>
              {/* Browser Bar */}
              <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#eab308' }} />
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e' }} />
                </div>
                <div style={{ flex: 1, marginLeft: '12px', height: '28px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>dashboard.openmart.com</span>
                </div>
              </div>
              {/* Dashboard Preview */}
              <div style={{ padding: '24px', minHeight: '400px', display: 'grid', gridTemplateColumns: '200px 1fr', gap: '20px' }}>
                {/* Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {['Dashboard', 'Products', 'Orders', 'Analytics', 'Settings'].map((item, i) => (
                    <div key={item} style={{ padding: '10px 14px', borderRadius: '8px', background: i === 0 ? 'rgba(16, 185, 129, 0.15)' : 'transparent', color: i === 0 ? '#10b981' : '#64748b', fontSize: '14px', fontWeight: i === 0 ? 600 : 400, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: i === 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(100, 116, 139, 0.2)' }} />
                      {item}
                    </div>
                  ))}
                </div>
                {/* Main Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Stats Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    {[{ label: 'Today\'s Revenue', value: '₹12,450', change: '+18%' }, { label: 'Orders', value: '47', change: '+12%' }, { label: 'Customers', value: '156', change: '+8%' }].map((stat) => (
                      <div key={stat.label} style={{ padding: '16px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                        <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{stat.label}</p>
                        <p style={{ fontSize: '22px', fontWeight: 700, color: '#e2e8f0' }}>{stat.value}</p>
                        <p style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>{stat.change}</p>
                      </div>
                    ))}
                  </div>
                  {/* Chart Placeholder */}
                  <div style={{ flex: 1, padding: '16px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', alignItems: 'flex-end', gap: '8px', minHeight: '160px' }}>
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                      <motion.div key={i} initial={{ height: 0 }} whileInView={{ height: `${h}%` }} viewport={{ once: true }} transition={{ delay: i * 0.05, duration: 0.4, ease: EASING.enter }} style={{ flex: 1, borderRadius: '4px 4px 0 0', background: i === 11 ? 'linear-gradient(to top, #10b981, #059669)' : 'rgba(16, 185, 129, 0.3)' }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Stats */}
            <motion.div animate={floatAnimation} className="absolute -left-12 top-1/3 glass rounded-xl p-4 border border-border/50 hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-success" /></div>
                <div><p className="text-sm font-semibold text-success">+24% Sales</p><p className="text-xs text-muted-foreground">This week</p></div>
              </div>
            </motion.div>
            <motion.div animate={floatAnimation} transition={{ delay: 1 }} className="absolute -right-12 bottom-1/3 glass rounded-xl p-4 border border-border/50 hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center"><ShoppingBag className="w-5 h-5 text-primary" /></div>
                <div><p className="text-sm font-semibold">12 New Orders</p><p className="text-xs text-muted-foreground">Last hour</p></div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── COMPARISON TABLE ─── */}
      <section className="py-20 bg-card/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Why OpenMart Beats the Rest</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">See how OpenMart compares to managing orders through WhatsApp, Instagram, or phone calls.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.06)', background: 'rgba(30, 41, 59, 0.5)' }}>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr repeat(4, 1fr)', padding: '16px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', background: 'rgba(255, 255, 255, 0.02)' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0' }}>Feature</span>
              {['OpenMart', 'WhatsApp', 'Instagram', 'Phone'].map((name, i) => (
                <span key={name} style={{ fontSize: '14px', fontWeight: 600, color: i === 0 ? '#10b981' : '#64748b', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  {i === 0 && <Store className="w-4 h-4" />}{name}
                </span>
              ))}
            </div>
            {/* Rows */}
            {comparisonData.map((row, i) => (
              <div key={row.feature} style={{ display: 'grid', gridTemplateColumns: '2fr repeat(4, 1fr)', padding: '14px 24px', borderBottom: i < comparisonData.length - 1 ? '1px solid rgba(255, 255, 255, 0.04)' : 'none' }}>
                <span style={{ fontSize: '14px', color: '#cbd5e1' }}>{row.feature}</span>
                {[row.openmart, row.whatsapp, row.instagram, row.phone].map((val, j) => (
                  <div key={j} style={{ display: 'flex', justifyContent: 'center' }}>
                    {val ? <Check className="w-5 h-5 text-primary" /> : <XCircle className="w-5 h-5 text-muted-foreground/30" />}
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Loved by Shop Owners</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">See what local shop owners say about growing with OpenMart.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }}>
                <Card className="h-full hover:border-primary/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(t.rating)].map((_, j) => <Star key={j} className="w-4 h-4 fill-primary text-primary" />)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-6 italic">"{t.quote}"</p>
                    <div className="flex items-center gap-3">
                      <Avatar initials={t.initials} size={40} />
                      <div>
                        <p className="text-sm font-semibold">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.shop}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CUSTOMER BENEFITS ─── */}
      <section className="py-20 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">For Customers</span>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Shop Local, Get It Fast</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Everything you need from neighborhood shops, delivered to your door in minutes.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customerBenefits.map((benefit, i) => (
              <motion.div key={benefit.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: i * 0.08, duration: 0.4, ease: EASING.enter }} whileHover={{ y: -4 }}>
                <Card className="h-full hover:border-primary/30 transition-colors group">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors"><AnimatedIcon icon={benefit.icon} /></div>
                    <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mt-10">
            <PrimaryFlowButton href="/home">
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>Start Shopping <ArrowRight style={{ width: '18px', height: '18px' }} /></span>
            </PrimaryFlowButton>
          </motion.div>
        </div>
      </section>

      {/* ─── FEATURED SHOPS ─── */}
      <section id="shops" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Featured Shops</h2>
            <p className="text-muted-foreground text-lg">Top-rated stores in your neighborhood</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredShops.map((shop, i) => (
              <motion.div key={shop.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ delay: i * 0.1, duration: 0.4, ease: EASING.enter }} whileHover={{ y: -4 }}>
                <Link to={`/shops/${shop.id}`}>
                  <Card className="overflow-hidden group hover:border-primary/50 transition-colors">
                    <div className="aspect-video overflow-hidden relative">
                      <ParallaxImage src={shop.image} alt={shop.name} className="group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-primary/90 backdrop-blur-sm">
                        <span className="text-[10px] font-semibold text-white uppercase tracking-wide">{shop.category}</span>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold">{shop.name}</h3>
                        <div className="flex items-center gap-1 text-sm"><Star className="w-4 h-4 fill-primary text-primary" aria-hidden="true" /><span>{shop.rating}</span></div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" aria-hidden="true" />{shop.deliveryTime}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" aria-hidden="true" />{shop.distance}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mt-10">
            <OutlineFlowButton href="/shops">
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>View All Shops <ArrowRight style={{ width: '18px', height: '18px' }} /></span>
            </OutlineFlowButton>
          </motion.div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-20 bg-card/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground text-lg">Everything you need to know about joining OpenMart.</p>
          </motion.div>

          <div className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <FAQItem question={faq.q} answer={faq.a} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DELIVERY PARTNERS CTA ─── */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} className="text-center">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6"><Truck className="w-8 h-8 text-primary" /></motion.div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Become a Delivery Partner</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">Earn money on your own schedule. Pick up orders from local shops and deliver to customers nearby.</p>
            <PrimaryFlowButton href="/register?role=DELIVERY_BOY">
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>Join as Delivery Partner <ArrowRight style={{ width: '18px', height: '18px' }} /></span>
            </PrimaryFlowButton>
          </motion.div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">Ready to Grow Your Shop?</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">Join 500+ local shops already growing with OpenMart. Free registration, zero setup cost, and your first 3 months commission-free.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <PrimaryFlowButton href="/register?role=SHOP_OWNER">
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>Register Your Shop <ArrowRight style={{ width: '18px', height: '18px' }} /></span>
              </PrimaryFlowButton>
              <OutlineFlowButton href="/shops">
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>Browse Shops <ArrowRight style={{ width: '18px', height: '18px' }} /></span>
              </OutlineFlowButton>
            </div>
            <p className="text-xs text-muted-foreground mt-6">No credit card required • Free forever for customers • Zero setup for shops</p>
          </motion.div>
        </div>
      </section>

      {/* ─── TRUST BAR ─── */}
      <section className="py-16 border-t border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Shield, title: 'Secure & Trusted', desc: 'Verified shops, secure orders' },
              { icon: CheckCircle2, title: 'COD Only', desc: 'Pay when you receive your order' },
              { icon: Phone, title: '24/7 Support', desc: 'Help whenever you need it' },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.4, ease: EASING.enter }} className="flex flex-col items-center gap-3 group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <motion.div whileHover={{ scale: 1.15, rotate: 5 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}><item.icon className="w-6 h-6 text-primary" /></motion.div>
                </div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
