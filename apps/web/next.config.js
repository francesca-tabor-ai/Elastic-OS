/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@elastic-os/db", "@elastic-os/shared", "@elastic-os/auth"],
};

module.exports = nextConfig;
