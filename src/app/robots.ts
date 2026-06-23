import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/client/', '/creator/'],
    },
    sitemap: 'https://malixa.dz/sitemap.xml',
  }
}
