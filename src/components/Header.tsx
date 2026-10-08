import React from 'react';
import { BookOpen, ShieldCheck, Sparkles, ScrollText, Users } from 'lucide-react';

interface HeaderProps {
  onOpenEthics: () => void;
  teamName: string;
  setTeamName: (name: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenEthics,
  teamName,
  setTeamName,
  activeTab,
  setActiveTab,
}) => {
  const tabs = [
    { id: 'explore', label: '1. 쟁점 & 사료 탐색', icon: ScrollText },
    { id: 'scholars', label: '2. 사학자 페르소나 인터뷰', icon: Users },
    { id: 'diagnosis', label: '3. 30초 논리 진단', icon: Sparkles },
    { id: 'debate', label: '4. AI 악마의 대변인 토론', icon: BookOpen },
    { id: 'publish', label: '5. 입론서 & 교과서 발행', icon: BookOpen },
  ];

  return (
    <header className="border-b border-stone-200 bg-stone-900 text-stone-100 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Brand Bar */}
        <div className="py-3 flex flex-wrap items-center justify-between gap-4 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/90 text-white flex items-center justify-center font-serif font-bold text-lg shadow-inner">
              史
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold font-serif tracking-tight text-white">
                  역사 온(HistoriOn)
                </h1>
                <span className="text-xs text-stone-400 font-sans hidden sm:inline">
                  | 가야사·고대사 AI 토론 준비 스튜디오
                </span>
              </div>
              <p className="text-xs text-stone-400 font-sans">
                고1 한국사 Ⅰ. 고대 국가의 성장 · 2. 삼국·가야의 발전
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-stone-800/80 px-2.5 py-1 rounded-md border border-stone-700/70 text-xs">
              <span className="text-stone-400">팀:</span>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="팀명 입력"
                className="bg-transparent text-white font-medium focus:outline-hidden w-20 text-xs placeholder:text-stone-500"
              />
            </div>

            <button
              onClick={onOpenEthics}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900/90 border border-emerald-700/60 rounded-md text-xs font-medium text-emerald-300 transition-colors"
              title="생성형 AI 윤리 서약 및 로그 내보내기"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI 윤리 서약 & 일지</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 py-2 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
