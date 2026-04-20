import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { useSeo } from '@/hooks/useSeo'
import CategoryCarousel from '@/components/CategoryCarousel'

export default function HomePage() {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  useSeo({
    title: 'OpenMart - Home',
    description: 'Browse local shops and products near you.',
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/home' } })
      return
    }
  }, [isAuthenticated, navigate])

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-background">
      <CategoryCarousel />
    </div>
  )
}
