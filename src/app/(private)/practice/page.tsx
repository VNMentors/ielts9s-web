"use client";
import { useEffect, useState, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./page.module.css";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

// Question Types based on YouPass Analysis
const READING_TYPES = [
  "Multiple Choice", "True - False - Not Given", "Matching Information", 
  "Matching Features", "Matching Headings", "Gap Filling", 
  "Sentence Completion", "Short Answer Questions"
];

const LISTENING_TYPES = [
  "Gap Filling", "Map, Diagram Label", "Multiple Choice", 
  "Matching Information", "Matching"
];

function PracticeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States cho Filter
  const [skill, setSkill] = useState(searchParams.get("skill") || "Reading");
  const [activeMode, setActiveMode] = useState("Bài lẻ"); // "Full đề" | "Bài lẻ"
  const [selectedPart, setSelectedPart] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All");

  useEffect(() => {
    fetch("/data/tests.json")
      .then(res => res.json())
      .then(data => {
        setTests(data);
        setLoading(false);
      });
  }, []);

  // Logic Lọc (Mock local filtering)
  const filteredItems = useMemo(() => {
    let result: any[] = [];
    
    tests.forEach(test => {
      if (test.skill !== skill) return;

      if (activeMode === "Full đề") {
        // Chỉ lấy những cái matching filter "Full"
        result.push({
          ...test,
          isFull: true,
          displayTitle: test.title,
          displaySubtitle: `${test.parts.length} phần · 40 câu`
        });
      } else {
        // Lấy từng "Part" (Bài lẻ)
        test.parts.forEach((part: any) => {
          // Lọc theo Part number (Passage 1, 2, 3...)
          if (selectedPart !== "All" && part.number.toString() !== selectedPart) return;
          
          // Lọc theo Question Type
          if (selectedType !== "All" && !part.questionTypes.includes(selectedType)) return;

          result.push({
            ...test,
            part,
            isFull: false,
            displayTitle: `${test.title} - Part ${part.number}`,
            displaySubtitle: part.title || "Untitled Part"
          });
        });
      }
    });

    return result;
  }, [tests, skill, activeMode, selectedPart, selectedType]);

  return (
    <>
      <Navbar />
      <div className={`container ${styles.page}`}>
        <div className={styles.layout}>
          {/* Sidebar Filters */}
          <aside className={styles.sidebar}>
            <div className={styles.filterGroup}>
              <h4 className={styles.groupTitle}>Kỹ năng</h4>
              <div className={styles.tabGroup}>
                <button 
                  className={`${styles.tabBtn} ${skill === "Reading" ? styles.tabBtnActive : ""}`}
                  onClick={() => { setSkill("Reading"); setSelectedType("All"); }}
                >Reading</button>
                <button 
                  className={`${styles.tabBtn} ${skill === "Listening" ? styles.tabBtnActive : ""}`}
                  onClick={() => { setSkill("Listening"); setSelectedType("All"); }}
                >Listening</button>
              </div>
            </div>

            <div className={styles.filterGroup}>
              <h4 className={styles.groupTitle}>Chế độ luyện</h4>
              <button 
                className={`${styles.sideLink} ${activeMode === "Bài lẻ" ? styles.sideActive : ""}`}
                onClick={() => setActiveMode("Bài lẻ")}
              >Bài lẻ (Passage/Section)</button>
              <button 
                className={`${styles.sideLink} ${activeMode === "Full đề" ? styles.sideActive : ""}`}
                onClick={() => setActiveMode("Full đề")}
              >Full đề (Mock Test)</button>
            </div>

            {activeMode === "Bài lẻ" && (
              <div className={styles.filterGroup}>
                <h4 className={styles.groupTitle}>{skill === "Reading" ? "Passage" : "Section"}</h4>
                <div className={styles.partGrid}>
                  {["All", "1", "2", "3", "4"].map(p => (
                    <button 
                      key={p} 
                      className={`${styles.partBtn} ${selectedPart === p ? styles.partBtnActive : ""}`}
                      onClick={() => setSelectedPart(p)}
                    >{p === "All" ? "Tất cả" : p}</button>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.filterGroup}>
              <h4 className={styles.groupTitle}>Dạng bài tập</h4>
              <select 
                className={styles.select}
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="All">Tất cả dạng bài</option>
                {(skill === "Reading" ? READING_TYPES : LISTENING_TYPES).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </aside>

          {/* Main Content */}
          <main className={styles.content}>
            <div className={styles.contentHeader}>
              <h2>Kho đề {skill}</h2>
              <p>{filteredItems.length} kết quả được tìm thấy</p>
            </div>

            {loading ? (
              <div className={styles.grid}>
                {[1, 2, 3].map(i => <div key={i} className={styles.skeleton} />)}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className={styles.emptyState}>
                <span>🏜️</span>
                <p>Không tìm thấy đề nào phù hợp với bộ lọc.</p>
              </div>
            ) : (
              <div className={styles.grid}>
                {filteredItems.map((item, idx) => (
                  <div key={idx} className={`glass-card ${styles.testCard}`}>
                    <div className={styles.cardHeader}>
                      <span className={styles.sourceTag}>{item.source}</span>
                      <span className={styles.attempts}>{item.attempts?.toLocaleString()} lượt làm</span>
                    </div>
                    <h3 className={styles.cardTitle}>{item.displayTitle}</h3>
                    <p className={styles.cardSubtitle}>{item.displaySubtitle}</p>
                    
                      <div className={styles.cardTypes}>
                        {item.part?.questionTypes?.map((t: string) => (
                          <span key={t} className={styles.typeTag}>{t}</span>
                        ))}
                      </div>

                    <div className={styles.cardFooter}>
                      <button 
                        className="btn btn-primary"
                        style={{ width: "100%", justifyContent: "center" }}
                        onClick={() => router.push(`/practice/${item.id}`)}
                      >
                        Luyện tập ngay
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<div className={styles.loadingFull}>Đang tải kho đề...</div>}>
      <PracticeContent />
    </Suspense>
  );
}
