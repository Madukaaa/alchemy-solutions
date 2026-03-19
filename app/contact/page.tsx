import GeneralHero from "@/components/homeComponents/GeneralHero";
import ContactForm from "@/components/contactComponents/ContactForm";

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
      <ContactForm />
    </>
  );
}
