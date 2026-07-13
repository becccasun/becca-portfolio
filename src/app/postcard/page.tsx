import type { Metadata } from "next";
import PostcardComposer from "@/components/postcards/PostcardComposer";

export const metadata: Metadata = {
  title: "Leave a postcard",
  description: "Design a postcard and send it into the stream.",
};

export default function PostcardPage() {
  return <PostcardComposer />;
}
