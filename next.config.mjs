import NextBundleAnalyzer from '@next/bundle-analyzer';
import webpack from 'webpack';

const disableChunk = !!process.env.DISABLE_CHUNK;
console.log('[Next] build with chunk: ', !disableChunk);

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    if (disableChunk) {
      config.plugins.push(new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }));
    }

    config.resolve.fallback = {
      child_process: false,
    };

    return config;
  },
  // output: 'standalone',
  experimental: {
    forceSwcTransforms: true,
  },
  headers: async () => [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Credentials', value: 'true' },
        { key: 'Access-Control-Allow-Origin', value: '*' },
        {
          key: 'Access-Control-Allow-Methods',
          value: '*',
        },
        {
          key: 'Access-Control-Allow-Headers',
          value: '*',
        },
        {
          key: 'Access-Control-Max-Age',
          value: '86400',
        },
      ],
    },
  ],
  rewrites: async () => {
    const ret = [
      {
        source: '/api/proxy/:path*',
        destination: 'https://api.openai.com/:path*',
      },
      {
        source: '/google-fonts/:path*',
        destination: 'https://fonts.googleapis.com/:path*',
      },
      {
        source: '/sharegpt',
        destination: 'https://sharegpt.com/api/conversations',
      },
    ];

    const apiUrl = process.env.API_URL;
    if (apiUrl) {
      console.log('[Next] using api url ', apiUrl);
      ret.push({
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,
      });
    }

    return {
      beforeFiles: ret,
    };
  },
};

const withBundleAnalyzer = NextBundleAnalyzer({
  enabled: !!process.env.ANALYZE,
});

export default withBundleAnalyzer(nextConfig);
