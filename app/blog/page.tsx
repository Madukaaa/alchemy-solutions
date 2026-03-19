import GeneralHero from "@/components/homeComponents/GeneralHero";
import BlogPostList from "@/components/blogComponents/BlogPostList";

export default function BlogPage() {
  return (
    <>
      <GeneralHero
        line1="Latest"
        line2="Insights"
        line3="Shared"
        subtitle="Thoughts & Innovations"
        showTextSection={true}
      />
      <div className="min-h-screen">
        <BlogPostList />
      </div>
    </>
  );
}
