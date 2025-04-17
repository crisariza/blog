import Link from "next/link";
import Image from "next/image";
import profilePic from "@/public/profilePic.png";
import Title from "@/components/title";

export const metadata = {
  title: "About - Cristian Ariza",
  description:
    "Learn more about Cristian Ariza, a Software Engineer with experience in front-end and back-end development.",
};

export default function AboutPage() {
  return (
    <div>
      <Title text="About" />
      <div className="mb-8 flex flex-col-reverse md:flex-row items-start">
        <div className="flex-1 gap-6 flex flex-col pr-8">
          <p>
            I'm a software engineer. I work full-time at{" "}
            <Link
              target="_blank"
              href="https://accenture.com"
              className="underline decoration-gray-600 underline-offset-4"
            >
              Accenture
            </Link>{" "}
            and I do some side projects at{" "}
            <Link
              target="_blank"
              href="https://clublanus.com"
              className="underline decoration-gray-600 underline-offset-4"
            >
              Club Lanús
            </Link>{" "}
            like{" "}
            <Link
              target="_blank"
              href="https://museogranate.com"
              className="underline decoration-gray-600 underline-offset-4"
            >
              Museo Granate
            </Link>
            .
          </p>
          <p>
            {" "}
            My developer journey started with a Coding Bootcamp at{" "}
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
