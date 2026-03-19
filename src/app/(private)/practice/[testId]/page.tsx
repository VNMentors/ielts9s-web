"use client";
import { useEffect, useState, useMemo } from "react";
import { usePracticeStore } from "@/store/practiceStore";
import { useCountdown } from "@/hooks/useCountdown";
import { useAuth } from "@/hooks/useAuth";
import { useParams, useRouter } from "next/navigation";
import ReadingEngine from "@/components/practice/engine/ReadingEngine";
import styles from "./page.module.css";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { getBandScore } from "@/lib/constants";

export default function TestPage() {
  const { testId } = useParams<{ testId: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const { answers, setAnswer, startTest, clearTest } = usePracticeStore();
  
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isStarted, setIsStarted] = useState(false);
  const [selectedPartIndex, setSelectedPartIndex] = useState<number | null>(null); 
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetch("/data/tests.json")
      .then(res => res.json())
      .then(data => {
        const found = data.find((t: any) => t.id === testId);
        if (found) setTest(found);
        setLoading(false);
      });
    return () => clearTest();
  }, [testId, clearTest]);

  const duration = test?.skill === "Reading" ? 3600 : 1800;
  const { display, start, timeLeft } = useCountdown(duration);

  const handleStart = (partIndex: number | null = null) => {
    setSelectedPartIndex(partIndex);
    setIsStarted(true);
    startTest(testId);
    start();
  };

  const handleSubmit = () => {
    if (!test || !test.answerKey) {
      setResult({ score: 0, band: 0, answers });
      return;
    }

    let correctCount = 0;
    Object.keys(test.answerKey).forEach(qId => {
      const userAnswer = answers[qId]?.trim().toLowerCase();
      const correctAnswer = test.answerKey[qId]?.trim().toLowerCase();
      if (userAnswer === correctAnswer) {
        correctCount++;
      }
    });

    setResult({ 
      score: correctCount, 
      band: getBandScore(correctCount), 
      answers 
    });
  };

  if (loading) return <div className={styles.loadingFull}>Đang chuẩn bị phòng luyện...</div>;

  if (!test) return (
    <div className={styles.notFound}>
      <p>Không tìm thấy bài thi này.</p>
      <button className="btn btn-primary" onClick={() => router.push("/practice")}>Quay lại kho đề</button>
    </div>
  );

  // --- LOBBY VIEW ---
  if (!isStarted && !result) {
    return (
      <div className={styles.lobbyOuter}>
        <Navbar />
        <main className={styles.lobbyMain} style={{ paddingTop: "100px", paddingBottom: "100px" }}>
          <div className="container">
            <div className={styles.lobbyCard}>
              <div className={styles.lobbyHeader}>
                <span className={styles.skillBadge}>{test.skill}</span>
                <h1 className={styles.testTitle}>{test.title}</h1>
                <div className={styles.quickStats}>
                   <span>⏱ {test.skill === "Reading" ? "60 phút" : "30 phút"}</span>
                   <span>📊 {test.parts.length} phần</span>
                   <span>📝 40 câu hỏi</span>
                </div>
              </div>
              
              <div className={styles.partsSection}>
                <h2 className={styles.sectionTitle}>Cấu trúc đề thi</h2>
                <div className={styles.partList}>
                  {test.parts.map((part: any, idx: number) => (
                    <div key={idx} className={styles.partItem}>
                      <div className={styles.partInfo}>
                        <h3>{test.skill === "Reading" ? "Passage" : "Section"} {part.number}</h3>
                        <p>{part.title || "Untitled"}</p>
                        <div className={styles.typeTags}>
                           {part.questionTypes?.map((t: string) => (
                             <span key={t} className={styles.typeTag}>{t}</span>
                           ))}
                        </div>
                      </div>
                      <button className="btn btn-outline" onClick={() => handleStart(idx)}>Luyện riêng Part này</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.lobbyFooter}>
                <button className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => handleStart(null)}>
                  🚀 Bắt đầu làm FULL đề
                </button>
                <p className={styles.footerNote}>Sẵn sàng chưa? Kết quả sẽ được lưu vào lịch sử của bạn.</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // --- READING ENGINE (Match Official CD IELTS) ---
  if (test.skill === "Reading" && isStarted && !result) {
    return (
      <ReadingEngine 
        test={test} 
        onFinish={() => {
          handleSubmit(); 
        }}
      />
    );
  }

  // --- RESULT VIEW ---
  if (result) {
    return (
       <div className={styles.resultPage}>
          <div className="container">
            <div className={`glass-card ${styles.resultCard}`}>
              <h1>Kết quả của bạn</h1>
              <div className={styles.resultMain}>
                <div className={styles.bigScore}>{result.score}/40</div>
                <div className={styles.bigBand}>Band {result.band}</div>
              </div>
              <p>Thống kê chi tiết sẽ được cập nhật tại Dashboard.</p>
              <button className="btn btn-primary" onClick={() => router.push("/practice")}>Làm bài khác</button>
            </div>
          </div>
       </div>
    );
  }

  return (
    <div className={styles.engineContainer}>
       <header className={styles.engineHeader}>
          <button onClick={() => setIsStarted(false)}>← Thoát</button>
          <span>Listening Engine (Placeholder)</span>
          <span className={styles.timeLeft}>⏱ {display}</span>
       </header>
       <main className={styles.engineMain}>
          <p>Giao diện Listening đang được tích hợp...</p>
          <button onClick={handleSubmit} className="btn btn-primary">Giả lập nộp bài</button>
       </main>
    </div>
  );
}
