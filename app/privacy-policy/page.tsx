"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const PrivacyPolicyPage = () => {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back(); // Go back to previous page
    } else {
      router.push("/"); // fallback to home if no history
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 md:px-16 py-20 font-[Poppins]">
      {/* Header */}
      <header className="border-b border-neutral-800 pb-6 mb-10 flex items-center justify-between relative pt-12">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-700 text-neutral-300 text-sm font-medium transition-all hover:border-[#E2791D] hover:text-[#E2791D] hover:bg-[#E2791D]/10 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Title - absolutely centered */}
        <div className="absolute left-1/2 -translate-x-1/2 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white whitespace-nowrap">
            Privacy Policy
          </h1>
          <p className="text-neutral-400 text-xs md:text-sm mt-2 font-medium">
            Alchemy Holding Pvt. Ltd. | Effective Date: August 5, 2025
          </p>
        </div>
      </header>

      {/* Intro */}
      <section className="bg-neutral-900 border-l-4 border-[#E2791D] rounded-r-lg p-6 mb-10">
        <p className="text-neutral-300 leading-relaxed text-base">
          Welcome to{" "}
          <span className="font-semibold text-white">
            Alchemy Holding Pvt. Ltd
          </span>
          . We value your privacy and are committed to protecting your personal
          information. This Privacy Policy outlines how we collect, use, and
          protect the data you provide to us.
        </p>
      </section>

      {/* Sections */}
      <div className="space-y-10 max-w-4xl mx-auto">
        {[
          "Information We Collect",
          "How We Use Your Information",
          "Sharing Your Information",
          "Data Security",
          "Your Rights",
          "Ownership of Content",
          "Third-Party Links",
          "Changes to This Policy",
          "Contact Information",
        ].map((title, index) => (
          <section key={index} className="border-b border-neutral-800 pb-8">
            <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center text-white">
              <span className="min-w-[2.25rem] h-9 bg-[#E2791D] text-black rounded-full flex items-center justify-center mr-4 text-sm font-bold">
                {index + 1}
              </span>
              {title}
            </h2>
            <div className="ml-0 md:ml-12 text-neutral-300 leading-relaxed space-y-4 text-sm">
              <p>{getSectionContent(index)}</p>
            </div>
          </section>
        ))}
      </div>

      {/* Contact */}
      <section className="bg-neutral-900 rounded-lg p-6 border border-neutral-800 mt-12 max-w-3xl mx-auto">
        <p className="text-neutral-300 mb-4">
          If you have any questions, concerns, or requests regarding this
          Privacy Policy or our data practices, please contact us at:
        </p>
        <div className="space-y-3 bg-black p-4 rounded border border-neutral-800">
          <p>
            <strong className="text-[#E2791D]">Email:</strong> hello@alchemy.lk
          </p>
          <p>
            <strong className="text-[#E2791D]">Address:</strong> 43/5,
            Senanayake Mawatha, Sri Jayawardenepura Kotte, Sri Lanka
          </p>
        </div>
      </section>
    </div>
  );
};

// Utility for section content
function getSectionContent(index: number) {
  const content = [
    "We may collect personal data you provide voluntarily, such as your name, email, and browsing activity.",
    "To improve our services, respond to your inquiries, and maintain website performance.",
    "Only with trusted service providers or if required by law.",
    "We implement standard security measures, but no system is completely secure.",
    "You have rights to access, correct, or delete your personal data. Contact us to exercise these rights.",
    "All website content is owned by Alchemy Holding Pvt. Ltd and is protected by law.",
    "We are not responsible for privacy practices of external websites linked from ours.",
    "This policy may be updated from time to time. Please check back periodically.",
    "See below for how to contact us regarding this policy.",
  ];
  return content[index] || "";
}

export default PrivacyPolicyPage;
