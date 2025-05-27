/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    KAKAO_API_KEY: process.env.KAKAO_API_KEY,
  },
  images: {
    domains: ['cdn.nec.go.kr', 'www.nec.go.kr'],
  },
};

module.exports = nextConfig; 