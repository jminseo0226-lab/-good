import React, { useState } from 'react';
import { DebateTopic, DebateBrief, TextbookPage, HistoricalSource, PromptLogEntry } from '../types';
import { BookOpen, Printer, Copy, Check, Sparkles, RefreshCw, Download, FileText, Bookmark } from 'lucide-react';

interface PublishBriefProps {
  topic: DebateTopic;
  userStance: string;
  savedSources: HistoricalSource[];
  userNotes: string;
  teamName: string;
  onAddLog: (entry: PromptLogEntry) => void;
}

export const PublishBrief: React.FC<PublishBriefProps> = ({
  topic,
  userStance,
  savedSources,
  userNotes,
  teamName,
  onAddLog,
}) => {
  const [brief, setBrief] = useState<DebateBrief | null>(null);
  const [textbook, setTextbook] = useState<TextbookPage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState<'brief' | 'textbook'>('brief');
  const [copied, setCopied] = useState(false);

  const handleGenerateBrief = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.title,
          userStance: userStance === 'stanceA' ? topic.stanceA.label : topic.stanceB.label,
          keyEvidences: savedSources.map(s => s.title).join(', ') || '남제서 하지왕 조공 기록, 고령 지산동 고분군',
          userThoughts: userNotes,
          teamName: teamName || 'Good조',
        }),
      });

      const data = await response.json();
      setBrief(data.debateBrief);
      setTextbook(data.textbookPage);

      onAddLog({
        timestamp: new Date().toLocaleTimeString('ko-KR'),
        module: '5단계 입론서 & 나만의 교과서 퍼블리싱',
        prompt: `[쟁점] ${topic.title} / [입장] ${userStance} / [메모] ${userNotes}`,
        response: `[생성 완료] 입론서: ${data.debateBrief?.title} / 교과서: ${data.textbookPage?.sectionTitle}`,
      });
    } catch (err) {
      console.error(err);
      // Fallback
      setBrief({
        title: '가야의 역사적 실체 복원을 위한 사국시대 개편 입론서',
        stanceSummary: '가야는 독자적인 철기 문화와 대외 외교를 갖춘 초기고대국가였으므로 고대사를 삼국에 한정하지 않고 가야를 포괄해야 한다.',
        arguments: [
          {
            point: '외교와 군사의 독자적 자주권 확립',
            explanation: '서기 479년 대가야 하지왕이 중국 남제에 사신을 파견하여 보국장군 본국왕에 책봉된 것은 신라·백제와 대등한 국가적 위상을 국제적으로 공인받았음을 입증합니다.',
          },
          {
            point: '광역적 영역화와 사회 통합의 제도적 진전',
            explanation: '우륵의 가야 12곡 제정은 문화적 통합 시도이며, 섬진강 하동 항구 확보와 지산동 대형 고분군은 신라 마립간기에 필적하는 초기고대국가적 지표입니다.',
          },
          {
            point: '식민사학의 왜곡 탈피와 주체적 고대사 정립',
            explanation: '가야를 삼국의 들러리나 왜의 종속체(임나일본부)로 폄하하던 낡은 식민주의 역사관을 극복하고 고대사의 다원성을 인정하는 필수적 전환입니다.',
          },
        ],
        anticipatedRebuttal: '가야 전역을 아우르는 통일된 율령 반포나 불교 공인 기록이 없다는 점을 들어 고대국가 기준 미달이라고 반박할 것입니다.',
        counterRebuttal: '고대국가 발전 모델은 단일한 잣대만이 아니며, 신라 역시 율령 반포(법흥왕) 이전 내물왕 시기부터 국가로 인정받았으므로 대가야의 발전 단계를 저평가할 이유가 없습니다.',
        closing: '따라서 가야를 배제한 단편적 삼국 중심 서술에서 벗어나 고대 한반도의 다원성을 복원하는 것은 역사적 진실에 다가서는 길입니다.',
      });

      setTextbook({
        unitTitle: 'Ⅰ. 근대 이전 한국사의 이해 > 01. 고대 국가의 성장 > 2. 삼국·가야의 발전',
        sectionTitle: '철의 왕국 가야, 왜 삼국시대의 울타리를 넘어야 하는가?',
        bodyParagraphs: [
          '우리는 오랫동안 고구려, 백제, 신라만을 고대 한반도의 주역으로 기억해 왔다. 그러나 영남 서부 낙동강 유역과 지리산 자락에는 500년 넘게 번영하며 동아시아 해상 교역을 주도한 가야가 있었다.',
          '대가야의 지산동 고분군에서 출토된 찬란한 금동관과 철제 갑옷, 그리고 대가야 하지왕이 남제에 사신을 보내 황제로부터 왕으로 책봉받은 기록은 가야가 결코 단순한 소국 연맹에 머물지 않았음을 웅변한다.',
          '오늘날 역사학계는 가야를 고대국가의 맹아를 꽃피운 주역으로 재평가하고 있다. 박제된 암기용 역사에서 벗어나 가야의 목소리를 들을 때 고대사는 한층 입체적이고 역동적인 모습으로 다가온다.',
        ],
        sourceSpotlight: {
          title: '사료 돋보기: 『남제서』 가라국전 (479년)',
          content: '“건원 원년(479년), 가라국왕 하지(荷知)가 사신을 보내 방물을 바쳤으므로 하지를 보국장군 본국왕으로 삼았다.” — 중국 정사에 신라보다 앞서 독자적 외교관계를 맺은 가야의 당당한 위상을 보여준다.',
        },
        inquiryQuestion: '만약 교과서의 ‘삼국시대’라는 단원명을 바꾼다면, 여러분은 어떤 새로운 이름을 제안하겠습니까?',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    let text = '';
    if (activeView === 'brief' && brief) {
      text = `[토론 입론서] ${brief.title}
팀: ${teamName || 'Good조'}
주장 요약: ${brief.stanceSummary}

■ 핵심 논거
${brief.arguments.map((a, i) => `${i + 1}. ${a.point}\n   - ${a.explanation}`).join('\n\n')}

■ 예상 반론
${brief.anticipatedRebuttal}

■ 우리의 재반론
${brief.counterRebuttal}

■ 마무리 발언
${brief.closing}
`;
    } else if (textbook) {
      text = `[나만의 역사 교과서] ${textbook.sectionTitle}
단원: ${textbook.unitTitle}
팀: ${teamName || 'Good조'}

${textbook.bodyParagraphs.join('\n\n')}

[${textbook.sourceSpotlight.title}]
${textbook.sourceSpotlight.content}

[생각 더하기 탐구 질문]
${textbook.inquiryQuestion}
`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Intro Header */}
      <div className="bg-stone-100/80 border border-stone-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>5단계 · 실전 토론 입론서 & '나만의 역사 교과서' 퍼블리싱</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 tracking-tight">
              탐구의 결실을 나만의 역사 서술로 완성하기
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 max-w-3xl leading-relaxed">
              사료 탐색, 사학자 인터뷰, 논리 진단, 악마의 대변인 토론을 거치며 단련된 논리를 집약하여
              체계적인 실전 토론 입론서와 한 페이지 교과서로 발행합니다.
            </p>
          </div>

          <button
            onClick={handleGenerateBrief}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 shadow-xs shrink-0"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>입론서 & 교과서 집필 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{brief ? '새로 발행하기' : '원클릭 종합 발행하기'}</span>
              </>
            )}
          </button>
        </div>

        {/* View Toggle and Actions */}
        {brief && (
          <div className="mt-5 pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1 bg-stone-200/70 p-1 rounded-lg">
              <button
                onClick={() => setActiveView('brief')}
                className={`px-3.5 py-1.5 rounded-md font-medium transition-colors ${
                  activeView === 'brief'
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                1. 실전 토론 입론서
              </button>
              <button
                onClick={() => setActiveView('textbook')}
                className={`px-3.5 py-1.5 rounded-md font-medium transition-colors ${
                  activeView === 'textbook'
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                2. 나만의 역사 교과서 페이지
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-300 bg-white hover:bg-stone-50 rounded-md text-stone-700 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '복사 완료' : '내용 복사'}</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-md transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>인쇄 / PDF 저장</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Publishing View */}
      {brief && textbook ? (
        activeView === 'brief' ? (
          /* Debate Brief Card */
          <div className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6 text-stone-800 font-sans max-w-4xl mx-auto">
            {/* Brief Header */}
            <div className="border-b-2 border-stone-900 pb-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-500 font-mono">
                <span>[고등학교 1학년 한국사 토론 입론서]</span>
                <span>작성팀: {teamName || 'Good조'} · {new Date().toLocaleDateString('ko-KR')}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 leading-snug">
                {brief.title}
              </h2>
              <div className="bg-emerald-50 border-l-4 border-emerald-700 p-3 text-xs sm:text-sm text-stone-800 font-medium">
                <span className="font-bold text-emerald-900 mr-2">[핵심 명제]</span>
                {brief.stanceSummary}
              </div>
            </div>

            {/* Arguments */}
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900 flex items-center gap-2 border-b border-stone-200 pb-2">
                <FileText className="w-4 h-4 text-emerald-800" />
                <span>입론 논거 (사료 기반 실체적 증명)</span>
              </h3>

              <div className="grid grid-cols-1 gap-3.5">
                {brief.arguments.map((arg, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-stone-50 border border-stone-200 space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 font-bold text-stone-900 text-sm font-serif">
                      <span className="w-5 h-5 rounded-full bg-stone-800 text-white flex items-center justify-center text-xs">
                        {idx + 1}
                      </span>
                      <span>{arg.point}</span>
                    </div>
                    <p className="text-stone-700 leading-relaxed pl-7">
                      {arg.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Rebuttal & Counter-Rebuttal Strategy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-lg bg-rose-50/70 border border-rose-200/80 space-y-1.5 text-xs">
                <span className="font-bold text-rose-900 text-xs block font-serif">
                  상대방 예상 반론 (Anticipated Rebuttal)
                </span>
                <p className="text-stone-700 leading-relaxed">
                  {brief.anticipatedRebuttal}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-emerald-50/70 border border-emerald-200/80 space-y-1.5 text-xs">
                <span className="font-bold text-emerald-900 text-xs block font-serif">
                  우리의 재반론 논리 (Counter-Rebuttal)
                </span>
                <p className="text-stone-700 leading-relaxed">
                  {brief.counterRebuttal}
                </p>
              </div>
            </div>

            {/* Closing */}
            <div className="border-t border-stone-200 pt-4 space-y-1 text-xs">
              <span className="font-bold text-stone-900 font-serif block text-xs">
                최종 마무리 발언 (Closing Statement)
              </span>
              <p className="text-stone-700 leading-relaxed italic bg-stone-50 p-3 rounded border border-stone-200">
                "{brief.closing}"
              </p>
            </div>
          </div>
        ) : (
          /* 'My Own History Textbook' Card */
          <div className="bg-stone-50 border border-stone-300 rounded-xl p-6 sm:p-10 shadow-xs space-y-6 text-stone-800 max-w-4xl mx-auto font-serif">
            {/* Textbook Header */}
            <div className="border-b-2 border-stone-800 pb-3">
              <span className="text-[11px] font-sans font-semibold text-emerald-800 tracking-wider block mb-1">
                {textbook.unitTitle}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
                {textbook.sectionTitle}
              </h2>
            </div>

            {/* Textbook Body Paragraphs */}
            <div className="space-y-4 text-stone-800 leading-relaxed text-sm sm:text-base font-serif">
              {textbook.bodyParagraphs.map((para, i) => (
                <p key={i} className="indent-4 text-justify">
                  {para}
                </p>
              ))}
            </div>

            {/* Source Spotlight Box */}
            <div className="bg-white border-2 border-amber-700/60 rounded-lg p-5 font-sans space-y-2 text-xs shadow-2xs">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wide">
                <Bookmark className="w-4 h-4 text-amber-700" />
                <span>{textbook.sourceSpotlight.title}</span>
              </div>
              <p className="text-stone-700 font-serif text-xs sm:text-sm leading-relaxed italic bg-stone-50 p-3 rounded border border-stone-200">
                {textbook.sourceSpotlight.content}
              </p>
            </div>

            {/* Thought Inquiry Question */}
            <div className="bg-stone-100 p-4 rounded-lg border border-stone-300 font-sans text-xs space-y-1">
              <span className="font-bold text-stone-900 block text-xs">
                🤔 생각 더하기 탐구 질문
              </span>
              <p className="text-stone-700 font-medium">
                {textbook.inquiryQuestion}
              </p>
            </div>

            <div className="text-right text-[11px] text-stone-400 font-sans">
              교과서 집필자: {teamName || 'Good조'} 역사연구팀
            </div>
          </div>
        )
      ) : (
        <div className="bg-white border border-stone-200 rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-4 max-w-2xl mx-auto text-xs text-stone-500 shadow-2xs">
          <BookOpen className="w-10 h-10 text-stone-400 stroke-1" />
          <div className="space-y-1">
            <h3 className="font-bold text-stone-800 text-sm font-serif">
              아직 발행된 입론서 및 교과서가 없습니다
            </h3>
            <p className="text-stone-500 max-w-md leading-relaxed">
              상단의 <strong>[원클릭 종합 발행하기]</strong> 버튼을 누르면, 지금까지 탐색한 사료와 페르소나 대화, 진단 결과를 AI가 분석하여 고품질의 토론 입론서와 나만의 교과서 페이지를 집필합니다.
            </p>
          </div>
          <button
            onClick={handleGenerateBrief}
            disabled={isLoading}
            className="mt-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-semibold transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>지금 종합 발행 시작하기</span>
          </button>
        </div>
      )}
    </div>
  );
};
