/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  allowedDevOrigins: [
    "localhost:3000",
    "127.0.0.1:3000",
    "localhost",
    "127.0.0.1",
    "*.proxy.googlers.com",
    "*.c.googlers.com"
  ],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          {
            key: "X-Frame-Options",
            value: "DENY"
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block"
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          }
        ]
      },
      {
        source: "/manifest.json",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, must-revalidate"
          }
        ]
      },
      {
        source: "/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable"
          },
          {
            key: "Accept-Ranges",
            value: "bytes"
          }
        ]
      },
      {
        source: "/api/reels/video/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800"
          },
          {
            key: "Accept-Ranges",
            value: "bytes"
          }
        ]
      }
    ];
  },
  async redirects() {
    return [
      {
        source: "/studio/:path*",
        destination: "/#hero-director",
        permanent: false
      },
      {
        source: "/studio",
        destination: "/#hero-director",
        permanent: false
      },
      {
        source: "/studio1/:path*",
        destination: "/#hero-director",
        permanent: false
      },
      {
        source: "/studio1",
        destination: "/#hero-director",
        permanent: false
      },
      {
        source: "/studio2/:path*",
        destination: "/#hero-director",
        permanent: false
      },
      {
        source: "/studio2",
        destination: "/#hero-director",
        permanent: false
      },
      {
        source: "/studio3/:path*",
        destination: "/#hero-director",
        permanent: false
      },
      {
        source: "/studio3",
        destination: "/#hero-director",
        permanent: false
      },
      {
        source: "/director",
        destination: "/#hero-director",
        permanent: false
      },
      {
        source: "/creator/:path*",
        destination: "/#genres",
        permanent: false
      },
      {
        source: "/creator",
        destination: "/#genres",
        permanent: false
      },
      {
        source: "/governance/:path*",
        destination: "/#architecture",
        permanent: false
      },
      {
        source: "/governance",
        destination: "/#architecture",
        permanent: false
      },
      {
        source: "/veritas",
        destination: "/#architecture",
        permanent: false
      },
      {
        source: "/admin/:path*",
        destination: "/#top",
        permanent: false
      },
      {
        source: "/admin",
        destination: "/#top",
        permanent: false
      },
      {
        source: "/dashboard",
        destination: "/#architecture",
        permanent: false
      },
      {
        source: "/analytics/:path*",
        destination: "/#architecture",
        permanent: false
      },
      {
        source: "/artifact/:path*",
        destination: "/#master-showcase",
        permanent: false
      },
      {
        source: "/nda/:path*",
        destination: "/#waitlist",
        permanent: false
      },
      {
        source: "/auth/:path*",
        destination: "/#waitlist",
        permanent: false
      }
    ];
  }
};

export default nextConfig;
