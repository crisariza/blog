/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/projects/museo-granate",
        destination: "/projects/estadisticas",
        permanent: true,
      },
      {
        source: "/projects/football-head",
        destination: "/projects",
        permanent: true,
      },
      {
        source: "/blog",
        destination: "/",
        permanent: true,
      },
      {
        source: "/blog/:slug*",
        destination: "/",
        permanent: true,
      },
      {
        source: "/wpp",
        destination: "https://api.whatsapp.com/send?phone=541123885841",
        permanent: true,
      },
      {
        source: "/fiancee",
        destination: "https://www.instagram.com/agust6na/",
        permanent: true,
      },
      {
        source: "/meet",
        destination: "https://cal.com/crisariza/intro",
        permanent: true,
      },
      {
        source: "/Cristian Ariza - Resume.pdf",
        destination: "/resume",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
