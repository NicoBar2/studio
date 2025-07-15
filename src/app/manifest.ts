
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Galápagos DataLens',
    short_name: 'DataLens',
    description: 'Visualiza y edita datos estadísticos de las especies de Galápagos.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ECF0F1', // Corresponds to light gray background
    theme_color: '#3498DB', // Corresponds to primary blue
    icons: [
      {
        src: '/android-chrome-192x192.png', // Placeholder, ensure these exist if uncommented
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png', // Placeholder
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
