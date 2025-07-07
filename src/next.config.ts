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
    ],
  },
  webpack: (config, { isServer }) => {
    // This tells webpack not to parse the pdf-parse library, preventing it from
    // trying to resolve the library's internal test files.
    config.module.noParse = /pdf-parse/;
    
    // This is to fix an issue with pdf-parse's dependency `node-ensure-async-hooks`.
    if (isServer) {
        config.externals.push('node-ensure-async-hooks');
    }
    return config;
  },
};

export default nextConfig;
