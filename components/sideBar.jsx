import Link from "next/link";

import { usePathname } from "next/navigation";

export default function SideBar() {
  const pathname = usePathname();

  console.log(pathname);
  return (
    <nav className="mr-16">
      <h1 className="text-3xl font-semibold mb-4">Cristian Ariza</h1>
      <ul>
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
            href="/what-i-like"
            className={
              pathname === "/what-i-like"
                ? "font-bold"
                : "underline decoration-yellow-300 underline-offset-4"
            }
          >
            What I like
          </Link>
        </li>
        <li className="mb-2">
          <Link
            href="/misc"
            className={
              pathname === "/misc"
                ? "font-bold"
                : "underline decoration-yellow-300 underline-offset-4"
            }
          >
            Misc
          </Link>
        </li>
        <li className="mb-2">
          <Link
            href="#contact"
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
