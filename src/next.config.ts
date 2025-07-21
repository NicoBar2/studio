
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // This is to solve the 'fs' module not found error from 'fontkit' which is a dependency of 'pdfkit'.
    // We are telling Webpack to not resolve 'fs' module on the client side.
    if (!isServer) {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
        };
    }
    
    // This handles a similar issue with canvas, another optional dependency for pdfkit
    config.externals.push({
      canvas: 'canvas',
    });

    return config;
  },
};

export default nextConfig;
