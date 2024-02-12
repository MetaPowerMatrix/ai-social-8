/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
  distDir: 'dist',
  reactStrictMode: true,
  transpilePackages: ['@ant-design/icons-svg', '@ant-design/icons', 'antd', 'rc-util', 'rc-pagination', 'rc-picker'],
  images: {
    unoptimized: true,
    // loader: 'custom',
    // loaderFile: './image-loader.ts',
  },
};

export default nextConfig;
