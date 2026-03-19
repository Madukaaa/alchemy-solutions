import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/admin-login",
        destination: "/admin/admin-login",
        permanent: false,
      },
      {
        source: "/admin-dashboard",
        destination: "/admin/admin-dashboard",
        permanent: false,
      },
      {
        source: "/mod-login",
        destination: "/admin/mod-login",
        permanent: false,
      },
      {
        source: "/mod-dashboard",
        destination: "/admin/mod-dashboard",
        permanent: false,
      },
      {
        source: "/moderator-login",
        destination: "/admin/mod-login",
        permanent: false,
      },
      {
        source: "/moderator-dashboard",
        destination: "/admin/mod-dashboard",
        permanent: false,
      },
      {
        source: "/blog-admin",
        destination: "/admin/blog-admin",
        permanent: false,
      },
      {
        source: "/gallery-admin",
        destination: "/admin/gallery-admin",
        permanent: false,
      },
      {
        source: "/about-us-admin",
        destination: "/admin/about-us-admin",
        permanent: false,
      },
      {
        source: "/admin",
        destination: "/admin/admin-login",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
