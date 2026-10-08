import React, { useState } from 'react';
import { DEBATE_TOPICS } from '../data/historyData';
import { DebateTopic, HistoricalSource } from '../types';
import { ScrollText, BookOpen, Check, BookmarkPlus, ArrowRight, Lightbulb, FileSpreadsheet } from 'lucide-react';

interface IssueExplorerProps {
  selectedTopic: DebateTopic;
  onSelectTopic: (topic: DebateTopic) => void;
  selectedStance: string;
  onSelectStance: (stance: string) => void;
  savedEvidenceIds: string[];
  onToggleSaveEvidence: (sourceId: string) => void;
  userNotes: string;
  onChangeUserNotes: (notes: string) => void;
  onGoNext: () => void;
}

export const IssueExplorer: React.FC<IssueExplorerProps> = ({
  selectedTopic,
  onSelectTopic,
  selectedStance,
  onSelectStance,
  savedEvidenceIds,
  onToggleSaveEvidence,
  userNotes,
  onChangeUserNotes,
  onGoNext,
}) => {
  const [selectedSource, setSelectedSource] = useState<HistoricalSource>(selectedTopic.sources[0]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Step 1 Introduction banner */}
      <div className="bg-stone-100/80 border border-stone-200/90 rounded-xl p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
              <ScrollText className="w-4 h-4" />
              <span>1단계 · 쟁점 파악 및 1차 사료 교차 탐색</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 tracking-tight">
              단편적 암기를 넘어 역사적 논쟁 속으로
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 max-w-3xl leading-relaxed">
              교과서가 전하는 한 줄의 결론 뒤에는 치열한 사료 해석과 학술적 논쟁이 숨어 있습니다.
              탐구할 쟁점을 선택하고, 양측의 연구 논문과 핵심 1차 사료를 비판적으로 검토해 보세요.
            </p>
          </div>

          <div className="bg-white px-4 py-2.5 rounded-lg border border-stone-200 text-xs text-stone-600 shadow-2xs shrink-0">
            <span className="font-semibold text-stone-900">담은 사료:</span>{' '}
            <span className="font-mono font-bold text-emerald-700">{savedEvidenceIds.length}개</span>
          </div>
        </div>

        {/* Topic Selector Tabs */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {DEBATE_TOPICS.map((topic) => {
            const isSelected = selectedTopic.id === topic.id;
            return (
              <button
                key={topic.id}
                onClick={() => {
                  onSelectTopic(topic);
                  setSelectedSource(topic.sources[0]);
                }}
                className={`text-left p-3.5 rounded-lg border transition-all text-xs flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-700 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-700'
                    : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50'
                }`}
              >
                <div>
                  <span className="text-[11px] font-mono text-stone-500 block mb-1">
                    {topic.id === 'topic_statehood' ? '쟁점 01' : topic.id === 'topic_era_naming' ? '쟁점 02' : '쟁점 03'}
                  </span>
                  <h3 className="font-bold text-stone-900 text-xs sm:text-sm leading-snug font-serif">
                    {topic.title}
                  </h3>
                </div>
                <p className="text-[11px] text-stone-500 mt-2 line-clamp-1">
                  {topic.subtitle}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Topic Detail & Stance Choice */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Debate Question & Two Stances (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-stone-500">
              <FileSpreadsheet className="w-3.5 h-3.5 text-stone-400" />
              <span>{selectedTopic.curriculumRef}</span>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-emerald-800">핵심 탐구 질문</span>
              <h3 className="text-base sm:text-lg font-bold font-serif text-stone-900 leading-snug">
                "{selectedTopic.question}"
              </h3>
            </div>

            {/* Two Stance Cards */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Stance A */}
              <div
                onClick={() => onSelectStance('stanceA')}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedStance === 'stanceA'
                    ? 'border-emerald-700 bg-emerald-50/60 ring-2 ring-emerald-600/30'
                    : 'border-stone-200 bg-stone-50/60 hover:bg-stone-100/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-stone-900 font-serif">
                    입장 A: {selectedTopic.stanceA.label}
                  </span>
                  {selectedStance === 'stanceA' && (
                    <span className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {selectedTopic.stanceA.description}
                </p>
                <div className="mt-3 pt-2 border-t border-stone-200 text-[11px] text-stone-500">
                  <span className="font-semibold text-stone-700">근거 연구:</span> {selectedTopic.stanceA.keyScholar} (『{selectedTopic.stanceA.keyPaper}』)
                </div>
              </div>

              {/* Stance B */}
              <div
                onClick={() => onSelectStance('stanceB')}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedStance === 'stanceB'
                    ? 'border-emerald-700 bg-emerald-50/60 ring-2 ring-emerald-600/30'
                    : 'border-stone-200 bg-stone-50/60 hover:bg-stone-100/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-stone-900 font-serif">
                    입장 B: {selectedTopic.stanceB.label}
                  </span>
                  {selectedStance === 'stanceB' && (
                    <span className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {selectedTopic.stanceB.description}
                </p>
                <div className="mt-3 pt-2 border-t border-stone-200 text-[11px] text-stone-500">
                  <span className="font-semibold text-stone-700">근거 연구:</span> {selectedTopic.stanceB.keyScholar} (『{selectedTopic.stanceB.keyPaper}』)
                </div>
              </div>
            </div>

            <div className="text-xs text-stone-500 italic pt-1 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
              <span>원하는 입장을 클릭하여 선택하면 이후 AI 토론과 입론서 작성에 연동됩니다.</span>
            </div>
          </div>

          {/* Student Initial Hypothesis (Good조 윤리 1: AI에게 묻기 전에 내 생각 먼저 적기) */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-800" />
                <h4 className="text-sm font-bold text-stone-900">
                  나의 초기 가설과 생각 먼저 적기
                </h4>
              </div>
              <span className="text-[11px] text-emerald-800 font-medium bg-emerald-100/60 px-2 py-0.5 rounded">
                생성형 AI 활용 전 필수 작성
              </span>
            </div>
            <p className="text-xs text-stone-600">
              Good조 윤리 규정에 따라, AI의 도움을 받기 전 사료를 보고 떠오른 나의 초기 생각을 자유롭게 정리합니다.
            </p>
            <textarea
              value={userNotes}
              onChange={(e) => onChangeUserNotes(e.target.value)}
              placeholder="예: 지산동 고분군의 순장 규모와 남제서의 하지왕 기록을 보면 단순한 연맹체로만 보기는 어렵다고 생각한다. 그러나 불교나 율령 기록이 명확하지 않은 점은 반대측의 강력한 반론 포인트가 될 것 같다..."
              rows={4}
              className="w-full text-xs p-3 rounded-lg border border-stone-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-hidden leading-relaxed text-stone-800 bg-white"
            />
          </div>
        </div>

        {/* Right Column: Historical Sources Explorer (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-2">
                <ScrollText className="w-4 h-4 text-emerald-800" />
                <span>쟁점 관련 사료 라이브러리</span>
              </h3>
              <span className="text-xs text-stone-500 font-mono">
                {selectedTopic.sources.length}건 수록
              </span>
            </div>

            {/* Source selector buttons */}
            <div className="flex flex-wrap gap-1.5">
              {selectedTopic.sources.map((src, idx) => {
                const isCurrent = selectedSource?.id === src.id;
                const isSaved = savedEvidenceIds.includes(src.id);
                return (
                  <button
                    key={src.id}
                    onClick={() => setSelectedSource(src)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      isCurrent
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    <span>사료 0{idx + 1}</span>
                    {isSaved && <Check className="w-3 h-3 text-emerald-400" />}
                  </button>
                );
              })}
            </div>

            {/* Source Details Card */}
            {selectedSource && (
              <div className="border border-stone-200 rounded-lg p-4 bg-stone-50/50 space-y-3 text-xs">
                <div className="flex items-start justify-between gap-2 border-b border-stone-200 pb-2">
                  <div>
                    <span className="text-[11px] font-mono text-emerald-800 font-semibold">
                      [{selectedSource.category}] · {selectedSource.dateOrPeriod}
                    </span>
                    <h4 className="font-bold text-stone-900 text-sm font-serif mt-0.5">
                      {selectedSource.title}
                    </h4>
                  </div>
                  <button
                    onClick={() => onToggleSaveEvidence(selectedSource.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors shrink-0 ${
                      savedEvidenceIds.includes(selectedSource.id)
                        ? 'bg-emerald-700 text-white font-medium'
                        : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>{savedEvidenceIds.includes(selectedSource.id) ? '보관됨' : '사료 담기'}</span>
                  </button>
                </div>

                {/* Source raw content */}
                <div className="bg-white p-3 rounded border border-stone-200 font-serif leading-relaxed text-stone-900 text-xs italic">
                  {selectedSource.content}
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="font-semibold text-stone-800 block text-[11px] mb-0.5">
                      역사적 의의 및 해석:
                    </span>
                    <p className="text-stone-600 leading-relaxed">
                      {selectedSource.significance}
                    </p>
                  </div>

                  <div className="bg-amber-50/80 p-2.5 rounded border border-amber-200/80">
                    <span className="font-semibold text-amber-900 block text-[11px] mb-0.5">
                      💡 토론 탐구 포인트 (Inquiry Tip):
                    </span>
                    <p className="text-amber-950 leading-relaxed">
                      {selectedSource.inquiryTip}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action to proceed */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={onGoNext}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <span>2단계: 사학자 페르소나 인터뷰로 이동</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
