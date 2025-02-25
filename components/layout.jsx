import Head from "next/head";
import TopBar from "./top-bar";
import Footer from "./footer";

export default function Layout({ children, title }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>
          {`Cristian Ariza ${title ? `- ${title}` : "- Product Engineer"}`}
        </title>
        <meta
          name="description"
          content={`Cristian Ariza - Product Engineer`}
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
