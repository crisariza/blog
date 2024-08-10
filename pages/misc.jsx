import Head from "next/head";

import MiscPage from "../components/miscPage";
import SideBar from "../components/sideBar";
import Footer from "../components/footer";

export default function Blog() {
  return (
    <div className="max-w-screen-md m-auto sm:p-0 sm:mt-20">
      <Head>
        <title>Cristian Ariza - Software Engineer</title>
      </Head>
      <div className="flex justify-center">
        <SideBar></SideBar> <MiscPage></MiscPage>
      </div>
      <Footer></Footer>
    </div>
  );
}
