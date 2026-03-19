"use client";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { getUserProfile } from "@/services/userService";
import { getUserSubmissions } from "@/services/testService";
import { UserProfile, Submission } from "@/types";
import { useRouter } from "next/navigation";
import { RANKS } from "@/lib/constants";
import styles from "./page.module.css";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recentSubs, setRecentSubs] = useState<Submission[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push("/");
    if (user) {
      getUserProfile(user.uid).then(setProfile);
      getUserSubmissions(user.uid).then((subs) => setRecentSubs(subs.slice(0, 4)));
    }
  }, [user, loading]);

  if (loading || !profile) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Đang tải...</p>
      </div>
    );
  }

  const rankInfo = RANKS.find((r) => r.id === profile.rank) ?? RANKS[0];
  const rankIndex = RANKS.findIndex((r) => r.id === profile.rank);
  const progressPct = Math.min(100, ((rankIndex + 1) / RANKS.length) * 100);

  return (
    <div className={`container ${styles.page}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.userInfo}>
          <img src={profile.photoURL} alt="" className={styles.avatar} />
          <div>
            <h1 className={styles.greeting}>Chào, {profile.displayName} 👋</h1>
            <p className={styles.subGreeting}>Tiếp tục hành trình chinh phục Band {profile.targetBand}!</p>
          </div>
        </div>
        <div className={styles.rankBadge}>
          <span className={styles.rankLabel}>{rankInfo.label}</span>
          <span className={styles.rankLevel}>{rankInfo.level}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className={styles.progressSection}>
        <div className={styles.progressHeader}>
          <span>Tiến trình lộ trình</span>
          <span className={styles.progressValue}>{rankInfo.label} → {RANKS[Math.min(rankIndex + 1, 3)].label}</span>
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <div className={styles.grid}>
        {/* Daily Quest */}
        <div className={`glass-card ${styles.questCard}`}>
          <h2 className={styles.cardTitle}>📋 Daily Quest</h2>
          <div className={styles.questList}>
            <div className={styles.questItem} onClick={() => router.push("/practice?skill=Listening")}>
              <span className={styles.questIcon}>🎧</span>
              <div>
                <p className={styles.questName}>Làm 1 bài Listening</p>
                <p className={styles.questDesc}>Part 1 hoặc Part 2</p>
              </div>
              <span className={styles.questArrow}>→</span>
            </div>
            <div className={styles.questItem} onClick={() => router.push("/practice?skill=Reading")}>
              <span className={styles.questIcon}>📖</span>
              <div>
                <p className={styles.questName}>Làm 1 Passage Reading</p>
                <p className={styles.questDesc}>Bất kỳ dạng bài nào</p>
              </div>
              <span className={styles.questArrow}>→</span>
            </div>
            <div className={styles.questItem} onClick={() => router.push("/learning")}>
              <span className={styles.questIcon}>🎓</span>
              <div>
                <p className={styles.questName}>Xem 1 video khóa học</p>
                <p className={styles.questDesc}>Level phù hợp với bạn</p>
              </div>
              <span className={styles.questArrow}>→</span>
            </div>
          </div>
        </div>

        {/* Skill Stats */}
        <div className={`glass-card ${styles.statsCard}`}>
          <h2 className={styles.cardTitle}>📊 Kỹ năng của bạn</h2>
          <div className={styles.skillList}>
            {[
              { name: "Reading — Matching", key: "reading.Matching Headings", val: profile.stats.reading["Matching Headings"] ?? 0 },
              { name: "Reading — Gap Fill",  key: "reading.Gap Fill",         val: profile.stats.reading["Gap Fill"] ?? 0 },
              { name: "Listening — Gap Fill", key: "listening.Gap Fill",      val: profile.stats.listening["Gap Fill"] ?? 0 },
              { name: "Listening — MCQ",      key: "listening.Multiple Choice", val: profile.stats.listening["Multiple Choice"] ?? 0 },
            ].map((skill) => (
              <div key={skill.key} className={styles.skillRow}>
                <span className={styles.skillName}>{skill.name}</span>
                <div className={styles.skillBar}>
                  <div
                    className={styles.skillFill}
                    style={{
                      width: `${skill.val * 100}%`,
                      background: skill.val > 0.7 ? "var(--green)" : skill.val > 0.4 ? "#f5a623" : "#e74c3c"
                    }}
                  />
                </div>
                <span className={styles.skillPct}>{Math.round(skill.val * 100)}%</span>
              </div>
            ))}
          </div>
          {recentSubs.length === 0 && (
            <p className={styles.emptyStats}>Chưa có dữ liệu. Làm bài để xem thống kê nhé!</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className={`glass-card ${styles.actionsCard}`}>
          <h2 className={styles.cardTitle}>⚡ Hành động nhanh</h2>
          <div className={styles.actionGrid}>
            {[
              { icon: "📖", label: "Luyện Reading", href: "/practice?skill=Reading" },
              { icon: "🎧", label: "Luyện Listening", href: "/practice?skill=Listening" },
              { icon: "🌳", label: "Xem lộ trình", href: "/roadmap" },
              { icon: "📜", label: "Lịch sử", href: "/history" },
            ].map((a) => (
              <button key={a.href} className={styles.actionBtn} onClick={() => router.push(a.href)}>
                <span>{a.icon}</span>
                <span>{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Results */}
        <div className={`glass-card ${styles.recentCard}`}>
          <h2 className={styles.cardTitle}>📜 Bài làm gần nhất</h2>
          {recentSubs.length === 0 ? (
            <div className={styles.emptyRecent}>
              <p>Bạn chưa làm bài nào.</p>
              <button className="btn btn-primary" onClick={() => router.push("/practice")}>
                Luyện ngay
              </button>
            </div>
          ) : (
            <div className={styles.recentList}>
              {recentSubs.map((s) => (
                <div key={s.id} className={styles.recentItem}>
                  <span className={`badge badge-green`}>{s.skill}</span>
                  <span className={styles.recentTitle}>{s.testTitle}</span>
                  <span className={styles.recentBand}>Band {s.bandScore}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
