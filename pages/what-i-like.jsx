import WhatILikePage from "../components/whatILikePage";
import SideBar from "../components/sideBar";

export default function Blog() {
  return (
    <div className="max-w-screen-md m-auto sm:p-0 sm:mt-20">
      <div className="flex justify-center">
        <SideBar></SideBar> <WhatILikePage></WhatILikePage>
      </div>
      <footer className="flex justify-center mt-20 text-neutral-500	">
        <p>Copyright © 2024 Cristian Ariza. All rights reserved.</p>
      </footer>
    </div>
  );
}
