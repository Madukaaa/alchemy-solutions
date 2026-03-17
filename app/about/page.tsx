import GeneralHero from "@/components/homeComponents/GeneralHero";

export default function AboutUsPage() {
  return (
    <>
      <GeneralHero
        line1="Our Journey"
        line2="Evolves"
        line3="with Purpose"
        subtitle="Crafting Digital Excellence"
        showTextSection={true}
      />
      <div className="min-h-screen p-8 sm:p-20">
        <h1 className="text-4xl font-bold mb-4">About Us</h1>
        <p className="text-lg">Welcome to the About Us page.</p>
      </div>
    </>
  );
}
