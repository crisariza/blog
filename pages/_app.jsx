import "../styles/globals.css";
import { GeistMono } from "geist/font/mono";

function MyApp({ Component, pageProps }) {
  return (
    <main className={GeistMono.className}>
      <Component {...pageProps} />
    </main>
  );
}

export default MyApp;
