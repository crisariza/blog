import Link from "next/link";

const Intro = () => {
  return (
    <section className="border-b border-gray-400 mt-6 mb-6 pb-6">
      <p>
        Hi, I'm Sir Danny! Just like you, I have multiple goals that I'm working
        on :p
        <br /> <br />
        At the moment, I am not currently building anything. I'm working at a
        multinational company, earning approximately $700/month in Argentine
        Pesos, and going to college 5x a week.
        <br /> <br />
        Let me tell you about some things I want to achieve in the near future:
        launching a product or service, graduating from college, traveling the
        world, increasing my income, and many more.
      </p>
      <br />
      <p>
        Current Revenue: $700 ·{" "}
        <Link href="/finance" className="underline">
          Finance Stats
        </Link>
      </p>
    </section>
  );
};

export default Intro;
