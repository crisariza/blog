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
      <div className="mb-8">
        <div className="flex flex-col md:flex-row items-start gap-6 mb-6">
          <div className="flex-1 flex flex-col gap-6 order-2 md:order-1">
            <p>
              Hey! I'm Cris, a software engineer originally from Lanús, Buenos
              Aires, Argentina.
            </p>
            <p>
              Since I was a kid, I've been fascinated by computers. I got my
              first one at five years old, and as I grew up, I started playing
              around with hardware and eventually writing software.
            </p>
          </div>
          <div className="w-36 flex-shrink-0 order-1 md:order-2 self-center md:self-start">
            <Image
              src={profilePic}
              alt="Cristian Ariza Picture"
              className="rounded-full"
              priority={true}
            />
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <p>
            When I was 16, I started studying at the University of Buenos Aires
            while still in high school. Back then, I thought Business
            Administration was the right path for me, but after finishing high
            school, I realized I was far more interested in technology. So I
            decided to switch my major to Computer Science.
          </p>
          <p>
            At 18, I dropped out and joined the coding bootcamp{" "}
            <Link
              target="_blank"
              href="https://soyhenry.com"
              className="underline decoration-gray-600 underline-offset-4"
            >
              Henry
            </Link>
            . Just three weeks later, I landed my first job as a software
            engineer at{" "}
            <Link
              target="_blank"
              href="https://accenture.com"
              className="underline decoration-gray-600 underline-offset-4"
            >
              Accenture
            </Link>
            , where I’ve been working ever since.
          </p>
          <p>
            Since then, I’ve worked on a wide range of projects, from small
            startups to large-scale enterprise systems. Every project has taught
            me something new, and I’m still learning every single day.
          </p>
          <p>
            In 2024, I met Club Lanús president Luis Chebel and began
            collaborating with the club on its digital transformation
            initiatives. Some of the projects I’ve built include{" "}
            <Link
              target="_blank"
              href="https://museogranate.com"
              className="underline decoration-gray-600 underline-offset-4"
            >
              Museo Granate
            </Link>
            , the{" "}
            <Link
              target="_blank"
              href="https://clublanus.help.center/"
              className="underline decoration-gray-600 underline-offset-4"
            >
              Club Lanús Help Center
            </Link>
            , and the{" "}
            <Link
              target="_blank"
              href="https://api.whatsapp.com/send/?phone=%2B5491128420065&text&type=phone_number&app_absent=0"
              className="underline decoration-gray-600 underline-offset-4"
            >
              WhatsApp chatbot
            </Link>
            , which handles over 10,000 messages per month and helps fans with
            their questions.
          </p>
        </div>
      </div>
    </div>
  );
}
