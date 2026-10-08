import React, { useState } from 'react';
import { DebateTopic, ChatMessage, PromptLogEntry } from '../types';
import { Swords, Send, ArrowRight, RefreshCw, Lightbulb, ShieldAlert, Sparkles, PlusCircle } from 'lucide-react';

interface DebatePartnerProps {
  topic: DebateTopic;
  userStance: string;
  onAddLog: (entry: PromptLogEntry) => void;
  onAddCounterArgument: (text: string) => void;
  onGoNext: () => void;
}

export const DebatePartner: React.FC<DebatePartnerProps> = ({
  topic,
  userStance,
  onAddLog,
  onAddCounterArgument,
  onGoNext,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_opponent',
      sender: 'ai',
      text: `안녕하십니까. 저는 반대측 토론자입니다.
학생 측은 가야를 독립된 고대국가로 인정하거나 사국시대로 보아야 한다고 주장하시지만, 『삼국사기』 어디에도 가야의 독자적인 본기가 없으며 불교 공인이나 율령 반포 같은 고대국가의 핵심 제도가 전역에서 입증되지 않았습니다.
과연 몇 개의 대형 고분과 유물만으로 신라·백제와 대등한 국가였다고 단정할 수 있습니까? 어떤 사료적 근거로 이를 반박하시겠습니까?

[💡 반론 대비 힌트]: 신라 역시 법흥왕의 율령 반포 이전인 내물 마립간 시절부터 고대국가로 인정받는다는 점과, 『남제서』의 하지왕 독자 조공 기록을 제시해 보세요.`,
      timestamp: '토론 시작',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [savedNotes, setSavedNotes] = useState<string[]>([]);

  const handleSendDebate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userText = inputMessage;
    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/debate/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.title,
          userStance: userStance === 'stanceA' ? topic.stanceA.label : topic.stanceB.label,
          chatHistory: messages,
          userMessage: userText,
        }),
      });

      const data = await response.json();
      const replyText = data.reply || '상대측 반론을 생성하지 못했습니다.';

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages([...newHistory, aiMsg]);

      onAddLog({
        timestamp: new Date().toLocaleTimeString('ko-KR'),
        module: `4단계 악마의 대변인 토론 (${topic.title})`,
        prompt: userText,
        response: replyText,
      });
    } catch (err) {
      console.error(err);
      const fallbackAiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: `학생 측의 주장은 흥미로우나, 영남 내륙의 험준한 산악 분지로 인한 '지역적 분립성' 문제를 간과하고 있습니다. 백승충 교수의 연구처럼 가야는 각 소국의 자율성이 강해 단일한 지배조직을 구축하지 못했습니다. 이에 대해 어떻게 답하시겠습니까?\n\n[💡 반론 대비 힌트]: 우륵의 가야 12곡이 각 지역의 음악을 통합하려 한 시도였음을 강조해 보세요.`,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...newHistory, fallbackAiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveArgumentPoint = (text: string) => {
    onAddCounterArgument(text);
    setSavedNotes(prev => [...prev, text]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Intro Header */}
      <div className="bg-stone-100/80 border border-stone-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-rose-800 flex items-center gap-1.5">
              <Swords className="w-4 h-4" />
              <span>4단계 · AI 악마의 대변인(Devil's Advocate) 가상 모의 토론</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 tracking-tight">
              실전 반론 시뮬레이션으로 논리 방패 단련하기
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 max-w-3xl leading-relaxed">
              AI가 나의 반대 입장에서 사료적 허점과 엄밀한 학술 반론을 제기합니다.
              공격받은 지점을 방어하고 소크라테스식 반문에 답하며 실전 토론의 논리력을 극대화하세요.
            </p>
          </div>

          <button
            onClick={onGoNext}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold transition-colors shrink-0"
          >
            <span>5단계: 입론서 & 교과서 발행</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Current match info */}
        <div className="mt-4 pt-3 border-t border-stone-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-900 font-serif">토론 주제:</span>
            <span className="text-stone-700">{topic.title}</span>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded font-semibold">
              내 입장: {userStance === 'stanceA' ? topic.stanceA.label : topic.stanceB.label}
            </span>
            <span className="text-stone-400">VS</span>
            <span className="px-2.5 py-1 bg-rose-100 text-rose-900 rounded font-semibold">
              AI 반대 토론자
            </span>
          </div>
        </div>
      </div>

      {/* Main Debate Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chat Stream (8 cols) */}
        <div className="lg:col-span-8">
          <div className="bg-white border border-stone-200 rounded-xl shadow-2xs flex flex-col h-[600px] overflow-hidden">
            {/* Arena Header */}
            <div className="px-5 py-3 border-b border-stone-200 bg-stone-50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-700" />
                <span className="font-bold text-stone-900">상대측 토론자와의 1:1 모의 논박</span>
              </div>
              <span className="text-[11px] text-stone-500 font-mono">
                소크라테스식 반문 훈련 모드
              </span>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[11px] text-stone-400 font-mono">
                      <span>{isUser ? '나(학생 측 입론/반론)' : '상대측 AI 토론자'}</span>
                      <span>·</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-[88%] rounded-xl p-4 leading-relaxed text-xs ${
                        isUser
                          ? 'bg-stone-900 text-white rounded-br-xs'
                          : 'bg-rose-50/50 text-stone-900 rounded-bl-xs border border-rose-200/70'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.text}</div>

                      {!isUser && (
                        <div className="mt-3 pt-2.5 border-t border-rose-200/60 flex items-center justify-between">
                          <span className="text-[11px] text-rose-800 font-medium flex items-center gap-1">
                            <Lightbulb className="w-3.5 h-3.5" />
                            상대 공격 지점 분석
                          </span>
                          <button
                            onClick={() => handleSaveArgumentPoint(msg.text.slice(0, 120))}
                            className="flex items-center gap-1 text-[11px] text-emerald-800 hover:text-emerald-950 font-medium"
                          >
                            <PlusCircle className="w-3 h-3" />
                            <span>재반론 대비 노트에 추가</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-center gap-2 text-rose-700 text-xs py-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>상대측 토론자가 학생 측 주장의 허점을 분석하며 반론을 준비 중입니다...</span>
                </div>
              )}
            </div>

            {/* Input Form */}
            <div className="p-3.5 border-t border-stone-200 bg-stone-50/70">
              <form onSubmit={handleSendDebate} className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="상대방의 지적에 사료와 논리로 맞받아치는 반론을 입력하세요..."
                  disabled={isLoading}
                  className="flex-1 bg-white border border-stone-300 rounded-lg px-3.5 py-2.5 text-xs text-stone-800 focus:outline-hidden focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputMessage.trim()}
                  className="px-4 py-2.5 bg-rose-800 hover:bg-rose-900 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 flex items-center gap-1.5 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>반론 제기</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: Debate Battlecard & Tips (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Strategy Card */}
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs space-y-3.5 text-xs">
            <h3 className="font-serif font-bold text-stone-900 text-sm border-b border-stone-200 pb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>실전 토론 방어 전략 가이드</span>
            </h3>

            <div className="space-y-2.5 text-stone-600 leading-relaxed text-xs">
              <div className="p-2.5 bg-stone-50 rounded border border-stone-200 space-y-1">
                <span className="font-semibold text-stone-900 block text-[11px]">
                  1. '율령/불교 부재' 지적 방어법
                </span>
                <p className="text-[11px]">
                  신라 마립간기 역시 불교 공인 이전이었으나 고대국가의 태동기로 보듯, 제도적 단일 기준에 얽매이지 않고 대가야의 독자적 영역화 맹아를 강조하세요.
                </p>
              </div>

              <div className="p-2.5 bg-stone-50 rounded border border-stone-200 space-y-1">
                <span className="font-semibold text-stone-900 block text-[11px]">
                  2. '삼국사기 가야본기 부재' 반박법
                </span>
                <p className="text-[11px]">
                  김부식의 사서 편찬 체재는 12세기 고려의 신라 계승 정통론에 기초한 서술임을 지적하고, 승자의 시각을 넘어 5세기 중국 『남제서』의 객관적 기록을 들이미세요.
                </p>
              </div>

              <div className="p-2.5 bg-stone-50 rounded border border-stone-200 space-y-1">
                <span className="font-semibold text-stone-900 block text-[11px]">
                  3. '임나일본부 왜곡' 대처법
                </span>
                <p className="text-[11px]">
                  『일본서기』의 편찬 의도와 8세기 왜 왕실 중심적 윤색을 명확히 짚고, 고고학적 철기 출토 양상을 근거로 대등한 교역 관계였음을 입증하세요.
                </p>
              </div>
            </div>
          </div>

          {/* Saved Rebuttal notes */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-stone-900 text-[11px]">
                저장된 재반론 대비 메모
              </span>
              <span className="font-mono text-emerald-800 font-bold text-[11px]">
                {savedNotes.length}개
              </span>
            </div>
            {savedNotes.length === 0 ? (
              <p className="text-[11px] text-stone-400">
                상대측 AI의 반론 카드에서 [재반론 대비 노트에 추가]를 누르면 여기에 누적되어 입론서 작성 시 활용됩니다.
              </p>
            ) : (
              <ul className="space-y-1 text-[11px] text-stone-700 list-disc list-inside">
                {savedNotes.map((n, i) => (
                  <li key={i} className="line-clamp-2">{n}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
