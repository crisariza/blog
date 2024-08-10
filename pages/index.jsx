import About from "../components/about";
import SideBar from "../components/sideBar";

export default function Home() {
  return (
    <div className="max-w-screen-md m-auto sm:p-0 sm:mt-20">
      <div className="flex justify-center">
        <SideBar></SideBar> <About></About>
      </div>
      <footer className="flex justify-center mt-20 text-neutral-500	">
        <p>Copyright © 2024 Cristian Ariza. All rights reserved.</p>
      </footer>
    </div>
  );
}
