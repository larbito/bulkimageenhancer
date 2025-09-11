/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**', pathname: '/**' }
    ]
  },
  output: 'standalone'
}

module.exports = nextConfig

