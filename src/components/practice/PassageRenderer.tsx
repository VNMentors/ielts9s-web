"use client";
import React, { useRef, useEffect } from "react";
import DropZone from "./DropZone";
import styles from "./QuestionRenderer.module.css";

interface PassageRendererProps {
  html: string;
  answers: Record<string, string>;
  onDrop: (id: string, val: string) => void;
}

/**
 * Renders passage HTML.
 * Replaces [[N]] markers with inline DropZone elements for Matching Headings.
 */
export default function PassageRenderer({ html, answers, onDrop }: PassageRendererProps) {
  // Split on [[N]] pattern
  const parts = html.split(/(\[\[\d+\]\])/g);

  return (
    <div className={styles.passageContent}>
      {parts.map((part, idx) => {
        const match = part.match(/\[\[(\d+)\]\]/);
        if (match) {
          const qId = match[1];
          const val = answers[qId] || "";
          return (
            <span key={idx} className={styles.inlineDropWrapper}>
              <DropZone
                id={qId}
                value={val}
                onDrop={onDrop}
                placeholder={`${qId}`}
                className={styles.passageDropZone}
              />
            </span>
          );
        }
        return <span key={idx} dangerouslySetInnerHTML={{ __html: part }} />;
      })}
    </div>
  );
}
