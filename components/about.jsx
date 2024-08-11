import Link from "next/link";
import Image from "next/image";
import profilePic from "../public/profilePic.png";

export default function About() {
  return (
    <div>
      <div className="mb-8">
        <div className="w-2/5 sm:w-1/4 mr-6 sm:mr-8 float-left">
          <Image
            src={profilePic}
            alt="Cristian Ariza Picture"
            className="rounded-md float-left	"
            priority={true}
          />
        </div>
        <div>
          <div className="mb-12 sm:mb-0">
            {" "}
            <p className="mb-4">Hello! I'm Cristian.</p>
            <p>
              I work remotely as a software engineer for{" "}
              <Link
                href="https://accenture.com"
                className="underline decoration-yellow-300 underline-offset-4"
              >
                Accenture
              </Link>
              .
            </p>
          </div>

          <div>
            {" "}
            <p className="mb-2">
              {" "}
              Before that I did a Coding Bootcamp at{" "}
              <Link
                href="https://soyhenry.com"
                className="underline decoration-yellow-300 underline-offset-4"
              >
                Henry
              </Link>
              .
            </p>
            <p>
              Excited about new businessss, startups, AI, crypto and
              cutting-edge tech.
            </p>
          </div>
        </div>
      </div>
      <div id="contact">
        <h2 className="text-xl font-bold mb-2">Contact</h2>
        <p className="mb-1">
          {" "}
          Never hesitate to send me an email at{" "}
          <Link
            href="mailto:me@crisariza.com"
            className="underline decoration-yellow-300 underline-offset-4"
          >
            me@crisariza.com
          </Link>
          . I love getting email from you.
        </p>

        <p className="mt-4">
          You can also find me on{" "}
          <Link
            href="https://github.com/crisariza"
            className="underline decoration-yellow-300 underline-offset-4"
          >
            Github
          </Link>{" "}
          and{" "}
          <Link
            href="https://linkedin.com/in/crisariza"
            className="underline decoration-yellow-300 underline-offset-4"
          >
            LinkedIn
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
