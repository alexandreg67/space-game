import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Webpack configuration (for when not using Turbopack)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Prevent canvas dependency issues on client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
      };
    }
    
    // Exclude Konva from server-side rendering
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    
    return config;
  },
  
  // For Turbopack, the webpack configuration above should not interfere
  // since Turbopack doesn't use webpack. The dynamic import with ssr: false
  // in the GameCanvas component should handle SSR issues.
};

export default nextConfig;
