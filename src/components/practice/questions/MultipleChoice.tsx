"use client";
import React from "react";
import styles from "../QuestionRenderer.module.css";
import { usePracticeStore } from "@/store/practiceStore";

interface MultipleChoiceProps {
  question: any;
  group: any;
}

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F", "G"];

export default function MultipleChoice({ question, group }: MultipleChoiceProps) {
  const { answers, setAnswer } = usePracticeStore();

  const handleAnswer = (id: string, value: string) => {
    setAnswer(id, value);
  };

  if (!question) return null;

  const isBoolean = ["True - False - Not Given", "Yes - No - Not Given"].includes(group.type);

  if (isBoolean) {
    const tfngOptions = question.options || ["TRUE", "FALSE", "NOT GIVEN"];
    return (
      <div className={styles.questionItem}>
        <div className={styles.qHeaderRow}>
          <span className={styles.gapCircle}>{question.id}</span>
          <p className={styles.qText}>{question.text}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginLeft: '34px', marginTop: '12px' }}>
          {tfngOptions.map((opt: string) => {
            const isSelected = answers[String(question.id)] === opt;
            return (
              <label
                key={opt}
                className={styles.radioContainer}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, color: '#444' }}
              >
                <input
                  type="radio"
                  name={`q-${question.id}`}
                  value={opt}
                  checked={isSelected}
                  onChange={() => handleAnswer(String(question.id), opt)}
                  style={{ display: 'none' }}
                />
                <span className={styles.radioCircle}></span>
                <span style={{ fontSize: '0.9rem' }}>{opt}</span>
              </label>
            );
          })}
        </div>
      </div>
    );
  }

  // Standard MCQ — lettered radio buttons with full option text
  const options = question.options || [];
  return (
    <div className={styles.questionItem}>
      <div className={styles.qHeaderRow}>
        <span className={styles.gapCircle}>{question.id}</span>
        <p className={styles.qText}>{question.text}</p>
      </div>
      <div className={styles.mcqOptionsList}>
        {options.map((opt: string, i: number) => {
          const letter = OPTION_LETTERS[i] || String(i + 1);
          // Support both "A. full text" format and plain text
          const displayText = opt.match(/^[A-G]\.\s+/) ? opt.replace(/^[A-G]\.\s+/, "") : opt;
          
          // Detect if option text already includes letter prefix (e.g. "A. something")
          const optionLetterMatch = opt.match(/^([A-G])\.\s+/);
          const optionLetter = optionLetterMatch?.[1] || letter;
          const answerValue = optionLetterMatch ? optionLetter : letter;
          const isSelected = answers[String(question.id)] === opt || answers[String(question.id)] === answerValue;
          
          return (
            <label
              key={opt}
              className={`${styles.mcqOption} ${isSelected ? styles.mcqOptionSelected : ""}`}
            >
              <input
                type="radio"
                name={`q-${question.id}`}
                value={answerValue}
                checked={isSelected}
                onChange={() => handleAnswer(String(question.id), answerValue)}
                style={{ display: "none" }}
              />
              <div className={`${styles.mcqLetter} ${isSelected ? styles.mcqLetterSelected : ""}`}>
                {optionLetter}
              </div>
              <span className={styles.mcqText}>{displayText}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
