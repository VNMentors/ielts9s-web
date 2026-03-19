"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Lesson } from "@/types";
import styles from "./page.module.css";

export default function LessonPage() {
  const { videoId } = useParams<{ videoId: string }>();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoc(doc(db, "lessons", videoId))
      .then((snap) => { if (snap.exists()) setLesson({ id: snap.id, ...snap.data() } as Lesson); })
      .finally(() => setLoading(false));
  }, [videoId]);

  if (loading) return <div className={styles.loading}><div className={styles.spinner} /></div>;
  if (!lesson) return (
    <div className={styles.notFound}>
      <p>Không tìm thấy video này.</p>
      <button className="btn btn-primary" onClick={() => router.push("/learning")}>Quay lại</button>
    </div>
  );

  const LEVEL_LABELS: Record<string, string> = {
    novice: "🌱 Root", scout: "🌿 Trunk", knight: "🌸 Bud", master: "🌳 Bloom",
  };

  return (
    <div className={`container ${styles.page}`}>
      {/* Back */}
      <button className={styles.back} onClick={() => router.push("/learning")}>
        ← Quay lại khóa học
      </button>

      {/* Video Player */}
      <div className={styles.videoWrapper}>
        <video
          controls
          src={lesson.videoUrl}
          className={styles.video}
          preload="metadata"
          controlsList="nodownload"
        />
      </div>

      {/* Info */}
      <div className={styles.info}>
        <div className={styles.meta}>
          <span className="badge badge-green">{LEVEL_LABELS[lesson.level]}</span>
          <span className={styles.duration}>⏱ {Math.floor(lesson.duration / 60)} phút</span>
        </div>
        <h1 className={styles.title}>{lesson.title}</h1>
        {lesson.description && <p className={styles.desc}>{lesson.description}</p>}
      </div>

      {/* Practice CTA */}
      <div className={`glass-card ${styles.ctaCard}`}>
        <p>Học xong rồi? Kiểm tra lại kiến thức với đề thật nhé! 💪</p>
        <button className="btn btn-primary" onClick={() => router.push("/practice")}>
          Vào luyện đề →
        </button>
      </div>
    </div>
  );
}
