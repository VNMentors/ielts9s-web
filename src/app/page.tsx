"use client";
import { useAuth } from "@/hooks/useAuth";
import { loginWithGoogle } from "@/services/authService";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./page.module.css";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

// Mock Data cho Dashboard (UI First)
const MOCK_STATS = {
  reading: [
    { type: "Summary Completion", total: 7, correct: 0, wrong: 6, skipped: 1, rate: 0 },
    { type: "Matching Information", total: 5, correct: 1, wrong: 1, skipped: 3, rate: 20 },
    { type: "Matching", total: 9, correct: 3, wrong: 1, skipped: 5, rate: 33.33 },
    { type: "True - False - Not Given", total: 6, correct: 2, wrong: 4, skipped: 0, rate: 33.33 },
  ],
  listening: [
    { type: "Form Completion", total: 10, correct: 8, wrong: 2, skipped: 0, rate: 80 },
    { type: "Multiple Choice", total: 5, correct: 2, wrong: 3, skipped: 0, rate: 40 },
  ]
};

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeSkill, setActiveSkill] = useState<"Reading" | "Listening">("Reading");
  const [activeTab, setActiveTab] = useState("Theo dạng câu hỏi");

  const handleStart = async () => {
    if (!user) {
      await loginWithGoogle();
    }
  };

  if (loading) {
    return <div className={styles.loadingFull}>Đang tải...</div>;
  }

  // --- RENDER DASHBOARD (KHI ĐÃ ĐĂNG NHẬP) ---
  if (user) {
    const data = activeSkill === "Reading" ? MOCK_STATS.reading : MOCK_STATS.listening;

    return (
      <>
        <Navbar />
        <main className={styles.dashboardMain}>
          <div className="container">
            <header className={styles.dbHeader}>
              <h1><span className={styles.clockIcon}>🕒</span> Lịch sử làm bài</h1>
            </header>

            <div className={styles.dbCard}>
              {/* Skill Switcher */}
              <div className={styles.skillTabs}>
                <button 
                  className={`${styles.skillTab} ${activeSkill === "Reading" ? styles.skillTabActive : ""}`}
                  onClick={() => setActiveSkill("Reading")}
                >
                  📖 Reading
                </button>
                <button 
                  className={`${styles.skillTab} ${activeSkill === "Listening" ? styles.skillTabActive : ""}`}
                  onClick={() => setActiveSkill("Listening")}
                >
                  🎧 Listening
                </button>
              </div>

              {/* Sub Tabs */}
              <div className={styles.subTabs}>
                {["Theo tên bài", "Theo dạng câu hỏi", "Theo passage"].map(tab => (
                  <button 
                    key={tab}
                    className={`${styles.subTab} ${activeTab === tab ? styles.subTabActive : ""}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Stats Table */}
              <div className={styles.tableWrapper}>
                <table className={styles.statsTable}>
                  <thead>
                    <tr>
                      <th>Loại câu hỏi</th>
                      <th>Tổng số câu</th>
                      <th className={styles.textCenter}>Đúng</th>
                      <th className={styles.textCenter}>Sai</th>
                      <th className={styles.textCenter}>Bỏ qua</th>
                      <th>Tỉ lệ đúng</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, i) => (
                      <tr key={i}>
                        <td className={styles.typeName}>{row.type}</td>
                        <td className={styles.textCenter}>{row.total}</td>
                        <td className={styles.textCenter}>
                          <span className={`${styles.countBox} ${styles.correctBox}`}>{row.correct}</span>
                        </td>
                        <td className={styles.textCenter}>
                          <span className={`${styles.countBox} ${styles.wrongBox}`}>{row.wrong}</span>
                        </td>
                        <td className={styles.textCenter}>
                          <span className={`${styles.countBox} ${styles.skippedBox}`}>{row.skipped}</span>
                        </td>
                        <td>
                          <div className={styles.rateCol}>
                            <span className={styles.rateValue}>{row.rate} %</span>
                            <div className={styles.progressTrack}>
                              <div className={styles.progressFill} style={{ width: `${row.rate}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className={styles.textRight}>
                          <button className={styles.linkAction} onClick={() => router.push("/practice")}>
                            Luyện tập thêm
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // --- RENDER GUEST VIEW (KHI CHƯA ĐĂNG NHẬP) ---
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className="container">
            <div className={styles.heroContent}>
              <h1 className={styles.title}>
                Tự học IELTS hiệu quả <br />
                <span className={styles.highlight}>theo giải pháp thông minh</span>
              </h1>
              <p className={styles.subtitle}>
                Nền tảng hỗ trợ luyện tập Reading & Listening hoàn toàn miễn phí. 
                Đơn giản, tinh tế và tập trung vào hiệu quả học tập của bạn.
              </p>
              <div className={styles.ctaGroup}>
                <button onClick={handleStart} className="btn btn-primary btn-lg">
                  🚀 Bắt đầu luyện tập ngay
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.features}>
          <div className="container">
            <div className={styles.featureGrid}>
              <div className={styles.featureItem}>
                <span className={styles.featureIcon}>📖</span>
                <h3>Phòng luyện Reading</h3>
                <p>Giao diện split-screen chuyên nghiệp, giải chi tiết từng câu.</p>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureIcon}>🎧</span>
                <h3>Phòng luyện Listening</h3>
                <p>Audio chất lượng cao, có transcript và highlight từ khóa.</p>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureIcon}>📊</span>
                <h3>Thống kê kết quả</h3>
                <p>Theo dõi sát sao từng dạng bài để cải thiện kỹ năng yếu nhất.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
