import WhatILikePage from "../components/whatILikePage";
import SideBar from "../components/sideBar";
import Footer from "../components/footer";

export default function Blog() {
  return (
    <div className="max-w-screen-md m-auto sm:p-0 sm:mt-20">
      <div className="flex justify-center">
        <SideBar></SideBar> <WhatILikePage></WhatILikePage>
      </div>
      <Footer></Footer>
    </div>
  );
}
