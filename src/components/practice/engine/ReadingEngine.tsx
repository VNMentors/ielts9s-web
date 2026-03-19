"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import styles from "./ReadingEngine.module.css";
import { usePracticeStore } from "@/store/practiceStore";
import SplitPane from "../layout/SplitPane";
import QuestionRenderer from "../QuestionRenderer";
import PassageRenderer from "../PassageRenderer";
import { NotePopover, NotesList } from "../NotePopover";

interface Note {
  id: string;
  selectedText: string;
  noteText: string;
  createdAt: string;
}

const HIGHLIGHT_COLORS = [
  { id: "yellow", color: "#fff3cd", label: "Yellow" },
  { id: "green", color: "#d4edda", label: "Green" },
  { id: "pink", color: "#f8d7da", label: "Pink" },
];

export default function ReadingEngine({ test, onFinish }: { test: any; onFinish: () => void }) {
  const { answers, setAnswer } = usePracticeStore();
  const [activePartIndex, setActivePartIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3600);
  const [bookmarked, setBookmarked] = useState<Set<number>>(new Set());
  const [currentQId, setCurrentQId] = useState(1);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [menuMode, setMenuMode] = useState<"main" | "colors">("main");
  const [selectionText, setSelectionText] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [showNotePopover, setShowNotePopover] = useState(false);
  const [showNotesList, setShowNotesList] = useState(false);
  const [notePos, setNotePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const allQuestionIds = useMemo(() => {
    const ids: number[] = [];
    test.parts.forEach((part: any) =>
      part.questionGroups.forEach((group: any) =>
        group.questions.forEach((q: any) => ids.push(q.id))
      )
    );
    return ids.sort((a, b) => a - b);
  }, [test.parts]);

  const partRanges = useMemo(() => {
    return test.parts.map((part: any) => {
      let min = Infinity;
      let max = -Infinity;
      part.questionGroups.forEach((group: any) =>
        group.questions.forEach((q: any) => {
          min = Math.min(min, q.id);
          max = Math.max(max, q.id);
        })
      );
      return { min, max, total: max - min + 1 };
    });
  }, [test.parts]);

  // Auto-switch part and scroll
  useEffect(() => {
    const partIndex = test.parts.findIndex((part: any) =>
      part.questionGroups.some((group: any) =>
        group.questions.some((q: any) => q.id === currentQId)
      )
    );
    if (partIndex !== -1 && partIndex !== activePartIndex) setActivePartIndex(partIndex);
    setTimeout(() => {
      // Find the element for this question or fallback to group box
      const el = document.getElementById(`q-box-${currentQId}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  }, [currentQId, test.parts]);

  // Handle selection continuously to catch any generic text selection
  useEffect(() => {
    const onSelectionChange = () => {
      const sel = window.getSelection();
      if (sel && sel.toString().trim().length > 0) {
        if (sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          // Filter out clicks on inputs, buttons, etc.
          if (rect.width > 0 && rect.height > 0) {
             setSelectionText(sel.toString().trim());
             setMenuPos({ x: rect.left + rect.width / 2, y: rect.top });
             setMenuMode("main");
          }
        }
      }
    };
    
    // Debounce the selection change slightly to avoid UI flicker
    let timeout: any;
    const debouncedSelectionChange = () => {
      clearTimeout(timeout);
      timeout = setTimeout(onSelectionChange, 200);
    };

    document.addEventListener("selectionchange", debouncedSelectionChange);
    return () => document.removeEventListener("selectionchange", debouncedSelectionChange);
  }, []);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    document.body.style.overflow = "hidden";
    return () => {
      clearInterval(timer);
      document.body.style.overflow = "auto";
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const toggleBookmark = (id: number) => {
    setBookmarked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.toString().trim().length > 0) {
      if (sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (rect.width > 0) {
          setSelectionText(sel.toString().trim());
          setMenuPos({ x: rect.left + rect.width / 2, y: rect.top });
          setMenuMode("main");
          setShowNotePopover(false);
        }
      }
    } else {
      setMenuPos(null);
      setSelectionText("");
    }
  }, []);

  const handleHighlight = useCallback((color: string) => {
    document.execCommand("backColor", false, color);
    setMenuPos(null);
    setMenuMode("main");
    window.getSelection()?.removeAllRanges();
  }, []);

  const handleNoteClick = useCallback(() => {
    if (!menuPos) return;
    setNotePos(menuPos);
    setShowNotePopover(true);
    setMenuPos(null);
    window.getSelection()?.removeAllRanges();
  }, [menuPos]);

  const handleSaveNote = useCallback((note: Note) => {
    setNotes((prev) => [note, ...prev]);
    setShowNotePopover(false);
  }, []);

  const handleDeleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const handleNext = () => {
    if (currentQId < allQuestionIds[allQuestionIds.length - 1]) setCurrentQId(currentQId + 1);
  };
  const handleBack = () => {
    if (currentQId > allQuestionIds[0]) setCurrentQId(currentQId - 1);
  };

  const getPartProgress = (partIdx: number) => {
    const part = test.parts[partIdx];
    let answered = 0;
    let total = 0;
    part?.questionGroups.forEach((g: any) =>
      g.questions.forEach((q: any) => {
        total++;
        if (answers[String(q.id)]) answered++;
      })
    );
    return { answered, total };
  };

  const activePart = test.parts[activePartIndex];

  return (
    <div
      className={styles.engineContainer}
      onMouseUp={handleSelection}
      onClick={() => {
        const sel = window.getSelection();
        if (!sel || sel.toString().trim().length === 0) {
          setMenuPos(null);
        }
      }}
    >
      {/* TOP BAR */}
      <header className={styles.topBar}>
        <div className={styles.barLeft}>
          <div className={styles.brandIcon}>9s</div>
          <div className={styles.testInfo}>
            <span className={styles.testTitle}>{test.title || "IELTS Reading"}</span>
          </div>
        </div>
        <div className={`${styles.timer} ${timeLeft < 600 ? styles.timeWarning : ""}`}>
          <span className={styles.timeVal}>{formatTime(timeLeft)}</span>
          <span className={styles.timerSub}>Time Left</span>
        </div>
        <div className={styles.barRight}>
          <button
            className={`${styles.iconBtn} ${styles.noteBadgeBtn}`}
            title="View Notes"
            onClick={() => setShowNotesList(true)}
          >
            📓
            {notes.length > 0 && (
              <span className={styles.noteBadge}>{notes.length}</span>
            )}
          </button>
          <button className={styles.iconBtn} title="Help">❓</button>
          <button
            className={styles.finishBtn}
            onClick={onFinish}
          >
            Finish Test
          </button>
        </div>
      </header>

      {/* SELECTION CONTEXT MENU */}
      {menuPos && !showNotePopover && (
        <div
          className={styles.highlightMenu}
          style={{ top: menuPos.y, left: menuPos.x, transform: "translateX(-50%) translateY(calc(-100% - 12px))" }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {menuMode === "main" ? (
            <>
              <button className={styles.menuItem} onClick={handleNoteClick}>
                <span className={styles.menuIcon}>📝</span> Add Note
              </button>
              <button className={styles.menuItem} onClick={() => setMenuMode("colors")}>
                <span className={styles.menuIcon}>🖊️</span> Highlight
              </button>
            </>
          ) : (
            <div className={styles.colorPicker}>
              {HIGHLIGHT_COLORS.map((c) => (
                <button
                  key={c.id}
                  className={styles.colorSwatch}
                  style={{ background: c.color }}
                  title={c.label}
                  onClick={() => handleHighlight(c.color)}
                />
              ))}
              <button className={styles.colorSwatch} style={{ background: "transparent", border: "1.5px solid #ccc", fontSize: "0.7rem", color: "#888" }} onClick={() => handleHighlight("transparent")} title="Remove">✕</button>
            </div>
          )}
        </div>
      )}

      {/* NOTE POPOVER */}
      {showNotePopover && (
        <NotePopover
          position={notePos}
          selectedText={selectionText}
          notes={notes}
          onClose={() => setShowNotePopover(false)}
          onSaveNote={handleSaveNote}
        />
      )}

      {/* NOTES LIST */}
      {showNotesList && (
        <NotesList
          notes={notes}
          onClose={() => setShowNotesList(false)}
          onDelete={handleDeleteNote}
        />
      )}

      {/* MAIN SPLIT PANE */}
      <main className={styles.mainLayout}>
        <SplitPane
          left={
            <div className={styles.paneContent}>
              <div className={styles.partHeaderBox}>
                <h3>Part {activePart.number}</h3>
                <p>Read the text and answer Questions {partRanges[activePartIndex]?.min}–{partRanges[activePartIndex]?.max}</p>
              </div>
              <div className={styles.passageWrapper}>
                <h1 className={styles.passageTitle}>{activePart.title}</h1>
                <PassageRenderer
                  html={activePart.passageHtml}
                  answers={answers}
                  onDrop={setAnswer}
                />
              </div>
            </div>
          }
          right={
            <div className={styles.paneContent}>
              {activePart.questionGroups.map((group: any) => (
                <div key={group.id} className={styles.qGroup}>
                  <div className={styles.groupHeader}>
                    <h3>
                      {group.type}
                      <span className={styles.qRange}> (Questions {group.range})</span>
                    </h3>
                    <p className={styles.instructions}>{group.instructions}</p>
                  </div>
                  {(() => {
                    const templateTypes = ["Note Completion", "Summary Completion", "Sentence Completion", "Gap Filling", "Matching Sentence Endings"];
                    const isGrid = group.type === "Matching Information" && group.renderType === "grid";
                    const isHeadings = group.type === "Matching Headings";
                    const isMulti = group.type === "Multiple Choice" && /TWO|THREE|FOUR/i.test(group.instructions || "");
                    const isGroupLevel = templateTypes.includes(group.type) || isGrid || isHeadings || isMulti;

                    if (isGroupLevel) {
                      return (
                        <div className={styles.qItemWithBookmark}>
                          <div style={{ flex: 1 }}>
                            <QuestionRenderer group={group} />
                            <div className={styles.groupBookmarks} style={{ marginTop: '16px', borderTop: '1px solid #eee', paddingTop: '12px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                              <span style={{ fontSize: '0.8rem', color: '#888', marginRight: '4px' }}>Bookmarks:</span>
                              {group.questions.map((q: any) => (
                                <button
                                  key={q.id}
                                  className={`${styles.bookmarkBtn} ${bookmarked.has(q.id) ? styles.bookmarkActive : ""}`}
                                  onClick={() => toggleBookmark(q.id)}
                                  title={`Bookmark Question ${q.id}`}
                                  style={{ padding: '2px 8px', fontSize: '0.85rem', background: '#fff', border: '1px solid #e0e0e0', borderRadius: '4px' }}
                                >
                                  <span style={{ fontSize: '0.8rem', marginRight: '4px', color: '#555', fontWeight: 600 }}>{q.id}</span>
                                  {bookmarked.has(q.id) ? "🔖" : "🏳"}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return group.questions.map((q: any) => (
                      <div key={q.id} className={styles.qItemWithBookmark}>
                        <div style={{ flex: 1 }}>
                          <QuestionRenderer question={q} group={group} />
                        </div>
                        <button
                          className={`${styles.bookmarkBtn} ${bookmarked.has(q.id) ? styles.bookmarkActive : ""}`}
                          onClick={() => toggleBookmark(q.id)}
                          title={bookmarked.has(q.id) ? "Remove bookmark" : "Bookmark this question"}
                        >
                          {bookmarked.has(q.id) ? "🔖" : "🏳"}
                        </button>
                      </div>
                    ));
                  })()}
                </div>
              ))}
            </div>
          }
        />
      </main>

      {/* FOOTER NAV */}
      <footer className={styles.bottomBar}>
        <button
          className={styles.navBtn}
          onClick={handleBack}
          disabled={currentQId === allQuestionIds[0]}
        >
          ← Back
        </button>

        <div className={styles.footerSegments}>
          {test.parts.map((_: any, idx: number) => {
            const prog = getPartProgress(idx);
            const isActive = activePartIndex === idx;
            return (
              <div
                key={idx}
                className={`${styles.partSegment} ${isActive ? styles.activePartSegment : ""}`}
                onClick={() => setCurrentQId(partRanges[idx].min)}
              >
                <span className={styles.partLabel}>Part {idx + 1}</span>
                {isActive ? (
                  <div className={styles.qNavContainer}>
                    {allQuestionIds
                      .filter((id) => id >= partRanges[idx].min && id <= partRanges[idx].max)
                      .map((id) => {
                        const isAnswered = !!answers[String(id)];
                        const isCurrent = currentQId === id;
                        const isBookmarked = bookmarked.has(id);
                        return (
                          <div
                            key={id}
                            className={`${styles.qNavItem}
                              ${isCurrent ? styles.qNavItemActive : ""}
                              ${isAnswered && !isCurrent ? styles.qNavItemAnswered : ""}
                              ${isBookmarked ? styles.qNavItemBookmarked : ""}
                            `}
                            onClick={(e) => { e.stopPropagation(); setCurrentQId(id); }}
                            title={isBookmarked ? "Bookmarked" : undefined}
                          >
                            {id}
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <span className={styles.partProgress}>
                    {prog.answered}/{prog.total}
                    <span className={styles.partProgressLabel}> answered</span>
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <button
          className={styles.navBtn}
          onClick={handleNext}
          disabled={currentQId === allQuestionIds[allQuestionIds.length - 1]}
        >
          Next →
        </button>
      </footer>
    </div>
  );
}
