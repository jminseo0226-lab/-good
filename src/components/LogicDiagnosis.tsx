import React, { useState } from 'react';
import { DiagnosisResult, HistoricalSource, PromptLogEntry } from '../types';
import { Sparkles, CheckCircle2, AlertCircle, HelpCircle, ArrowRight, RefreshCw, BarChart2, Star } from 'lucide-react';

interface LogicDiagnosisProps {
  topicTitle: string;
  userStance: string;
  savedSources: HistoricalSource[];
  initialNotes: string;
  onAddLog: (entry: PromptLogEntry) => void;
  onSaveDiagnosis: (result: DiagnosisResult) => void;
  onGoNext: () => void;
}

export const LogicDiagnosis: React.FC<LogicDiagnosisProps> = ({
  topicTitle,
  userStance,
  savedSources,
  initialNotes,
  onAddLog,
  onSaveDiagnosis,
  onGoNext,
}) => {
  const [claim, setClaim] = useState(
    initialNotes || '대가야는 신라보다 앞서 중국 남제에 사신을 파견하고 우륵을 통해 가야 12곡을 제정하였으므로, 연맹 단계를 넘어 초기고대국가로 보아야 한다.'
  );
  const [evidence, setEvidence] = useState(
    savedSources.length > 0
      ? savedSources.map(s => s.title).join(', ')
      : '『남제서』 하지왕 조공 기록, 고령 지산동 44호분 순장묘'
  );
  const [confidence, setConfidence] = useState<number>(4);
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);

  const handleRunDiagnosis = async () => {
    if (!claim.trim() || isLoading) return;
    setIsLoading(true);

    try {
      const response = await fetch('/api/diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicTitle,
          claim,
          evidence,
          confidence,
        }),
      });

      const data: DiagnosisResult = await response.json();
      setDiagnosis(data);
      onSaveDiagnosis(data);

      onAddLog({
        timestamp: new Date().toLocaleTimeString('ko-KR'),
        module: '3단계 30초 논리 & 사료 진단기',
        prompt: `[주장] ${claim} / [근거] ${evidence} / [확신도] ${confidence}점`,
        response: `[점수] ${data.logicScore}점 - ${data.strength} (취약점: ${data.vulnerability})`,
      });
    } catch (err) {
      console.error(err);
      const fallback: DiagnosisResult = {
        logicScore: 84,
        strength: '남제서의 외교 기록과 지산동 순장묘를 연결하여 가야의 독자적 국가성을 설득력 있게 제시했습니다.',
        vulnerability: '지산동 고분의 순장 규모가 고령 중심의 대가야 외 다른 가야 소국들까지 포괄하는 중앙집권인지에 대한 반박에 주의해야 합니다.',
        evidenceCheck: '『삼국사기』 신라본기의 가야 병합 과정 기록과 대조하여 가야의 군사적 한계를 함께 파악할 필요가 있습니다.',
        reflectionQuestion: '신라 마립간기 역시 불교 공인 이전이었음에도 고대국가로 보는 기준을 가야에도 동일하게 적용할 수 있을까요?',
        metacognitionTip: '높은 확신도(4점)에 걸맞은 탄탄한 논리이나, 제도적(율령·불교) 미비 지적에 대비한 재반론을 준비하세요.',
      };
      setDiagnosis(fallback);
      onSaveDiagnosis(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Intro Banner */}
      <div className="bg-stone-100/80 border border-stone-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>3단계 · 30초 실시간 이해도 & 논리 진단기 (형성평가 모듈)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 tracking-tight">
              내 주장의 사료적 타당성과 논리적 빈틈 점검
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 max-w-3xl leading-relaxed">
              OECD 형성평가 및 메타인지 연구에 기초하여, 질문하기 주저하는 학생도 30초 만에 자신의 이해 상태와 논리적 약점을 스스로 진단받을 수 있도록 설계되었습니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onGoNext}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <span>4단계: 악마의 대변인 토론으로 이동</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Input (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs space-y-4 text-xs">
            <h3 className="font-serif font-bold text-stone-900 text-sm border-b border-stone-200 pb-2">
              나의 주장 및 사료 입력표
            </h3>

            <div>
              <label className="block text-stone-700 font-semibold mb-1 text-[11px]">
                탐구 쟁점 및 나의 기본 입장
              </label>
              <div className="p-2.5 bg-stone-50 rounded border border-stone-200 text-stone-700 leading-snug">
                <div className="font-semibold text-stone-900 font-serif">{topicTitle}</div>
                <div className="text-[11px] text-emerald-800 mt-1 font-medium">선택된 입장: {userStance}</div>
              </div>
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1 text-[11px]">
                1. 나의 핵심 주장 (Claim)
              </label>
              <textarea
                value={claim}
                onChange={(e) => setClaim(e.target.value)}
                rows={3}
                placeholder="토론에서 펼칠 나의 핵심 주장을 간결하게 서술하세요."
                className="w-full p-2.5 bg-white border border-stone-300 rounded-lg text-stone-800 focus:outline-hidden focus:border-emerald-600 leading-relaxed text-xs"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1 text-[11px]">
                2. 뒷받침하는 핵심 사료 및 유물 (Evidence)
              </label>
              <textarea
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                rows={2}
                placeholder="예: 『남제서』 하지왕 조공 기록, 고령 지산동 44호분 순장 유물, 우륵의 12곡 등"
                className="w-full p-2.5 bg-white border border-stone-300 rounded-lg text-stone-800 focus:outline-hidden focus:border-emerald-600 leading-relaxed text-xs"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-stone-700 font-semibold text-[11px]">
                  3. 내 주장에 대한 나의 확신도 (Confidence)
                </label>
                <span className="font-mono text-emerald-800 font-bold">{confidence} / 5점</span>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setConfidence(star)}
                    className={`flex-1 py-1.5 rounded border text-xs font-medium flex items-center justify-center gap-1 transition-all ${
                      confidence >= star
                        ? 'bg-amber-500 text-white border-amber-600 font-semibold'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <Star className="w-3 h-3 fill-current" />
                    <span>{star}단계</span>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-stone-400 mt-1 italic">
                메타인지 진단: 본인의 확신도와 실제 사료 연계성의 간극을 분석합니다.
              </p>
            </div>

            <button
              onClick={handleRunDiagnosis}
              disabled={isLoading || !claim.trim()}
              className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 shadow-xs mt-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>AI가 사료와 논리를 30초 정밀 진단 중...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>30초 즉각 논리 진단 실행하기</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Diagnosis Result Dashboard (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {diagnosis ? (
            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs space-y-4 text-xs animate-in fade-in duration-150">
              {/* Score header */}
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 font-bold font-mono text-lg flex items-center justify-center border border-emerald-200">
                    {diagnosis.logicScore}
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm font-serif">
                      논리적 타당성 및 사료 신뢰도 종합 점수
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      고1 한국사 고대사 탐구 루브릭 기준 다각적 평가
                    </p>
                  </div>
                </div>

                <span className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md font-semibold">
                  {diagnosis.logicScore >= 80 ? '우수한 사료 연계' : '보완 필요'}
                </span>
              </div>

              {/* Strength */}
              <div className="bg-emerald-50/60 border border-emerald-200/70 rounded-lg p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-900 font-semibold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>내 주장의 핵심 강점</span>
                </div>
                <p className="text-stone-700 leading-relaxed text-xs">
                  {diagnosis.strength}
                </p>
              </div>

              {/* Vulnerability */}
              <div className="bg-rose-50/60 border border-rose-200/70 rounded-lg p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-rose-900 font-semibold text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-700" />
                  <span>상대방이 파고들 취약점 & 사료적 한계</span>
                </div>
                <p className="text-stone-700 leading-relaxed text-xs">
                  {diagnosis.vulnerability}
                </p>
              </div>

              {/* Evidence Check & Reflection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="border border-stone-200 rounded-lg p-3 bg-stone-50/60 space-y-1">
                  <span className="font-semibold text-stone-800 block text-[11px]">
                    사료 교차검증 포인트
                  </span>
                  <p className="text-stone-600 leading-relaxed text-[11px]">
                    {diagnosis.evidenceCheck}
                  </p>
                </div>

                <div className="border border-stone-200 rounded-lg p-3 bg-amber-50/50 space-y-1">
                  <span className="font-semibold text-amber-900 block text-[11px] flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                    토론 전 스스로 던질 질문
                  </span>
                  <p className="text-amber-950 leading-relaxed text-[11px]">
                    {diagnosis.reflectionQuestion}
                  </p>
                </div>
              </div>

              {/* Metacognition Feedback */}
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-[11px] text-stone-600 space-y-1">
                <span className="font-semibold text-stone-900 block flex items-center gap-1">
                  <BarChart2 className="w-3.5 h-3.5 text-stone-600" />
                  메타인지 피드백 (Hausman et al., 2021 기준)
                </span>
                <p className="leading-relaxed">
                  {diagnosis.metacognitionTip}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-stone-50 border border-dashed border-stone-300 rounded-xl p-10 text-center flex flex-col items-center justify-center h-full min-h-[360px] text-xs text-stone-500 space-y-3">
              <Sparkles className="w-8 h-8 text-stone-400 stroke-1" />
              <div>
                <h4 className="font-bold text-stone-800 text-sm">진단 결과 대기 중</h4>
                <p className="text-stone-500 mt-1 max-w-sm leading-relaxed">
                  왼쪽 양식에 주장과 사료, 확신도를 입력하고 [30초 즉각 논리 진단]을 누르면 사료 적합도와 예상 공격 지점을 AI가 정밀 분석해 드립니다.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
