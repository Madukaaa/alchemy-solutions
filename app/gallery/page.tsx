import GeneralHero from "@/components/homeComponents/GeneralHero";
import GenerativeArtGallery from "@/components/galleryComponents/GenerativeArtGallery";

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
      <GenerativeArtGallery />
    </>
  );
}
