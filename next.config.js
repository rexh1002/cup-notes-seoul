/** @type {import('next').NextConfig} */
const nextConfig = {
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
}

module.exports = nextConfig;