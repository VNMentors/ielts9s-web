import {
  collection, doc, getDocs, getDoc,
  addDoc, serverTimestamp, query, where, orderBy
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Test, Submission } from "@/types";
import { getBandScore, getRankByBand } from "@/lib/constants";
import { updateUserStats } from "./userService";

/** Fetch danh sách đề thi (có filter skill, source) */
export async function getTests(filters?: {
  skill?: string;
  source?: string;
}): Promise<Test[]> {
  let q = query(collection(db, "tests"), orderBy("createdAt", "desc"));

  if (filters?.skill) q = query(q, where("skill", "==", filters.skill));
  if (filters?.source) q = query(q, where("source", "==", filters.source));

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Test));
}

/** Fetch chi tiết 1 bộ đề */
export async function getTestById(testId: string): Promise<Test | null> {
  const snap = await getDoc(doc(db, "tests", testId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Test;
}

/** Submit bài làm — chấm điểm và lưu */
export async function submitTest(
  userId: string,
  test: Test,
  answers: Record<string, string>
): Promise<Submission> {
  // Chấm điểm
  let correct = 0;
  for (const [qId, ans] of Object.entries(answers)) {
    if (test.answerKey[qId]?.toUpperCase() === ans.toUpperCase()) correct++;
  }
  const band = getBandScore(correct);

  const submission: Omit<Submission, "id"> = {
    userId,
    testId: test.id,
    testTitle: test.title,
    skill: test.skill,
    answers,
    score: correct,
    bandScore: band,
    createdAt: new Date(),
  };

  const ref = await addDoc(collection(db, "submissions"), {
    ...submission,
    createdAt: serverTimestamp(),
  });

  // Cập nhật stats và rank của user
  await updateUserStats(userId, test, answers, band);

  return { id: ref.id, ...submission };
}

/** Lịch sử bài làm của 1 user */
export async function getUserSubmissions(userId: string): Promise<Submission[]> {
  const q = query(
    collection(db, "submissions"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Submission));
}
