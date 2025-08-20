import { useEffect, useMemo, useRef, useState } from 'react';
import Modal from '../Modal';
import styles from './TimePickerModal.module.css';

function pad2(n) {
  return String(n).padStart(2, '0');
}

export default function TimePickerModal({
  isOpen,
  title = 'Selecionar horário',
  initial = '22:00',
  onConfirm,
  onClose
}) {
  const hoursRef = useRef(null);
  const minutesRef = useRef(null);
  const ITEM_HEIGHT = 40; // px
  const VISIBLE_COUNT = 5; // itens visíveis na "janela"
  const PADDING = (VISIBLE_COUNT * ITEM_HEIGHT - ITEM_HEIGHT) / 2; // centra o item selecionado

  const [hour, setHour] = useState(22);
  const [minute, setMinute] = useState(0);

  // Inicializa valores ao abrir
  useEffect(() => {
    if (!isOpen) return;
    const [h, m] = (initial || '00:00').split(':').map((v) => parseInt(v, 10) || 0);
    setHour(Math.min(23, Math.max(0, h)));
    setMinute(Math.min(59, Math.max(0, m)));
    // Posiciona scrolls
    const raf = requestAnimationFrame(() => {
      if (hoursRef.current) hoursRef.current.scrollTop = PADDING + h * ITEM_HEIGHT;
      if (minutesRef.current) minutesRef.current.scrollTop = PADDING + m * ITEM_HEIGHT;
    });
    return () => cancelAnimationFrame(raf);
  }, [isOpen, initial]);

  const updateFromScroll = (container, setValue, max) => {
    if (!container || typeof container.scrollTop !== 'number') return;
    const idx = Math.round((container.scrollTop - PADDING) / ITEM_HEIGHT);
    const clamped = Math.min(max, Math.max(0, idx));
    setValue(clamped);
  };

  const scrollToIndex = (el, idx, max) => {
    const clamped = Math.min(max, Math.max(0, idx));
    try {
      el?.scrollTo({ top: PADDING + clamped * ITEM_HEIGHT, behavior: 'smooth' });
    } catch (_) {
      if (el) el.scrollTop = PADDING + clamped * ITEM_HEIGHT;
    }
  };

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => pad2(i)), []);
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => pad2(i)), []);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className={styles.pickerWrap}>
        <div className={styles.column}>
          <div className={styles.spacer} />
          <div
            ref={hoursRef}
            className={styles.wheel}
            onScrollEnd={(e) => {
              const el = e.currentTarget;
              const idx = Math.round((el.scrollTop - PADDING) / ITEM_HEIGHT);
              const clamped = Math.min(23, Math.max(0, idx));
              setHour(clamped);
            }}
          >
            <div style={{ height: PADDING }} />
            {hours.map((h) => (
              <div key={h} className={styles.item}>{h}</div>
            ))}
            <div style={{ height: PADDING }} />
          </div>
          <div className={styles.spacer} />
          <div className={styles.label}>Hora</div>
        </div>

        <div className={styles.column}>
          <div className={styles.spacer} />
          <div
            ref={minutesRef}
            className={styles.wheel}
            onScrollEnd={(e) => {
              const el = e.currentTarget;
              const idx = Math.round((el.scrollTop - PADDING) / ITEM_HEIGHT);
              const clamped = Math.min(59, Math.max(0, idx));
              setMinute(clamped);
            }}
          >
            <div style={{ height: PADDING }} />
            {minutes.map((m) => (
              <div key={m} className={styles.item}>{m}</div>
            ))}
            <div style={{ height: PADDING }} />
          </div>
          <div className={styles.spacer} />
          <div className={styles.label}>Min</div>
        </div>

        {/* faixa de seleção */}
        <div className={styles.selectionOverlay} />
      </div>

      <div className={styles.actions}>
        <button className={styles.btnSecondary} onClick={onClose}>Cancelar</button>
        <button
          className={styles.btnPrimary}
          onClick={() => {
            // Garante que a leitura é feita do centro da janela visível
            const hEl = hoursRef.current;
            const mEl = minutesRef.current;
            const hIdx = hEl ? Math.round((hEl.scrollTop - PADDING) / ITEM_HEIGHT) : hour;
            const mIdx = mEl ? Math.round((mEl.scrollTop - PADDING) / ITEM_HEIGHT) : minute;
            const safeH = Math.min(23, Math.max(0, hIdx));
            const safeM = Math.min(59, Math.max(0, mIdx));
            const value = `${pad2(safeH)}:${pad2(safeM)}`;
            onConfirm?.(value);
            onClose?.();
          }}
        >
          Confirmar
        </button>
      </div>
    </Modal>
  );
}


