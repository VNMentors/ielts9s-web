"use client";
import { useEffect, useState } from "react";
import { getUserSubmissions } from "@/services/testService";
import { useAuth } from "@/hooks/useAuth";
import { Submission } from "@/types";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

function BandColor(band: number) {
  if (band >= 7.5) return "#00cc00";
  if (band >= 6.0) return "#f5a623";
  return "#e74c3c";
}

export default function HistoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) { router.push("/"); return; }
    if (user) {
      getUserSubmissions(user.uid)
        .then(setSubmissions)
        .finally(() => setFetching(false));
    }
  }, [user, loading]);

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>📜 Lịch sử làm bài</h1>
        <p className={styles.subtitle}>Xem lại kết quả các bài đã làm. Click để xem giải thích chi tiết.</p>
        <button className="btn btn-primary" onClick={() => router.push("/practice")}>
          + Làm bài mới
        </button>
      </div>

      {fetching ? (
        <div className={styles.loading}><div className={styles.spinner} /></div>
      ) : submissions.length === 0 ? (
        <div className={styles.empty}>
          <span>📭</span>
          <p>Bạn chưa làm bài nào.</p>
          <button className="btn btn-primary" onClick={() => router.push("/practice")}>Luyện ngay!</button>
        </div>
      ) : (
        <div className={styles.list}>
          {submissions.map((sub) => (
            <div key={sub.id} className={`glass-card ${styles.card}`} onClick={() => router.push(`/practice/${sub.testId}`)}>
              <div className={styles.cardLeft}>
                <span className={`badge ${sub.skill === "Reading" ? "badge-green" : ""}`}
                  style={sub.skill === "Listening" ? { background: "rgba(0,100,255,0.1)", color: "#4a9eff", border: "1px solid rgba(0,100,255,0.25)" } : {}}>
                  {sub.skill === "Reading" ? "📖" : "🎧"} {sub.skill}
                </span>
                <div>
                  <h3 className={styles.cardTitle}>{sub.testTitle}</h3>
                  <p className={styles.cardDate}>{new Date(sub.createdAt).toLocaleDateString("vi-VN")}</p>
                </div>
              </div>
              <div className={styles.cardRight}>
                <div className={styles.scoreBox}>
                  <span className={styles.score}>{sub.score}/40</span>
                  <span className={styles.scoreSub}>câu đúng</span>
                </div>
                <div className={styles.bandBox} style={{ borderColor: BandColor(sub.bandScore) }}>
                  <span className={styles.band} style={{ color: BandColor(sub.bandScore) }}>{sub.bandScore}</span>
                  <span className={styles.bandSub}>Band</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
