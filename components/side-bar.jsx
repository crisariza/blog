import Link from "next/link";

import { usePathname } from "next/navigation";

export default function SideBar() {
  const pathname = usePathname();

  return (
    <nav className="mr-16 mb-6 sm:mb-0">
      <h1 className="text-3xl font-semibold mb-4">Cristian Ariza</h1>
      <ul className="flex flex-wrap justify-between sm:block">
        <li className="mb-2">
          <Link
            href="/"
            className={
              pathname === "/"
                ? "font-bold"
                : "underline decoration-yellow-300 underline-offset-4"
            }
          >
            About
          </Link>
        </li>
        <li className="mb-2">
          <Link
            href="/blog"
            className={
              pathname === "/blog"
                ? "font-bold"
                : "underline decoration-yellow-300 underline-offset-4"
            }
          >
            Blog
          </Link>
        </li>
        <li className="mb-2">
          <Link
            href="/Cristian Ariza - Resume.pdf"
            className={
              pathname === "/Cristian Ariza - Resume.pdf"
                ? "font-bold"
                : "underline decoration-yellow-300 underline-offset-4"
            }
          >
            Resume
          </Link>
        </li>

        <li className="mb-2">
          <Link
            href="/#contact"
            className={
              pathname === "#contact"
                ? "font-bold"
                : "underline decoration-yellow-300 underline-offset-4"
            }
          >
            Contact
          </Link>
        </li>
      </ul>
    </nav>
  );
}
