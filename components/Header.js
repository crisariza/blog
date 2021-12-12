import Link from "next/link";

export default function Header() {
  return (
    <header>
      <div className="text-white text-xl flex justify-between">
        <div>
          {" "}
          <Link href="/" passHref>
            <a>Blog</a>
          </Link>
        </div>
        <div className="flex">
          <Link href="/">
            <a className="mr-4">Placeholder 1</a>
          </Link>
          <Link href="/">
            <a>Placeholder 2</a>
          </Link>
        </div>
      </div>
    </header>
  );
}
