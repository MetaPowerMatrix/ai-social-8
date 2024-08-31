/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  reactStrictMode: true,
  transpilePackages: ['gsap', 'gsap/MotionPathPlugin', '@ant-design/icons-svg', '@ant-design/icons', 'antd', 'rc-util', 'rc-pagination', 'rc-picker'],
  images: {
    unoptimized: true,
    // loader: 'custom',
    // loaderFile: './image-loader.ts',
  },
  // i18n: {
  //   locales: ['en-US', 'zh-CN'],
  //   defaultLocale: 'zh-CN',
  //   localeDetection: false
  // },
};

export default nextConfig;
