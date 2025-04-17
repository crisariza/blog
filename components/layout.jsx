"use client";

import TopBar from "./top-bar";
import Footer from "./footer";

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow flex flex-col">
        <div className="max-w-screen-sm w-full px-6 mt-8 mb-8 sm:my-8 mx-auto flex flex-col flex-grow">
          <TopBar />
          <div className="flex-grow my-24">{children}</div>
          <Footer />
        </div>
      </main>
    </div>
  );
}
