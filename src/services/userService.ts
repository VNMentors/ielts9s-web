import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile, Test } from "@/types";
import { getRankByBand } from "@/lib/constants";

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return { uid, ...snap.data() } as UserProfile;
}

/** Cập nhật stats và rank sau mỗi lần submit bài */
export async function updateUserStats(
  userId: string,
  test: Test,
  answers: Record<string, string>,
  bandScore: number
) {
  const profile = await getUserProfile(userId);
  if (!profile) return;

  const skillKey = test.skill.toLowerCase() as "reading" | "listening";
  const stats = { ...profile.stats };

  // Tính accuracy theo từng dạng câu hỏi
  const allQuestions = test.parts.flatMap((p) => p.questions);
  const typeAccuracy: Record<string, { correct: number; total: number }> = {};

  for (const q of allQuestions) {
    const key = q.type;
    const isCorrect =
      test.answerKey[q.id]?.toUpperCase() === answers[q.id]?.toUpperCase();

    if (!typeAccuracy[key]) typeAccuracy[key] = { correct: 0, total: 0 };
    typeAccuracy[key].total++;
    if (isCorrect) typeAccuracy[key].correct++;
  }

  for (const [type, data] of Object.entries(typeAccuracy)) {
    stats[skillKey][type] = data.correct / data.total;
  }

  // Rank up nếu band score đủ điều kiện
  const newRank = getRankByBand(bandScore).id;

  await updateDoc(doc(db, "users", userId), {
    stats,
    rank: newRank,
  });
}

export async function updateTargetBand(userId: string, targetBand: number) {
  await updateDoc(doc(db, "users", userId), { targetBand });
}
