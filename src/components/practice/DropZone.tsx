"use client";
import React, { useState } from "react";
import styles from "./QuestionRenderer.module.css";

interface DropZoneProps {
  id: string;
  value: string;
  displayValue?: string;
  onDrop: (id: string, value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function DropZone({ id, value, displayValue, onDrop, placeholder, className }: DropZoneProps) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    // For pills: store the letter ID, not the full text
    const letter = e.dataTransfer.getData("application/id");
    const text = e.dataTransfer.getData("text/plain");
    // Prefer application/id (which is the letter), fallback to text
    const data = letter || text;
    onDrop(id, data);
  };

  const shownValue = displayValue || value;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`${styles.dropZone} ${isOver ? styles.dropZoneActive : ""} ${value ? styles.dropZoneFilled : ""} ${className || ""}`}
    >
      {value ? (
        <span className={styles.dropValue}>
          {shownValue}
          <button className={styles.removeBtn} onClick={() => onDrop(id, "")}>✕</button>
        </span>
      ) : (
        <span className={styles.dropPlaceholder}>{placeholder || id}</span>
      )}
    </div>
  );
}
