/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cms.huanyukuntaichem.com'
      }
    ]
  }
};

export default nextConfig;
