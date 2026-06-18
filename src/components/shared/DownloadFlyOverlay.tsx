import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { NupulIcon } from "../icons";

type FlyPoint = { x: number; y: number };

export function DownloadFlyOverlay({
  fly,
  onComplete,
}: {
  fly: { from: FlyPoint; to: FlyPoint } | null;
  onComplete: () => void;
}) {
  return (
    <AnimatePresence>
      {fly && (
        <motion.div
          key={`${fly.from.x}-${fly.from.y}`}
          className="fixed z-[220] pointer-events-none"
          initial={{
            left: fly.from.x,
            top: fly.from.y,
            scale: 1,
            opacity: 1,
          }}
          animate={{
            left: fly.to.x,
            top: fly.to.y,
            scale: 0.45,
            opacity: 0.15,
          }}
          exit={{ opacity: 0, scale: 0.2 }}
          transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
          onAnimationComplete={onComplete}
          style={{ translate: "-50% -50%" }}
        >
          <div className="flex items-center justify-center w-11 h-11 rounded-full bg-nupul-green text-white border-2 border-nupul-dark">
            <NupulIcon name="cloud" size="md" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
