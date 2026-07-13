/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Product/hero/gallery photography is served locally (/media, /products) in
    // dev and from Cloudinary in production. Allow the Cloudinary CDN host so
    // next/image can optimize admin-uploaded photos once CLOUDINARY_URL is set.
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
