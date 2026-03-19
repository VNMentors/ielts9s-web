import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PracticeState {
  testId: string | null;
  answers: Record<string, string>;
  setAnswer: (questionId: string, value: string) => void;
  startTest: (testId: string) => void;
  clearTest: () => void;
}

/**
 * Zustand store — persists answers in localStorage so users
 * don't lose their work if they accidentally refresh the page.
 */
export const usePracticeStore = create<PracticeState>()(
  persist(
    (set) => ({
      testId: null,
      answers: {},
      setAnswer: (qId, value) =>
        set((s) => ({ answers: { ...s.answers, [qId]: value } })),
      startTest: (testId) => set({ testId, answers: {} }),
      clearTest: () => set({ testId: null, answers: {} }),
    }),
    { name: "ielts9s-practice" }
  )
);
