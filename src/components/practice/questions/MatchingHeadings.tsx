"use client";
import React from "react";
import styles from "../QuestionRenderer.module.css";
import DraggablePill from "../DraggablePill";
import { usePracticeStore } from "@/store/practiceStore";

interface MatchingHeadingsProps {
  group: any;
}

export default function MatchingHeadings({ group }: MatchingHeadingsProps) {
  const { answers, setAnswer } = usePracticeStore();

  if (!group.headings) return null;

  const usedHeadings = Object.values(answers).filter(Boolean) as string[];

  return (
    <div className={styles.matchingHeadingsWrapper}>
      <div className={styles.headingsList}>
        <div className={styles.headingsListTitle}>List of Headings</div>
        <div className={styles.optionsPills} style={{ marginTop: '12px', background: 'transparent', border: 'none', padding: 0 }}>
          {group.headings.map((h: string, i: number) => {
            const label = h.match(/^([ivxl]+)\.\s/i)?.[1] || String.fromCharCode(105 + i);
            const textToDisplay = h.replace(/^[ivxlIVXL]+\.\s+/, "");
            
            // A heading is used if any question in THIS group has it as the answer
            const isUsed = group.questions.some((q: any) => {
              const selected = answers[String(q.id)];
              return selected === label || selected === h;
            });

            return (
              <DraggablePill
                key={h}
                id={h}
                text={`${label}. ${textToDisplay}`}
                type="heading"
                isUsed={isUsed}
              />
            );
          })}
        </div>
      </div>
      
      <p className={styles.instructions} style={{ marginTop: '20px' }}>
        <strong>Note:</strong> Please drag the heading Roman numerals above into the empty boxes 
        ({group.questions[0].id}-{group.questions[group.questions.length - 1].id}) in the passage on the left.
      </p>
    </div>
  );
}
