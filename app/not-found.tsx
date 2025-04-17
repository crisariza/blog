import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Not Found - Cristian Ariza",
  description: "The page you're looking for doesn't exist.",
};

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Not Found</h2>
      <p>Could not find requested resource</p>
    </div>
  );
}
