import Footer from "../footer";
import Meta from "./meta";

const Layout = ({ preview, children }) => {
  return (
    <div className="md:min-h-screen md:flex md:flex-col md:justify-between">
      <Meta />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
