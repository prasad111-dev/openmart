import { useEffect } from 'react'

interface SeoParams {
  title?: string
  description?: string
  keywords?: string
  image?: string
  noIndex?: boolean
}

export function useSeo({ title, description, keywords, image, noIndex }: SeoParams = {}) {
  useEffect(() => {
    if (title) {
      document.title = title.includes('OpenMart') ? title : `${title} | OpenMart`
    }
    
    const updateMeta = (name: string, content: string, isProperty = false) => {
      const meta = document.querySelector(isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`) as HTMLMetaElement | null
      if (meta) {
        meta.setAttribute('content', content)
      } else {
        const newMeta = document.createElement('meta')
        if (isProperty) {
          newMeta.setAttribute('property', name)
        } else {
          newMeta.setAttribute('name', name)
        }
        newMeta.setAttribute('content', content)
        document.head.appendChild(newMeta)
      }
    }

    if (description) {
      updateMeta('description', description)
      updateMeta('og:description', description, true)
    }

    if (keywords) {
      updateMeta('keywords', keywords)
    }

    if (title) {
      updateMeta('og:title', title, true)
    }

    if (image) {
      updateMeta('og:image', image, true)
    }

    if (noIndex) {
      updateMeta('robots', 'noindex, nofollow')
    }
  }, [title, description, keywords, image, noIndex])
}
