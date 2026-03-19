"use client";
import React from "react";
import DraggablePill from "../DraggablePill";
import DropZone from "../DropZone";
import styles from "../QuestionRenderer.module.css";
import { usePracticeStore } from "@/store/practiceStore";

interface GapFillProps {
  group: any;
}

export default function GapFill({ group }: GapFillProps) {
  const { answers, setAnswer } = usePracticeStore();

  const handleAnswer = (id: string, value: string) => {
    setAnswer(id, value);
  };

  if (!group.template) return null;

  const isDraggable = group.inputType === "pills" || group.type === "Matching Sentence Endings";
  const parts = group.template.split(/(\(\(\d+\)\))/g);

  // Build a map of letter -> option text for Matching Sentence Endings
  const optionLetterMap: Record<string, string> = {};
  if (isDraggable && group.options) {
    group.options.forEach((opt: string) => {
      const letterMatch = opt.match(/^([A-G])\.\s/);
      if (letterMatch) {
        optionLetterMap[letterMatch[1]] = opt.replace(/^[A-G]\.\s+/, "");
      }
    });
  }

  // All placed letter values
  const placedLetters = new Set(
    group.questions.map((q: any) => answers[String(q.id)]).filter(Boolean)
  );

  const renderOptions = () => {
    if (!group.options) return null;
    return (
      <div className={styles.optionsPills}>
        {group.options.map((opt: string) => {
          if (isDraggable) {
            const letterMatch = opt.match(/^([A-G])\.\s/);
            const letter = letterMatch ? letterMatch[1] : opt;
            const isUsed = placedLetters.has(letter);
            return (
              <DraggablePill
                key={opt}
                id={letter}
                text={opt}
                type={group.type}
                isUsed={isUsed}
              />
            );
          }
          return (
            <button
              key={opt}
              className={styles.pillBtn}
              onClick={() => {
                const emptyQ = group.questions.find((q: any) => !answers[String(q.id)]);
                if (emptyQ) handleAnswer(String(emptyQ.id), opt);
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    );
  };

  const getDropValue = (qId: string) => {
    const letter = answers[qId] || "";
    if (!letter) return "";
    // If we have a full sentence for this letter, show just the letter in the drop zone
    return letter;
  };

  return (
    <div className={styles.integratedGap}>
      {parts.map((part: string, index: number) => {
        const match = part.match(/\(\((\d+)\)\)/);
        if (match) {
          const qId = match[1];
          const val = getDropValue(qId);

          if (isDraggable) {
            return (
              <span key={index} className={styles.inlineGapWrapper}>
                <span className={styles.gapCircle}>{qId}</span>
                <DropZone
                  id={qId}
                  value={val}
                  displayValue={val && optionLetterMap[val] ? `${val}. ${optionLetterMap[val]}` : val}
                  onDrop={handleAnswer}
                  placeholder="Drop here"
                />
              </span>
            );
          }

          return (
            <span key={index} className={styles.inlineGapWrapper}>
              <span className={styles.gapCircle}>{qId}</span>
              <div className={styles.inputContainer}>
                <input
                  type="text"
                  className={styles.inlineInput}
                  style={{ width: "180px" }}
                  value={answers[qId] || ""}
                  onChange={(e) => handleAnswer(qId, e.target.value)}
                />
              </div>
            </span>
          );
        }
        return <span key={index} dangerouslySetInnerHTML={{ __html: part }} />;
      })}
      {renderOptions()}
    </div>
  );
}
