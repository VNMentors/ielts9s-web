"use client";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { getUserProfile } from "@/services/userService";
import { UserProfile } from "@/types";
import { RANKS } from "@/lib/constants";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

const ICONS = ["🌱", "🌿", "🌸", "🌳"];

export default function RoadmapPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/");
    if (user) getUserProfile(user.uid).then(setProfile);
  }, [user, loading]);

  if (loading || !profile) return <div className={styles.loading}><div className={styles.spinner}/></div>;

  const currentRankIdx = RANKS.findIndex((r) => r.id === profile.rank);

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>🌳 Lộ trình học của bạn</h1>
        <p className={styles.subtitle}>Thăng cấp tự động dựa trên Band score thực tế của bạn.</p>
      </div>

      <div className={styles.track}>
        {[...RANKS].reverse().map((rank, reversedIdx) => {
          const realIdx = RANKS.length - 1 - reversedIdx;
          const isActive = realIdx === currentRankIdx;
          const isDone = realIdx < currentRankIdx;
          const isLocked = realIdx > currentRankIdx;

          return (
            <div key={rank.id} className={`${styles.node} ${isActive ? styles.nodeActive : ""} ${isDone ? styles.nodeDone : ""} ${isLocked ? styles.nodeLocked : ""}`}>
              {/* Connector line */}
              {reversedIdx < RANKS.length - 1 && (
                <div className={`${styles.connector} ${realIdx < currentRankIdx ? styles.connectorDone : ""}`} />
              )}

              <div className={styles.nodeCircle}>
                {isDone ? "✅" : isActive ? "🔥" : isLocked ? "🔒" : "⭕"}
              </div>
              <div className={styles.nodeContent}>
                <div className={styles.nodeIcon}>{ICONS[realIdx]}</div>
                <div className={styles.nodeInfo}>
                  <div className={styles.nodeTop}>
                    <span className={`badge ${isActive ? "badge-green" : ""}`}
                      style={isDone ? { background: "rgba(0,153,0,0.3)", color: "#00cc00" } : isLocked ? { background: "var(--bg-card)", color: "var(--text-muted)" } : {}}>
                      {rank.level}
                    </span>
                    <span className={styles.nodeBand}>Band {rank.bandMin}–{rank.bandMax}</span>
                  </div>
                  <h2 className={styles.nodeTitle}>{rank.label}</h2>
                  <p className={styles.nodeDesc}>
                    {rank.id === "novice"  && "Nắm vững từ vựng cơ bản, phát âm và cấu trúc bài thi IELTS."}
                    {rank.id === "scout"   && "Luyện từng dạng bài riêng lẻ. Làm quen với tốc độ của bài thi thật."}
                    {rank.id === "knight"  && "Luyện Full đề 40 câu. Quản lý thời gian. Phân tích Radar Chart."}
                    {rank.id === "master"  && "Chiến lược thi thật. Tối ưu từng câu để đạt điểm số tối đa."}
                  </p>
                  {isActive && (
                    <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => router.push("/practice")}>
                      Luyện tập ngay →
                    </button>
                  )}
                  {isLocked && (
                    <p className={styles.nodeUnlock}>Đạt Band {rank.bandMin} để mở khóa</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
