import Head from "next/head";
import TopBar from "./top-bar";
import Footer from "./footer";
import { useRouter } from "next/router";

export default function Layout({
  children,
  title,
  description = "Cristian Ariza - Product Engineer",
  image = "/images/default-og-image.jpg",
  url,
}) {
  const router = useRouter();
  const pageUrl =
    url || `${process.env.NEXT_PUBLIC_SITE_URL || ""}${router.asPath}`;
  const pageTitle = `Cristian Ariza${title ? ` - ${title}` : " - Product Engineer"}`;

  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={description} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />
        <meta property="og:url" content={pageUrl} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />
        <meta name="twitter:url" content={pageUrl} />

        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          rel="canonical"
          href={
            process.env.NEXT_PUBLIC_SITE_URL
              ? `${process.env.NEXT_PUBLIC_SITE_URL}${router.asPath}`
              : pageUrl
          }
        />
      </Head>
      <main className="flex-grow flex flex-col">
        <div className="max-w-screen-sm w-full px-6 mt-8 mb-8 sm:my-8 mx-auto flex flex-col flex-grow">
          {" "}
          <TopBar />
          <div className="flex-grow my-24">{children}</div>
          <Footer />
        </div>
      </main>
    </div>
  );
}
