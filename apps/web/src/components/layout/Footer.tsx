import { Link } from 'react-router-dom'
import { Store, Instagram, Twitter, Facebook, Linkedin, Smartphone } from 'lucide-react'

const footerLinks = {
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
    { label: 'Blog', href: '/blog' },
    { label: 'Zepto Recipes', href: '/recipes' },
  ],
  help: [
    { label: 'Customer Support', href: '/support' },
    { label: 'Delivery Areas', href: '/delivery-areas' },
    { label: 'FAQs', href: '/faqs' },
  ],
  policies: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Responsible Disclosure', href: '/disclosure' },
  ],
  partners: [
    { label: 'Sell on OpenMart', href: '/sell' },
    { label: 'Deliver with OpenMart', href: '/deliver' },
    { label: 'Franchise', href: '/franchise' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Top Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-4 lg:mb-0">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Store className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xl font-bold">OpenMart</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Your local marketplace. Fresh groceries, daily essentials, and more — delivered to your doorstep in minutes.
            </p>
            {/* App Download */}
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground">Download App</p>
              <div className="flex gap-2">
                <a href="#" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity">
                  <Smartphone className="w-4 h-4" />
                  Play Store
                </a>
                <a href="#" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity">
                  <Smartphone className="w-4 h-4" />
                  App Store
                </a>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map(link => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Help</h3>
            <ul className="space-y-2">
              {footerLinks.help.map(link => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Policies</h3>
            <ul className="space-y-2">
              {footerLinks.policies.map(link => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Partners</h3>
            <ul className="space-y-2">
              {footerLinks.partners.map(link => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a href="https://instagram.com" aria-label="Instagram" className="text-muted-foreground hover:text-foreground transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" aria-label="Twitter" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://facebook.com" aria-label="Facebook" className="text-muted-foreground hover:text-foreground transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" aria-label="LinkedIn" className="text-muted-foreground hover:text-foreground transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>

            {/* Copyright */}
            <div className="text-center md:text-right">
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} OpenMart. All rights reserved.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                FSSAI License No: 11224999000872
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
