import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable external packages for server components
  serverExternalPackages: ['groq-sdk', 'openai', 'pdf-parse', 'mammoth'],

  // ESLint configuration for build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Webpack configuration for PDF.js (removing tiktoken WebAssembly for now)
  webpack: (config) => {
    // Handle PDF.js worker files
    config.resolve.alias = {
      ...config.resolve.alias,
      'pdfjs-dist/build/pdf.worker.entry': 'pdfjs-dist/build/pdf.worker.mjs',
    };

    config.module.rules.push({
      test: /\.m?js$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    });

    return config;
  },

  // Headers for CORS and security
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },

  // Images configuration for potential future use
  images: {
    domains: ['localhost'],
  },
};

export default nextConfig;
