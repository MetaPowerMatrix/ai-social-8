/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@ant-design/icons-svg', '@ant-design/icons', 'antd', 'rc-util', 'rc-pagination', 'rc-picker'],
};

export default nextConfig;
