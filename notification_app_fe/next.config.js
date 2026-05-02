/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // we transpile our local logging-middleware package since it ships TS-built esm
  transpilePackages: ["logging-middleware"],

  // proxy the test server so the browser doesn't hit cors
  // /api/eval/<anything> -> http://20.207.122.201/evaluation-service/<anything>
  async rewrites() {
    return [
      {
        source: "/api/eval/:path*",
        destination: "http://20.207.122.201/evaluation-service/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
