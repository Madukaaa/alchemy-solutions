import GeneralHero from "@/components/homeComponents/GeneralHero";

export default function ContactPage() {
  return (
    <>
      <GeneralHero
        line1="Connect"
        line2="With"
        line3="Our Team"
        subtitle="We're Here to Help"
        showTextSection={true}
      />
      <div className="min-h-screen p-8 sm:p-20">
        <h1 className="text-4xl font-bold mb-4">Contact</h1>
        <p className="text-lg">Welcome to the Contact page.</p>
      </div>
    </>
  );
}
