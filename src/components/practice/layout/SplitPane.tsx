"use client";
import React, { useState, useRef, useEffect } from "react";
import styles from "./SplitPane.module.css";

interface SplitPaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
  initialLeftWidth?: number; // percentage
}

export default function SplitPane({ left, right, initialLeftWidth = 50 }: SplitPaneProps) {
  const [leftWidth, setLeftWidth] = useState(initialLeftWidth);
  const isResizing = useRef(false);

  const startResizing = (e: React.MouseEvent | React.TouchEvent) => {
    isResizing.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopResizing);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", stopResizing);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const stopResizing = () => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", stopResizing);
    document.removeEventListener("touchmove", handleTouchMove);
    document.removeEventListener("touchend", stopResizing);
    document.body.style.cursor = "default";
    document.body.style.userSelect = "auto";
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = (e.clientX / window.innerWidth) * 100;
    if (newWidth > 20 && newWidth < 80) {
      setLeftWidth(newWidth);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isResizing.current) return;
    const newWidth = (e.touches[0].clientX / window.innerWidth) * 100;
    if (newWidth > 20 && newWidth < 80) {
      setLeftWidth(newWidth);
    }
  };

  return (
    <div className={styles.splitWrapper}>
      <div className={styles.leftPane} style={{ width: `${leftWidth}%` }}>
        {left}
      </div>
      <div className={styles.resizer} onMouseDown={startResizing} onTouchStart={startResizing}>
        <div className={styles.resizerHandle}></div>
      </div>
      <div className={styles.rightPane} style={{ width: `${100 - leftWidth}%` }}>
        {right}
      </div>
    </div>
  );
}
