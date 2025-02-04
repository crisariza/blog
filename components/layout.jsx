import Head from "next/head";
import TopBar from "./top-bar";

export default function Layout({ children }) {
  return (
    <div>
      <Head>
        <title>Cristian Ariza - Software Engineer</title>{" "}
        <meta
          name="description"
          content={`Cristian Ariza - Software Engineer at Accenture and Club Lanús.`}
        />
      </Head>
      <div className="max-w-screen-sm m-6 sm:m-auto sm:p-0 sm:mt-5">
        <TopBar />
        {children}
      </div>
    </div>
  );
}
