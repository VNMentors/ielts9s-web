"use client";
import { useAuth } from "@/hooks/useAuth";
import { getUserProfile } from "@/services/userService";
import { updateTargetBand } from "@/services/userService";
import { useEffect, useState } from "react";
import { UserProfile } from "@/types";
import { logout } from "@/services/authService";
import { useRouter } from "next/navigation";
import { RANKS } from "@/lib/constants";
import styles from "./page.module.css";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [targetBand, setTargetBand] = useState(6.0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading && !user) { router.push("/"); return; }
    if (user) {
      getUserProfile(user.uid).then((p) => {
        if (p) { setProfile(p); setTargetBand(p.targetBand); }
      });
    }
  }, [user, loading]);

  const handleSave = async () => {
    if (!user) return;
    await updateTargetBand(user.uid, targetBand);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (loading || !profile) return <div className={styles.loading}><div className={styles.spinner} /></div>;

  const rankInfo = RANKS.find((r) => r.id === profile.rank) ?? RANKS[0];

  return (
    <div className={`container ${styles.page}`}>
      {/* Profile Card */}
      <div className={`glass-card ${styles.profileCard}`}>
        <img src={profile.photoURL} alt={profile.displayName} className={styles.avatar} />
        <div className={styles.info}>
          <h1 className={styles.name}>{profile.displayName}</h1>
          <p className={styles.email}>{profile.email}</p>
          <div className={styles.rankRow}>
            <span className="badge badge-green">{rankInfo.label}</span>
            <span className={styles.rankLevel}>{rankInfo.level} Level</span>
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Settings */}
        <div className={`glass-card ${styles.settingsCard}`}>
          <h2 className={styles.cardTitle}>⚙️ Cài đặt</h2>
          <div className={styles.field}>
            <label className={styles.label}>Mục tiêu Band score</label>
            <div className={styles.bandPicker}>
              {[5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map((b) => (
                <button key={b}
                  className={`${styles.bandBtn} ${targetBand === b ? styles.bandActive : ""}`}
                  onClick={() => setTargetBand(b)}>
                  {b}
                </button>
              ))}
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleSave}>
            {saved ? "✅ Đã lưu!" : "Lưu thay đổi"}
          </button>
        </div>

        {/* Stats Summary */}
        <div className={`glass-card ${styles.statsCard}`}>
          <h2 className={styles.cardTitle}>📊 Tổng quan kỹ năng</h2>
          <div className={styles.statsList}>
            <div className={styles.statsRow}>
              <span>Reading accuracy</span>
              <span>{Object.values(profile.stats.reading).length > 0
                ? Math.round(Object.values(profile.stats.reading).reduce((a, b) => a + b, 0) / Object.values(profile.stats.reading).length * 100)
                : 0}%</span>
            </div>
            <div className={styles.statsRow}>
              <span>Listening accuracy</span>
              <span>{Object.values(profile.stats.listening).length > 0
                ? Math.round(Object.values(profile.stats.listening).reduce((a, b) => a + b, 0) / Object.values(profile.stats.listening).length * 100)
                : 0}%</span>
            </div>
            <div className={styles.statsRow}>
              <span>Current Rank</span>
              <span style={{ color: "var(--green)" }}>{rankInfo.label}</span>
            </div>
            <div className={styles.statsRow}>
              <span>Target Band</span>
              <span style={{ color: "var(--green)" }}>{profile.targetBand}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className={styles.danger}>
        <button className="btn btn-outline" onClick={handleLogout}>
          🚪 Đăng xuất
        </button>
      </div>
    </div>
  );
}
