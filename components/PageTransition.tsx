"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode, useContext, useRef } from "react";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";

function FrozenRouter({ children }: { children: ReactNode }) {
  const context = useContext(LayoutRouterContext ?? ({} as any));
  const frozen = useRef(context).current;

  if (!frozen) {
    return <>{children}</>;
  }

  return (
    <LayoutRouterContext.Provider value={frozen}>
      {children}
    </LayoutRouterContext.Provider>
  );
}

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const colors = ["#F5A25C", "#E2791D", "#B95416"]; // light, main, dark

  return (
    <AnimatePresence mode="wait">
      <motion.div key={pathname}>
        <FrozenRouter>
          <div className="min-h-[100dvh] relative z-0">{children}</div>
        </FrozenRouter>

        {/* Curtain Close - Rises from the bottom */}
        {colors.map((color, i) => (
          <motion.div
            key={`close-${i}`}
            className="fixed top-0 w-[150vw] left-[-25vw] h-[100vh] z-[9999] pointer-events-none origin-bottom will-change-transform"
            style={{ backgroundColor: color }}
            initial={{ y: "100%", borderTopLeftRadius: "100%", borderTopRightRadius: "100%" }}
            animate={{ y: "100%", borderTopLeftRadius: "100%", borderTopRightRadius: "100%" }}
            exit={{ y: "0%", borderTopLeftRadius: "0%", borderTopRightRadius: "0%" }}
            transition={{
              duration: 0.6,
              delay: i * 0.1,
              ease: [0.83, 0, 0.17, 1],
            }}
          />
        ))}

        {/* Curtain Open - Rises out from the top */}
        {colors.map((color, i) => (
          <motion.div
            key={`open-${i}`}
            className="fixed top-0 w-[150vw] left-[-25vw] h-[100vh] z-[9999] pointer-events-none origin-top will-change-transform"
            style={{ backgroundColor: color }}
            initial={{ y: "0%", borderBottomLeftRadius: "0%", borderBottomRightRadius: "0%" }}
            animate={{ y: "-100%", borderBottomLeftRadius: "100%", borderBottomRightRadius: "100%" }}
            exit={{ y: "-100%", borderBottomLeftRadius: "100%", borderBottomRightRadius: "100%" }}
            transition={{
              duration: 0.5,
              delay: 0.4 + i * 0.1,
              ease: [0.83, 0, 0.17, 1],
            }}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
