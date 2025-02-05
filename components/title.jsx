export default function Title({ text, size }) {
  return (
    <h1
      className={`${
        size === "small"
          ? "text-md md:text-lg text-neutral-300"
          : "text-lg md:text-xl text-neutral-200"
      } font-semibold md:leading-none mb-6 text-left`}
    >
      {text}
    </h1>
  );
}
