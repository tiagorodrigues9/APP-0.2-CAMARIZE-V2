import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./GuidedTour.module.css";

/**
 * GuidedTour
 * - steps: Array<{ id?: string, ref: React.RefObject<HTMLElement>, title?: string, content: string, placement?: 'top'|'bottom'|'left'|'right' }>
 * - onFinish: () => void
 */
export default function GuidedTour({ steps, onFinish }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [placement, setPlacement] = useState("bottom");
  const [visible, setVisible] = useState(false);
  const tooltipRef = useRef(null);

  const currentStep = useMemo(() => steps?.[currentIndex], [steps, currentIndex]);

  // Compute tooltip position relative to target element
  const computePosition = () => {
    if (!currentStep?.ref?.current || !tooltipRef.current) return;
    const rect = currentStep.ref.current.getBoundingClientRect();
    const tooltip = tooltipRef.current.getBoundingClientRect();

    const preferred = currentStep.placement || "bottom";
    let top = 0;
    let left = 0;
    let actualPlacement = preferred;

    const margin = 12;
    if (preferred === "bottom") {
      top = rect.bottom + margin;
      left = rect.left + rect.width / 2 - tooltip.width / 2;
      if (top + tooltip.height > window.innerHeight) {
        actualPlacement = "top";
      }
    }
    if (preferred === "top" || actualPlacement === "top") {
      top = rect.top - tooltip.height - margin;
      left = rect.left + rect.width / 2 - tooltip.width / 2;
    }
    if (preferred === "left") {
      top = rect.top + rect.height / 2 - tooltip.height / 2;
      left = rect.left - tooltip.width - margin;
      if (left < 0) actualPlacement = "right";
    }
    if (preferred === "right" || actualPlacement === "right") {
      top = rect.top + rect.height / 2 - tooltip.height / 2;
      left = rect.right + margin;
    }

    // Keep inside viewport horizontally
    left = Math.max(12, Math.min(left, window.innerWidth - tooltip.width - 12));
    top = Math.max(12, Math.min(top, window.innerHeight - tooltip.height - 12));

    setPlacement(actualPlacement);
    setPosition({ top, left });
  };

  useEffect(() => {
    const handleReposition = () => computePosition();
    if (currentStep?.ref?.current) {
      // slight delay to ensure layout is settled
      const t = setTimeout(() => {
        setVisible(true);
        computePosition();
      }, 50);
      window.addEventListener("resize", handleReposition);
      window.addEventListener("scroll", handleReposition, true);
      return () => {
        clearTimeout(t);
        window.removeEventListener("resize", handleReposition);
        window.removeEventListener("scroll", handleReposition, true);
      };
    }
  }, [currentStep]);

  if (!currentStep) return null;

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === steps.length - 1;

  return (
    <div className={styles.overlay}>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={() => onFinish?.()} />

      {/* Pulse highlight */}
      {currentStep?.ref?.current && (
        <div
          className={styles.pulse}
          style={{
            top: currentStep.ref.current.getBoundingClientRect().top + window.scrollY,
            left: currentStep.ref.current.getBoundingClientRect().left + window.scrollX,
            width: currentStep.ref.current.getBoundingClientRect().width,
            height: currentStep.ref.current.getBoundingClientRect().height,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={`${styles.tooltip} ${visible ? styles.visible : ""} ${styles[placement]}`}
        style={{ top: position.top + window.scrollY, left: position.left + window.scrollX }}
      >
        {currentStep.title && <div className={styles.title}>{currentStep.title}</div>}
        <div className={styles.content}>{currentStep.content}</div>
        <div className={styles.actions}>
          <button className={styles.secondary} onClick={() => onFinish?.()}>Pular</button>
          {!isFirst && (
            <button className={styles.secondary} onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}>Voltar</button>
          )}
          <button
            className={styles.primary}
            onClick={() => {
              if (isLast) onFinish?.();
              else setCurrentIndex(i => Math.min(steps.length - 1, i + 1));
            }}
          >
            {isLast ? "Concluir" : "Próximo"}
          </button>
        </div>
      </div>
    </div>
  );
}



