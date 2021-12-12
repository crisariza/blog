import Header from "../components/Header";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <div className="bg-gray-900">
      <div className="max-w-screen-xl m-auto p-4 ">
        <Header />
        <Component {...pageProps} />
      </div>
    </div>
  );
}

export default MyApp;
