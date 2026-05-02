/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // we transpile our local logging-middleware package since it ships TS-built esm
  transpilePackages: ["logging-middleware"],
};

module.exports = nextConfig;
