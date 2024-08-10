import Container from "./container";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <Container>
      <footer className="border-t border-gray-400">
        <div className="py-8 flex flex-col lg:flex-row items-center">
          <h3 className="font-bold text-center lg:text-left mb-10 lg:mb-0 lg:pr-4 lg:w-1/2">
            © Cristian Ariza {year}
          </h3>

          <p className="font-bold text-center lg:text-right mb-10 lg:mb-0 lg:pr-4 lg:w-1/2">
            With ❤ from Buenos Aires
          </p>
        </div>
      </footer>{" "}
    </Container>
  );
};

export default Footer;
