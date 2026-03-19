"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Lesson } from "@/types";
import { useRouter } from "next/navigation";
import { RANKS } from "@/lib/constants";
import styles from "./page.module.css";

const LEVEL_LABELS: Record<string, string> = {
  novice: "🌱 Root — Người mới",
  scout:  "🌿 Trunk — Nền tảng",
  knight: "🌸 Bud — Trung cấp",
  master: "🌳 Bloom — Nâng cao",
};

export default function LearningPage() {
  const router = useRouter();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "lessons"), orderBy("order"));
    getDocs(q)
      .then((snap) => setLessons(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Lesson))))
      .finally(() => setLoading(false));
  }, []);

  const grouped = lessons.reduce((acc, l) => {
    (acc[l.level] ??= []).push(l);
    return acc;
  }, {} as Record<string, Lesson[]>);

  const levelOrder = ["novice", "scout", "knight", "master"];

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>🎓 Khóa học Video</h1>
        <p className={styles.subtitle}>Học theo lộ trình từ cơ bản đến nâng cao. Mỗi video ngắn gọn, tập trung vào 1 kỹ năng.</p>
      </div>

      {loading ? (
        <div className={styles.loading}><div className={styles.spinner} /></div>
      ) : lessons.length === 0 ? (
        <div className={styles.empty}>
          <span>🎬</span>
          <p>Chưa có video nào. Admin upload video nhé!</p>
          <button className="btn btn-outline" onClick={() => router.push("/admin/upload-video")}>
            Upload Video
          </button>
        </div>
      ) : (
        levelOrder.map((level) => {
          const items = grouped[level];
          if (!items?.length) return null;
          return (
            <div key={level} className={styles.group}>
              <h2 className={styles.groupTitle}>{LEVEL_LABELS[level]}</h2>
              <div className={styles.lessonGrid}>
                {items.map((lesson, i) => (
                  <div key={lesson.id} className={`glass-card ${styles.lessonCard}`}
                    onClick={() => router.push(`/learning/${lesson.id}`)}>
                    <div className={styles.lessonThumb}>
                      <span>{i + 1}</span>
                      <div className={styles.playBtn}>▶</div>
                    </div>
                    <div className={styles.lessonInfo}>
                      <h3 className={styles.lessonTitle}>{lesson.title}</h3>
                      {lesson.description && <p className={styles.lessonDesc}>{lesson.description}</p>}
                      <div className={styles.lessonMeta}>
                        <span>⏱ {Math.floor(lesson.duration / 60)} phút</span>
                        <span className="badge badge-green">{LEVEL_LABELS[lesson.level]?.split("—")[0].trim()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
