import type { NextConfig } from "next";

/** Where the West Quest backend API (Node + MariaDB) listens. The browser only
 *  ever talks to this site's own `/api/*`; Next forwards those calls here, so
 *  the admin session cookie stays same-origin. Set the backend's PUBLIC_URL to
 *  this site's URL so photo URLs resolve through the `/images` forward below. */
const BACKEND_URL = process.env.BACKEND_URL ?? "http://127.0.0.1:4000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` },
      // Product photos from the image library are served by the backend too.
      { source: "/images/:path*", destination: `${BACKEND_URL}/images/:path*` },
    ];
  },
};

export default nextConfig;
