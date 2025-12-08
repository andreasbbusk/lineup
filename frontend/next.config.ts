import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.alleycat.org',
        
      },
      {
        protocol: 'https',
        hostname: 'images.squarespace-cdn.com',
      },
      {
        protocol: 'https',
        hostname: 'img.av-connection.com',
      },
      {
        protocol: 'https',
        hostname: 'www.elworks.dk',
      },
      {
        protocol: 'https',
        hostname: 'hskjalmp.dk',
      },
      {
        protocol: 'https',
        hostname: 'dyreportal.dk',
      },
      {
        protocol: 'https',
        hostname: 'akamai.vgc.no',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },{
        protocol: 'https',
        hostname: 'cdn-p.smehost.net',
      },{
        protocol: 'https',
        hostname: 'i.scdn.co',
      },
      {
        protocol: 'https',
        hostname: 'scontent-cph2-1.xx.fbcdn.net',
      }

    ],
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
