"use client";
import React from "react";
import styles from "../QuestionRenderer.module.css";
import { usePracticeStore } from "@/store/practiceStore";

interface MultiSelectProps {
  group: any;
}

export default function MultiSelect({ group }: MultiSelectProps) {
  const { answers, setAnswer } = usePracticeStore();

  const handleToggle = (qId: string, option: string) => {
    const current = answers[qId] || "";
    const selections = current ? current.split("|") : [];
    
    if (selections.includes(option)) {
      setAnswer(qId, selections.filter(s => s !== option).join("|"));
    } else {
      // Limit based on "Which TWO" or "Which THREE"
      const limitMatch = group.instructions?.match(/TWO|THREE|FOUR/i);
      const limitMap: Record<string, number> = { "TWO": 2, "THREE": 3, "FOUR": 4 };
      const limit = limitMap[limitMatch?.[0].toUpperCase() || ""] || 2;

      if (selections.length < limit) {
        setAnswer(qId, [...selections, option].join("|"));
      }
    }
  };

  // For grouped questions like 23-24, we usually store the answers 
  // in the first question ID of the group if they are treated as one block,
  // or mapped to individual IDs. For simplicity in UI, we'll map to the first Q ID.
  const mainQId = String(group.questions[0].id);
  const currentSelections = (answers[mainQId] || "").split("|");

  return (
    <div className={styles.multiSelectWrapper}>
      <div className={styles.optionsList}>
        {group.options.map((opt: string) => {
          const isSelected = currentSelections.includes(opt);
          return (
            <label key={opt} className={`${styles.optionLabel} ${isSelected ? styles.optionSelected : ""}`}>
              <input 
                type="checkbox" 
                checked={isSelected}
                onChange={() => handleToggle(mainQId, opt)}
              />
              <span className={styles.checkboxSquare}>
                {isSelected && <span className={styles.checkmark}>✓</span>}
              </span>
              <span className={styles.optText}>{opt}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
