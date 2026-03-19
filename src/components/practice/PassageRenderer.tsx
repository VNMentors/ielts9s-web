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
    <div 
      className={styles.passageContent}
      contentEditable={true}
      suppressContentEditableWarning={true}
      style={{ outline: "none" }}
      onBeforeInput={(e) => {
        // Only allow formatting commands (like backColor, createLink) from execCommand.
        const inputType = (e.nativeEvent as InputEvent).inputType;
        if (inputType && !inputType.startsWith('format')) {
          e.preventDefault();
        }
      }}
      onKeyDown={(e) => {
        // Block text deletion keys (Backspace, Delete) just to be safe
        if (e.key === "Backspace" || e.key === "Delete" || e.key === "Enter") {
          e.preventDefault();
        }
      }}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#note-')) {
          e.preventDefault();
          // Dispatch a custom event to notify ReadingEngine
          const event = new CustomEvent('openIeltsNote', { detail: target.getAttribute('href')?.replace('#note-', '') });
          window.dispatchEvent(event);
        }
      }}
    >
      {parts.map((part, idx) => {
        const match = part.match(/\[\[(\d+)\]\]/);
        if (match) {
          const qId = match[1];
          const val = answers[qId] || "";
          return (
            <span key={idx} className={styles.inlineDropWrapper} contentEditable={false}>
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
