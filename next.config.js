/** @type {import('next').NextConfig} */
const nextConfig = {
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
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;