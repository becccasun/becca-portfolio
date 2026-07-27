import type { Metadata } from "next";
import BlogList from "@/components/blog/BlogList";

export const metadata: Metadata = {
  title: "Blogs",
  description: "Writing on design, process, and building things.",
};

export default function BlogsPage() {
  return <BlogList />;
}
