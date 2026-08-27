/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  allowedDevOrigins: [
    "localhost:3000",
    "*.proxy.googlers.com",
    "*.c.googlers.com"
  ]
};

export default nextConfig;
