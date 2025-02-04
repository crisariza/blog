import Link from "next/link";
import Image from "next/image";
import profilePic from "../public/profilePic.png";

export default function About() {
  return (
    <div className="mt-10">
      <h1 className="text-xl md:text-2xl font-semibold md:leading-none mb-6 text-left">
        About
      </h1>
      <div className="mb-8 flex flex-col-reverse md:flex-row items-start">
        <div className="flex-1 gap-6 flex flex-col pr-8">
          <p>
            I'm a software engineer at{" "}
            <Link
              target="_blank"
              href="https://accenture.com"
              className="underline decoration-gray-600 underline-offset-4"
            >
              Accenture
            </Link>
            . I'm originally from Lanús, Buenos Aires, Argentina.
          </p>
          <p>
            {" "}
            I do part-time software engineering work at{" "}
            <Link
              target="_blank"
              href="https://clublanus.com"
              className="underline decoration-gray-600 underline-offset-4"
            >
              Club Lanús
            </Link>
            .
          </p>
          <p>
            {" "}
            But my developer journey started with a Coding Bootcamp at{" "}
            <Link
              target="_blank"
              href="https://soyhenry.com"
              className="underline decoration-gray-600 underline-offset-4"
            >
              Henry
            </Link>
            .
          </p>
          <p>
            Excited about new businessss, startups, AI, crypto and cutting-edge
            tech.
          </p>
        </div>
        <div className="w-24 md:w-36 mb-6 md:mb-0">
          <Image
            src={profilePic}
            alt="Cristian Ariza Picture"
            className="rounded-full"
            priority={true}
          />
        </div>
      </div>
    </div>
  );
}
