"use client";
import React from "react";
import styles from "./QuestionRenderer.module.css";

interface DraggablePillProps {
  id: string;
  text: string;
  type: string;
  isUsed?: boolean;
}

export default function DraggablePill({ id, text, type, isUsed = false }: DraggablePillProps) {
  const onDragStart = (e: React.DragEvent) => {
    if (isUsed) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.setData("application/ielts-type", type);
    e.dataTransfer.setData("application/id", id);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      draggable={!isUsed}
      onDragStart={onDragStart}
      className={`${styles.draggablePill} ${isUsed ? styles.draggablePillUsed : ""}`}
      title={isUsed ? "Already placed" : "Drag to answer slot"}
    >
      {text}
    </div>
  );
}
