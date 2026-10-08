import React, { useState } from 'react';
import { Header } from './components/Header';
import { IssueExplorer } from './components/IssueExplorer';
import { PersonaInterview } from './components/PersonaInterview';
import { LogicDiagnosis } from './components/LogicDiagnosis';
import { DebatePartner } from './components/DebatePartner';
import { PublishBrief } from './components/PublishBrief';
import { EthicsModal } from './components/EthicsModal';
import { DEBATE_TOPICS } from './data/historyData';
import { DebateTopic, HistoricalSource, PromptLogEntry, DiagnosisResult } from './types';
import { ShieldCheck, BookOpen, GraduationCap } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('explore');
  const [teamName, setTeamName] = useState<string>('Good조');
  const [selectedTopic, setSelectedTopic] = useState<DebateTopic>(DEBATE_TOPICS[0]);
  const [selectedStance, setSelectedStance] = useState<string>('stanceA');
  const [savedEvidenceIds, setSavedEvidenceIds] = useState<string[]>(['src_namjaeseo', 'src_jisandong']);
  const [userNotes, setUserNotes] = useState<string>(
    '지산동 고분군의 막강한 순장 규모와 『남제서』 하지왕의 독자 조공 기록을 보면 단순 연맹체로만 치부하기 어렵다. 신라 마립간기 수준의 초기고대국가로 평가하는 것이 역사적 실체에 부합한다고 생각한다.'
  );
  const [logs, setLogs] = useState<PromptLogEntry[]>([
    {
      timestamp: '2026. 10. 08. 09:30',
      module: '사전 탐구 단계 (Good조 1~3단계)',
      prompt: '가야가 연맹체였는지 고대국가 단계에 도달했는지를 둘러싼 주요 입장을 사실과 해석을 구분하여 정리해줘.',
      response: '이영식(2018)의 초기고대국가론(우륵 12곡, 하지왕 남제 조공, 하동항 등)과 백승충(2006)의 가라지역연맹론(분지 수계의 지역성, 불교·율령 제도화 미비) 학설 비교 제공.',
      userCritique: 'AI의 답변을 바탕으로 논문 원문(DBpia)을 찾아 교차 검증하고, 토론의 쟁점을 구체화함.',
    },
  ]);
  const [isEthicsOpen, setIsEthicsOpen] = useState<boolean>(false);

  // Helper handlers
  const handleToggleSaveEvidence = (sourceId: string) => {
    setSavedEvidenceIds((prev) =>
      prev.includes(sourceId) ? prev.filter((id) => id !== sourceId) : [...prev, sourceId]
    );
  };

  const handleAddLog = (entry: PromptLogEntry) => {
    setLogs((prev) => [entry, ...prev]);
  };

  const handleAddEvidenceMemo = (text: string) => {
    setUserNotes((prev) => (prev ? `${prev}\n\n${text}` : text));
  };

  const handleSaveDiagnosis = (result: DiagnosisResult) => {
    handleAddEvidenceMemo(`[30초 논리진단 결과 (점수: ${result.logicScore}점)]: ${result.strength}`);
  };

  // Saved HistoricalSource objects
  const savedSourcesList = selectedTopic.sources.filter((s) => savedEvidenceIds.includes(s.id));

  return (
    <div className="min-h-screen bg-stone-100/50 text-stone-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Header */}
      <Header
        onOpenEthics={() => setIsEthicsOpen(true)}
        teamName={teamName}
        setTeamName={setTeamName}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'explore' && (
          <IssueExplorer
            selectedTopic={selectedTopic}
            onSelectTopic={setSelectedTopic}
            selectedStance={selectedStance}
            onSelectStance={setSelectedStance}
            savedEvidenceIds={savedEvidenceIds}
            onToggleSaveEvidence={handleToggleSaveEvidence}
            userNotes={userNotes}
            onChangeUserNotes={setUserNotes}
            onGoNext={() => setActiveTab('scholars')}
          />
        )}

        {activeTab === 'scholars' && (
          <PersonaInterview
            onAddLog={handleAddLog}
            onAddEvidenceMemo={handleAddEvidenceMemo}
            onGoNext={() => setActiveTab('diagnosis')}
          />
        )}

        {activeTab === 'diagnosis' && (
          <LogicDiagnosis
            topicTitle={selectedTopic.title}
            userStance={selectedStance === 'stanceA' ? selectedTopic.stanceA.label : selectedTopic.stanceB.label}
            savedSources={savedSourcesList}
            initialNotes={userNotes}
            onAddLog={handleAddLog}
            onSaveDiagnosis={handleSaveDiagnosis}
            onGoNext={() => setActiveTab('debate')}
          />
        )}

        {activeTab === 'debate' && (
          <DebatePartner
            topic={selectedTopic}
            userStance={selectedStance}
            onAddLog={handleAddLog}
            onAddCounterArgument={handleAddEvidenceMemo}
            onGoNext={() => setActiveTab('publish')}
          />
        )}

        {activeTab === 'publish' && (
          <PublishBrief
            topic={selectedTopic}
            userStance={selectedStance}
            savedSources={savedSourcesList}
            userNotes={userNotes}
            teamName={teamName}
            onAddLog={handleAddLog}
          />
        )}
      </main>

      {/* Ethics & Log Modal */}
      <EthicsModal
        isOpen={isEthicsOpen}
        onClose={() => setIsEthicsOpen(false)}
        logs={logs}
        teamName={teamName}
      />

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-emerald-800" />
            <span>
              <strong>Good조 한국사 탐구토론 수업 모델</strong> · 기획: 장민서, 박한얼
            </span>
          </div>

          <div className="flex items-center gap-4 text-stone-400">
            <button
              onClick={() => setIsEthicsOpen(true)}
              className="hover:text-stone-700 flex items-center gap-1 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>생성형 AI 윤리 서약서 확인</span>
            </button>
            <span>·</span>
            <span>고등학교 한국사 Ⅰ. 고대 국가의 성장</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
