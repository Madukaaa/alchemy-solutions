import GeneralHero from "@/components/homeComponents/GeneralHero";

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
      <div className="min-h-screen p-8 sm:p-20">
        <h1 className="text-4xl font-bold mb-4">Blog</h1>
        <p className="text-lg">Welcome to the Blog page.</p>
      </div>
    </>
  );
}
