import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div >
      <div class="flex justify-center">
        <nav><h1>Cristian Ariza</h1>
          <ul>

            <li><Link href="/about">About</Link></li>
            <li><Link href="/blog">Blog</Link></li>
            <li><Link href="/misc">Misc</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </nav>
        <main>
          <div class="flex justify-center">
            <Image src="/profilePic.png" alt="Thorsten Ball" width={200} height={200} />
            <div>
              <p>Hello! I'm Cristian.</p>
              <br />

              <p>I work remotely as a software engineer for <a href="https://accenture.com">Accenture</a>. Before that I did a Coding Bootcamp at <a href="https://soyhenry.com">Henry</a>.</p>
              <br />
              <p>I wrote and self-published two books you might have heard of.</p>
            </div>
          </div>

          <p>You can also find me on <a href="https://github.com/crisariza">Github</a> and <a href="https://linkedin.com/in/crisariza">LinkedIn</a>.</p>

          <h2>Contact</h2>
          Never hesitate to send me an email at me@crisariza.com. I love getting email from you.
        </main>
      </div>

      <footer class="flex justify-center">
        <p>Copyright © 2024 Cristian Ariza. All rights reserved.</p>
      </footer>
    </div>
  );
}