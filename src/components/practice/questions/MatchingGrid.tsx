"use client";
import React from "react";
import styles from "../QuestionRenderer.module.css";
import { usePracticeStore } from "@/store/practiceStore";

interface MatchingGridProps {
  group: any;
}

export default function MatchingGrid({ group }: MatchingGridProps) {
  const { answers, setAnswer } = usePracticeStore();

  const handleAnswer = (id: string, value: string) => {
    setAnswer(id, value);
  };

  const columns = group.columns || ["A", "B", "C", "D", "E", "F", "G"];

  return (
    <div className={styles.gridWrapper}>
      <table className={styles.matchingTable}>
        <thead>
          <tr>
            <th className={styles.rowLabelHead}></th>
            {columns.map((col: string) => {
              // Determine if this column is selected in any row
              const isColSelected = (group.questions || []).some((q: any) => answers[String(q.id)] === col);
              return (
                <th key={col} className={`${styles.colHeader} ${isColSelected ? styles.colSelected : ""}`}>
                  {col}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {(group.questions || []).map((q: any) => (
            <tr key={q.id}>
              <td className={styles.gridQText}>
                <span className={styles.qIdBox}>{q.id}</span>
                <span className={styles.qInner}>{q.text}</span>
              </td>
              {columns.map((col: string) => {
                const isSelected = answers[String(q.id)] === col;
                return (
                  <td key={col} className={`${styles.gridCell} ${isSelected ? styles.cellSelected : ""}`}>
                    <label className={styles.radioContainer}>
                      <input 
                        type="radio" 
                        name={`q-${q.id}`} 
                        checked={isSelected}
                        onChange={() => handleAnswer(String(q.id), col)}
                      />
                      <span className={styles.radioCircle}></span>
                    </label>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
