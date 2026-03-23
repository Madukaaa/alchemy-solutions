"use client";

import CareerCard from "./CareerCard";

const CareersSection = () => {
  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-7xl mx-auto py-20 px-4">

        {/* Section Title */}
        <h2 className="text-brand text-3xl font-bold mb-8 text-center">
          Available Positions
        </h2>

        {/* Cards Grid */}
        <CareerCard />

      </div>
    </div>
  );
};

export default CareersSection;
