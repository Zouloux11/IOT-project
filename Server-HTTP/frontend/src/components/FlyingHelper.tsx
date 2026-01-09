import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface FlyingHelperProps {
  targetId: string;
}

export default function FlyingHelper({ targetId }: FlyingHelperProps) {
  const [explosion, setExplosion] = useState(false);
  const [showText, setShowText] = useState(false);
  const [ready, setReady] = useState(false);
  const targetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    targetRef.current = document.getElementById(targetId);

    const timer = setTimeout(() => {
      if (!targetRef.current) return;
      setReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [targetId]);

  useEffect(() => {
    if (!ready || !targetRef.current) return;

    const clickTimer = setTimeout(() => {
      const explosionTimer = setTimeout(() => {
        setExplosion(true);
        setShowText(true);

        const resetTimer = setTimeout(() => {
          setExplosion(false);
          setShowText(false);
        }, 2000);

        return () => clearTimeout(resetTimer);
      }, 300);

      return () => clearTimeout(explosionTimer);
    }, 800);

    return () => clearTimeout(clickTimer);
  }, [ready]);

  // --- Explosion avec projections ---
  const renderExplosionProjections = () => {
    const count = 12;
    const radius = 60;

    return [...Array(count)].map((_, i) => {
      const angle = (i / count) * 2 * Math.PI;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      return (
        <motion.div
          key={`proj-${i}`}
          className="absolute rounded-full"
          style={{
            width: 6,
            height: 6,
            top: "50%",
            left: "50%",
            backgroundColor: i % 3 === 0 ? "#10B981" : i % 3 === 1 ? "#06B6D4" : "#059669",
            filter: "drop-shadow(0 0 4px currentColor)",
          }}
          initial={{ x: -3, y: -3, opacity: 1, scale: 1 }}
          animate={{ x: x - 3, y: y - 3, opacity: 0, scale: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      );
    });
  };

  return (
    <>
      {/* Explosion autour de la cible */}
      <AnimatePresence>
        {explosion && targetRef.current && (() => {
          const rect = targetRef.current.getBoundingClientRect();
          const style = getComputedStyle(targetRef.current);
          const borderRadius = style.borderRadius || "0px";

          return (
            <motion.div
              key="explosion"
              className="fixed pointer-events-none z-40"
              style={{
                top: rect.top - 10,
                left: rect.left - 10,
                width: rect.width + 20,
                height: rect.height + 20,
                borderRadius,
                border: "3px solid #10B981",
                background: "radial-gradient(circle, rgba(16,185,129,0.2) 0%, rgba(6,182,212,0.15) 50%, rgba(5,150,105,0.1) 100%)",
                boxShadow: `
                  0 0 20px #10B981,
                  0 0 40px #06B6D4,
                  0 0 60px #059669,
                  inset 0 0 20px rgba(255,255,255,0.1)
                `,
                pointerEvents: "none",
                position: "fixed",
                overflow: "visible",
              }}
              initial={{ scale: 0, opacity: 0.9 }}
              animate={{ scale: 1.1, opacity: 0.7 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              {/* Projections d'éclats */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                }}
              >
                {renderExplosionProjections()}
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Texte incitatif */}
      <AnimatePresence>
        {showText && targetRef.current && (() => {
          const rect = targetRef.current.getBoundingClientRect();

          return (
            <motion.div
              key="hover-text"
              className="fixed pointer-events-none z-50"
              style={{
                top: rect.bottom + 20,
                left: rect.left + rect.width / 2,
                transform: "translateX(-50%)",
                position: "fixed",
              }}
              initial={{ opacity: 0, y: -10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.8 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div
                style={{
                  background: "linear-gradient(135deg, #0F766E 0%, #06B6D4 100%)",
                  color: "white",
                  padding: "10px 18px",
                  borderRadius: "20px",
                  fontWeight: "500",
                  fontSize: "13px",
                  textAlign: "center",
                  boxShadow: "0 6px 20px rgba(15,118,110,0.3)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  backdropFilter: "blur(10px)",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    content: '""',
                    position: "absolute",
                    top: "-6px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 0,
                    height: 0,
                    borderLeft: "6px solid transparent",
                    borderRight: "6px solid transparent",
                    borderBottom: "6px solid #0F766E",
                  }}
                />
                Hover to interact with this element
                <motion.div
                  style={{
                    position: "absolute",
                    top: "-1px",
                    right: "-1px",
                    width: "4px",
                    height: "4px",
                    background: "#10B981",
                    borderRadius: "50%",
                  }}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </>
  );
}