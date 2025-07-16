/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  async rewrites() {
    return [
      {
        source: '/map-geocode/:path*',
        destination: 'https://naveropenapi.apigw.ntruss.com/map-geocode/v2/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/map-geocode/:path*',
        headers: [
          {
            key: 'X-NCP-APIGW-API-KEY-ID',
            value: 'sn5m2djclr',
          },
          {
            key: 'X-NCP-APIGW-API-KEY',
            value: 'kAP8qe4GdjjsK3k5jPsyr02UoQXf0NwczMQSvL9U',
          },
        ],
      },
    ];
  },
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        cacheGroups: {
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      };
    }
    return config;
  },
}

module.exports = nextConfig;