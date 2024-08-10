import Link from "next/link";

const Header = () => {
  return (
    <section className="flex-col md:flex-row flex items-center md:justify-between mt-6 mb-6">
      <h1 className="font-extrabold text-transparent text-3xl bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        <Link href="/" className="hover:underline">
          Cristian Ariza.
        </Link>
      </h1>
    </section>
  );
};

export default Header;
