import React, { useState } from 'react';
import { ShieldCheck, Download, Copy, Check, X, FileText, AlertTriangle } from 'lucide-react';
import { PromptLogEntry } from '../types';

interface EthicsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: PromptLogEntry[];
  teamName: string;
}

export const EthicsModal: React.FC<EthicsModalProps> = ({ isOpen, onClose, logs, teamName }) => {
  const [pledges, setPledges] = useState<Record<string, boolean>>({
    p1: true,
    p2: true,
    p3: true,
    p4: true,
  });
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const togglePledge = (key: string) => {
    setPledges(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const generateReportAppendix = () => {
    return `# [Good조 한국사 토론] 생성형 AI 활용 윤리 서약 및 활용 일지
팀 이름: ${teamName || 'Good조'}
날짜: ${new Date().toLocaleDateString('ko-KR')}

## 1. 생성형 AI 활용 윤리 서약 확인
[${pledges.p1 ? 'V' : ' '}] 생성형 AI의 답을 내 생각인 것처럼 제출하지 않겠습니다.
[${pledges.p2 ? 'V' : ' '}] 생성형 AI가 준 정보는 사료 및 다른 자료로 확인하겠습니다.
[${pledges.p3 ? 'V' : ' '}] 결과물에서 생성형 AI를 활용한 부분을 명확히 밝히겠습니다.
[${pledges.p4 ? 'V' : ' '}] 채팅(프롬프트) 내역과 팀 소통 기록을 프로젝트 기간 동안 모아 두겠습니다.

## 2. 부록 3. 생성형 AI 활용 내역 (세션 기록)
총 활용 건수: ${logs.length}건

${logs.length === 0 ? '(아직 기록된 AI 대화 내역이 없습니다. 페르소나 인터뷰나 AI 토론 파트너를 이용하면 자동 기록됩니다.)' : logs.map((log, idx) => `### [세션 ${idx + 1}] 모듈: ${log.module} (${log.timestamp})
- 입력 프롬프트:
${log.prompt}

- AI 생성 내용 요약:
${log.response.slice(0, 300)}...

- 학생의 비판적 검토 및 활용 방식:
${log.userCritique || 'AI의 사료 언급(삼국사기, 일본서기 등)을 교과서 및 논문 사료와 대조하여 논박 근거로 재구성함.'}
`).join('\n---\n')}
`;
  };

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(generateReportAppendix());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadLogs = () => {
    const text = generateReportAppendix();
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `한국사토론_AI활용일지_${teamName || 'Good조'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-stone-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <div>
              <h2 className="text-base font-bold text-stone-900">생성형 AI 활용 윤리 서약 & 활용 기록부</h2>
              <p className="text-xs text-stone-500">Good조 창의적 문제해결 프로젝트 연구 기준 준수</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-stone-700">
          {/* Rules Banner */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs tracking-wide">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>수업 프로젝트 내내 지켜야 할 생성형 AI 5대 원칙</span>
            </div>
            <ul className="text-xs text-amber-950 space-y-1 list-disc list-inside leading-relaxed">
              <li><strong>발산 단계</strong>: 생성형 AI는 발상과 피드백 용도로만 활용합니다.</li>
              <li><strong>수렴·개발 단계</strong>: 생성형 AI의 답은 평가할 대상이며 결과물 도구로 활용합니다.</li>
              <li>최종 결과물을 생성형 AI가 통째로 만들게 하지 않습니다.</li>
              <li>생성형 AI가 준 정보는 사료 및 다른 자료로 한 번 더 교차 확인합니다.</li>
              <li>생성형 AI와 나눈 채팅(프롬프트) 내역을 지우지 말고 모아 둡니다.</li>
            </ul>
          </div>

          {/* Checklist */}
          <div className="space-y-3">
            <h3 className="font-semibold text-stone-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-stone-600" />
              나의 윤리 실천 서약
            </h3>
            <div className="space-y-2">
              {[
                { id: 'p1', label: '생성형 AI의 답을 내 생각인 것처럼 제출하지 않겠습니다.' },
                { id: 'p2', label: '생성형 AI가 준 정보는 교과서 및 사료 자료로 확인하겠습니다.' },
                { id: 'p3', label: '결과물에서 생성형 AI를 활용한 부분을 정확히 밝히겠습니다.' },
                { id: 'p4', label: '채팅(프롬프트) 내역과 팀 소통 기록을 프로젝트 기간 동안 모아 두겠습니다.' },
              ].map(item => (
                <label
                  key={item.id}
                  onClick={() => togglePledge(item.id)}
                  className="flex items-start gap-3 p-2.5 rounded-lg border border-stone-200 hover:bg-stone-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={pledges[item.id]}
                    onChange={() => {}}
                    className="mt-0.5 rounded border-stone-300 text-emerald-700 focus:ring-emerald-600"
                  />
                  <span className="text-xs text-stone-800 leading-snug">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* AI Log summary */}
          <div className="border border-stone-200 rounded-lg p-4 bg-stone-50 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-xs text-stone-900">현재 누적된 AI 대화 및 프롬프트 기록</h4>
                <p className="text-xs text-stone-500">보고서 [부록 3. 생성형 AI 활용 내역] 제출용 양식</p>
              </div>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-stone-200 text-stone-800 rounded">
                총 {logs.length}건
              </span>
            </div>

            <div className="max-h-36 overflow-y-auto bg-white rounded border border-stone-200 p-2.5 text-xs font-mono text-stone-600 space-y-2">
              {logs.length === 0 ? (
                <div className="text-stone-400 py-3 text-center">
                  아직 기록된 AI 활동이 없습니다. 토론 파트너 또는 사학자 인터뷰를 진행해 보세요.
                </div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="border-b border-stone-100 pb-1.5 last:border-none">
                    <div className="flex justify-between text-stone-500 text-[11px]">
                      <span>[{log.module}]</span>
                      <span>{log.timestamp}</span>
                    </div>
                    <div className="truncate text-stone-800 mt-0.5">질문: {log.prompt}</div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={handleCopyLogs}
                disabled={logs.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-stone-300 rounded-md hover:bg-white transition-colors disabled:opacity-40"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? '복사 완료' : '전체 복사'}
              </button>
              <button
                onClick={handleDownloadLogs}
                disabled={logs.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-stone-900 text-white rounded-md hover:bg-stone-800 transition-colors disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5" />
                마크다운(.md) 다운로드
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-200 bg-stone-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-medium rounded-md transition-colors"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
