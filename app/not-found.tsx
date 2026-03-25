import { Metadata } from "next";
import NotFoundContent from "@/components/not-found-content";

export const metadata: Metadata = {
  title: "Not Found - Cristian Ariza",
  description: "The page you're looking for doesn't exist.",
};

export default function NotFound() {
  return <NotFoundContent />;
}
