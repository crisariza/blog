import Head from "next/head";

import About from "../components/about";
import SideBar from "../components/sideBar";
import Footer from "../components/footer";

export default function Home() {
  return (
    <div className="max-w-screen-md m-6 sm:m-auto sm:p-0 sm:mt-20">
      <Head>
        <title>Cristian Ariza - Software Engineer</title>
      </Head>
      <div className="sm:flex sm:justify-center">
        <SideBar></SideBar> <About></About>
      </div>
      <Footer></Footer>
    </div>
  );
}
