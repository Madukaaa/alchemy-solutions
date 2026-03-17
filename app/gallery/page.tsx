import GeneralHero from "@/components/homeComponents/GeneralHero";

export default function GalleryPage() {
  return (
    <>
      <GeneralHero
        line1="Creative"
        line2="Moments"
        line3="Captured"
        subtitle="Our Visual Storytelling"
        showTextSection={true}
      />
      <div className="min-h-screen p-8 sm:p-20">
        <h1 className="text-4xl font-bold mb-4">Gallery</h1>
        <p className="text-lg">Welcome to the Gallery page.</p>
      </div>
    </>
  );
}
