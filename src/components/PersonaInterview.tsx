import React, { useState } from 'react';
import { SCHOLARS_PERSONAS } from '../data/historyData';
import { Persona, ChatMessage, PromptLogEntry } from '../types';
import { Send, Users, Sparkles, BookmarkPlus, ArrowRight, MessageSquare, Check, RefreshCw } from 'lucide-react';

interface PersonaInterviewProps {
  onAddLog: (entry: PromptLogEntry) => void;
  onAddEvidenceMemo: (text: string) => void;
  onGoNext: () => void;
}

export const PersonaInterview: React.FC<PersonaInterviewProps> = ({
  onAddLog,
  onAddEvidenceMemo,
  onGoNext,
}) => {
  const [selectedPersona, setSelectedPersona] = useState<Persona>(SCHOLARS_PERSONAS[0]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistoryByPersona, setChatHistoryByPersona] = useState<Record<string, ChatMessage[]>>({
    lee_youngshik: [
      {
        id: 'init_lee',
        sender: 'ai',
        text: '반갑습니다. 대가야의 발전단계와 초기고대국가론을 연구하는 이영식입니다. 가야가 단순한 부족연맹을 넘어 고대국가적 지표를 지녔다는 점에 대해 무엇이든 질문해 주세요.',
        timestamp: '수업 준비',
      },
    ],
    baek_seungchoong: [
      {
        id: 'init_baek',
        sender: 'ai',
        text: '안녕하세요. 가야의 고대국가론에 비판적 검토를 제기하는 백승충입니다. 화려한 유물 뒤에 숨은 지리적 지역성과 제도적 한계를 함께 따져봅시다.',
        timestamp: '수업 준비',
      },
    ],
    wi_gaya: [
      {
        id: 'init_wi',
        sender: 'ai',
        text: '안녕하세요. 한일 고대사 인식과 식민사학 극복을 연구하는 위가야입니다. 『일본서기』의 왜곡된 시각을 걷어내고 가야의 주체적 역할을 어떻게 복원할지 이야기해 봅시다.',
        timestamp: '수업 준비',
      },
    ],
    king_haji: [
      {
        id: 'init_king',
        sender: 'ai',
        text: '짐은 5세기 후반 대가야를 이끌었던 하지왕이다. 서기 479년 중국 남제에 사신을 보내 보국장군 본국왕의 위엄을 세웠으니, 우리 가야의 자주적 위상에 대해 묻거라.',
        timestamp: '수업 준비',
      },
    ],
  });
  const [copiedMemoId, setCopiedMemoId] = useState<string | null>(null);

  const currentChat = chatHistoryByPersona[selectedPersona.id] || [];

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedHistory = [...currentChat, userMsg];
    setChatHistoryByPersona(prev => ({
      ...prev,
      [selectedPersona.id]: updatedHistory,
    }));
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/persona/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaId: selectedPersona.id,
          chatHistory: currentChat,
          userMessage: textToSend,
        }),
      });

      const data = await response.json();
      const replyText = data.reply || '답변을 불러오지 못했습니다.';

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      };

      setChatHistoryByPersona(prev => ({
        ...prev,
        [selectedPersona.id]: [...updatedHistory, aiMsg],
      }));

      // Log for Ethics Report
      onAddLog({
        timestamp: new Date().toLocaleTimeString('ko-KR'),
        module: `2단계 페르소나 인터뷰 (${selectedPersona.name})`,
        prompt: textToSend,
        response: replyText,
      });
    } catch (err) {
      console.error(err);
      const fallbackAiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: `${selectedPersona.name}: 학생의 질문에 사료적 근거를 바탕으로 지속적으로 탐구해 볼 필요가 있습니다. 제시한 관점의 타당성을 한 번 더 검토해 보세요.`,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      };
      setChatHistoryByPersona(prev => ({
        ...prev,
        [selectedPersona.id]: [...updatedHistory, fallbackAiMsg],
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToMemo = (msg: ChatMessage) => {
    onAddEvidenceMemo(`[${selectedPersona.name} 견해]: ${msg.text}`);
    setCopiedMemoId(msg.id);
    setTimeout(() => setCopiedMemoId(null), 1800);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Intro Header */}
      <div className="bg-stone-100/80 border border-stone-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>2단계 · 다중 페르소나 심층 인터뷰</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 tracking-tight">
              역사학자 및 고대 군주와의 직접 대화
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 max-w-3xl leading-relaxed">
              각기 다른 역사적 입장을 가진 권위 있는 학자 및 당대 군주와 대화하며, 내 주장에 필요한 날카로운 논거와 반대측 논리를 수집하세요.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onGoNext}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <span>3단계: 30초 논리 진단으로 이동</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Persona Selectors */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SCHOLARS_PERSONAS.map(p => {
            const isSelected = selectedPersona.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPersona(p)}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-700 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-600/30'
                    : 'border-stone-200 bg-white hover:bg-stone-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="w-7 h-7 rounded-full bg-stone-900 text-white flex items-center justify-center font-serif text-xs font-bold">
                      {p.avatarText}
                    </span>
                    <span className="text-[11px] font-mono text-stone-500">
                      {p.role.split(' ')[0]}
                    </span>
                  </div>
                  <h4 className="font-bold text-stone-900 text-sm font-serif">
                    {p.name}
                  </h4>
                  <p className="text-[11px] text-emerald-800 font-medium mt-0.5 line-clamp-1">
                    {p.stance}
                  </p>
                </div>
                <p className="text-[11px] text-stone-500 mt-2 line-clamp-2 leading-relaxed">
                  {p.shortDesc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Dialogue Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Persona Details & Quick Prompts (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs space-y-4 text-xs">
            <div className="border-b border-stone-200 pb-3">
              <span className="text-[11px] text-stone-400 font-mono">인터뷰 대상 정보</span>
              <h3 className="font-serif font-bold text-stone-900 text-base mt-0.5">
                {selectedPersona.name}
              </h3>
              <p className="text-stone-500 text-[11px]">{selectedPersona.affiliation}</p>
            </div>

            <div className="space-y-2">
              <span className="font-semibold text-stone-800 block text-[11px]">
                핵심 학술적 논점
              </span>
              <ul className="space-y-1.5 text-stone-600 list-disc list-inside leading-relaxed text-[11px]">
                {selectedPersona.keyArguments.map((arg, i) => (
                  <li key={i}>{arg}</li>
                ))}
              </ul>
            </div>

            <div className="border-t border-stone-200 pt-3 space-y-2">
              <span className="font-semibold text-emerald-900 block text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                추천 탐구 질문 (클릭 시 자동 질문)
              </span>
              <div className="space-y-1.5">
                {selectedPersona.suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(q)}
                    disabled={isLoading}
                    className="w-full text-left p-2 rounded-lg bg-stone-50 hover:bg-emerald-50/70 border border-stone-200 hover:border-emerald-600/50 text-[11px] text-stone-700 transition-colors leading-relaxed disabled:opacity-50"
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Chat Stream (8 cols) */}
        <div className="lg:col-span-8">
          <div className="bg-white border border-stone-200 rounded-xl shadow-2xs flex flex-col h-[580px] overflow-hidden">
            {/* Chat header */}
            <div className="px-5 py-3 border-b border-stone-200 bg-stone-50/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-serif font-bold">
                  {selectedPersona.avatarText}
                </span>
                <span className="text-xs font-bold text-stone-900">
                  {selectedPersona.name}과의 일대일 학술 인터뷰
                </span>
              </div>
              <span className="text-[11px] text-stone-400 font-mono">
                Gemini 3.8 Flash 연동
              </span>
            </div>

            {/* Chat messages scrollable container */}
            <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
              {currentChat.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[11px] text-stone-400 font-mono">
                      <span>{isUser ? '나(학생)' : selectedPersona.name}</span>
                      <span>·</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-[85%] rounded-xl p-3.5 leading-relaxed text-xs ${
                        isUser
                          ? 'bg-emerald-800 text-white rounded-br-xs'
                          : 'bg-stone-100 text-stone-900 rounded-bl-xs border border-stone-200/80'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.text}</div>

                      {!isUser && (
                        <div className="mt-2 pt-2 border-t border-stone-200/60 flex items-center justify-end">
                          <button
                            onClick={() => handleSaveToMemo(msg)}
                            className="flex items-center gap-1 text-[11px] text-emerald-800 font-medium hover:text-emerald-950 transition-colors"
                          >
                            {copiedMemoId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>메모에 보관됨!</span>
                              </>
                            ) : (
                              <>
                                <BookmarkPlus className="w-3 h-3" />
                                <span>내 논거 메모로 담기</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-center gap-2 text-stone-400 text-xs py-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                  <span>{selectedPersona.name}이 사료를 검토하며 답변을 작성 중입니다...</span>
                </div>
              )}
            </div>

            {/* Input form */}
            <div className="p-3.5 border-t border-stone-200 bg-stone-50/50">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`${selectedPersona.name}에게 던질 질문을 입력하세요 (예: 율령이 없어도 고대국가로 볼 수 있나요?)`}
                  disabled={isLoading}
                  className="flex-1 bg-white border border-stone-300 rounded-lg px-3.5 py-2.5 text-xs text-stone-800 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputMessage.trim()}
                  className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 flex items-center gap-1.5 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>질문하기</span>
                </button>
              </form>
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-stone-400">
                <span>윤리 수칙: 대화 내역은 보고서 부록에 자동 반영됩니다.</span>
                <span>Enter 키를 누르면 바로 전송됩니다.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
