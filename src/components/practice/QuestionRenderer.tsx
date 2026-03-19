"use client";
import React from "react";
import GapFill from "./questions/GapFill";
import MultipleChoice from "./questions/MultipleChoice";
import MatchingGrid from "./questions/MatchingGrid";
import MatchingHeadings from "./questions/MatchingHeadings";
import MultiSelect from "./questions/MultiSelect";

interface QuestionProps {
  question?: any;
  group: any;
}

export default function QuestionRenderer({ question, group }: QuestionProps) {
  const qId = question?.id || group.questions?.[0]?.id;

  const renderContent = () => {
    // 1. Integrated Gap Filling
    const templateTypes = ["Note Completion", "Summary Completion", "Sentence Completion", "Gap Filling", "Matching Sentence Endings"];
    if (templateTypes.includes(group.type) && group.template) {
      return <GapFill group={group} />;
    }

    // 2. Matching Grid
    if (group.type === "Matching Information" && group.renderType === "grid") {
      return <MatchingGrid group={group} />;
    }

    // 3. Matching Headings (Source List)
    if (group.type === "Matching Headings" && !question) {
      return <MatchingHeadings group={group} />;
    }

    // 4. Multiple Choice / Boolean / General Selection
    const selectionTypes = ["Multiple Choice", "True - False - Not Given", "Yes - No - Not Given", "Matching Features", "Matching Sentence Endings"];
    if (selectionTypes.includes(group.type) && (question || group.headings || group.options)) {
      const isMulti = group.type === "Multiple Choice" && /TWO|THREE|FOUR/i.test(group.instructions || "");
      if (isMulti) return <MultiSelect group={group} />;
      return <MultipleChoice question={question} group={group} />;
    }

    return null;
  };

  return (
    <div id={`q-box-${qId}`} style={{ scrollMarginTop: '100px', position: 'relative' }}>
      {!question && group.questions?.map((q: any) => (
        <div key={q.id} id={`q-box-${q.id}`} style={{ position: 'absolute', top: '-100px' }} />
      ))}
      {renderContent()}
    </div>
  );
}
