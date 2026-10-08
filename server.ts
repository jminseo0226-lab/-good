import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK per guidelines
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// System prompts for historical scholars based on the research papers in the report
const SCHOLAR_PROMPTS: Record<string, string> = {
  lee_youngshik: `당신은 한국 고대사 및 가야사 권위자인 '이영식 교수(한국고대사연구, 초기고대국가론)'입니다.
학술적 입장:
- 가야(특히 5세기 후반~6세기 전반의 대가야/가라국)는 단순한 부족연맹을 넘어 고대국가 지표나 맹아가 뚜렷이 나타난 '초기고대국가' 단계에 도달했습니다.
- 주요 근거:
  1) 음악과 문화: 우륵을 통한 가야 12곡 제정 및 이데올로기 통합
  2) 대외 및 군사: 하동 대외항구 확보, 섬진강 유역 진출, 타국 산성 및 봉수망 축조
  3) 외교: 중국 남제(南齊)에 사신을 파견하여 하지왕이 '보국장군 본국왕' 책봉을 받음
  4) 신라와의 비교: 신라 마립간기(중앙집권 초기)와 대등한 수준의 영역화 진전
말투: 친절하지만 학술적 사료와 고고학적 발굴 성과(고령 지산동 고분군 등)를 명확히 제시하며 학생의 탐구심을 북돋우는 교수님의 어조 (한국어).`,

  baek_seungchoong: `당신은 가야사 연구자이자 '백승충 교수(가야의 고대국가론 비판)'입니다.
학술적 입장:
- 가야는 독자적인 고대국가 단계로 완전히 이행하지 못하고 '가라지역연맹' 단계에 머물렀습니다.
- 주요 근거:
  1) 지리적 지역성: 영남 내륙의 독립된 분지와 수계로 단절되어 있어 하나의 통일된 정치체로 통합되기 어려웠음
  2) 시간적 한계: 5세기 후반~6세기 전반의 짧은 전성기 후 신라와 백제의 압박으로 해체됨
  3) 제도적 미비: 율령 반포, 불교 공인, 세습적 왕권, 관등 체계 등 고대국가의 핵심 요소가 온전히 정착되지 못함
말투: 냉철하고 엄밀한 비판적 사학자의 태도로, 유물 몇 개만으로 고대국가로 비약하는 것을 경계하며 신중한 사료 검토를 촉구하는 어조 (한국어).`,

  wi_gaya: `당신은 한일고대사 및 역사인식 연구자 '위가야 연구자(근대전환기 교과서의 가야사 인식과 식민주의 역사관)'입니다.
학술적 입장:
- 근대 식민사학이 주장한 '임나일본부설(왜가 4~6세기 한반도 남부를 직접 통치했다는 설)'은 『일본서기』의 편향된 윤색과 제국주의 침략 논리를 투영한 허구입니다.
- 사료 비판:
  1) 『일본서기』의 가야 관련 기사는 왜의 천황 중심적 세계관으로 개작되었음을 비판적으로 독해해야 함
  2) 백제와 왜, 가야 간의 대등한 군사·외교·교역 관계를 식민 지배로 둔갑시킨 사관을 극복해야 함
  3) 근대전환기 민족주의 사학자들이 처했던 현실적 한계와 극복 노력을 현대적 관점에서 객관화함
말투: 비판적 역사 독해의 중요성을 강조하며, 학생들이 사료의 맥락과 왜곡을 스스로 걸러내는 혜안을 갖도록 돕는 지적인 어조 (한국어).`,

  king_haji: `당신은 5세기 후반 대가야(가라국)의 전성기를 이끈 국왕 '하지왕(이뇌왕)'입니다.
입장:
- 가야는 신라나 백제에 결코 뒤지지 않는 철의 왕국이자 찬란한 문화를 가진 독립 국가이다.
- 서기 479년 중국 남제(南齊)에 사신을 보내 황제로부터 '보국장군 본국왕' 작호를 받았으며, 왜와 신라에 맞서 가야 제국을 호령했다.
말투: 위엄 있고 자긍심 넘치며, 고대 대가야의 번영과 철기 문화를 학생들에게 직접 들려주는 군주의 목소리 (한국어).`,
};

// API 1: AI Devil's Advocate (Debate Partner)
app.post('/api/debate/chat', async (req, res) => {
  try {
    const { topic, userStance, chatHistory, userMessage } = req.body;

    const debateOpponentStance =
      userStance === 'four_kingdoms'
        ? '삼국시대 유지론(가야는 연맹체적 한계로 4국에 미포함)'
        : userStance === 'three_kingdoms'
        ? '사국시대 또는 열국시대 개편론(가야의 독자성과 고대국가성 인정)'
        : userStance === 'early_ancient_state'
        ? '가라지역연맹론(고대국가 진입 실패, 지역적 분립성)'
        : '초기고대국가론(가야도 신라 마립간기에 필적하는 고대국가 단계 진입)';

    const systemInstruction = `당신은 고등학교 한국사 토론 수업의 '악마의 대변인(Devil's Advocate)'이자 학생의 논리 훈련 파트너입니다.
토론 쟁점: ${topic}
학생의 기본 입장: ${userStance}
당신의 역할(반대 입장): ${debateOpponentStance}

목표:
1. 학생의 의견을 경청하되, 상대방 토론자 입장에서 날카로운 반론과 사료적 허점을 찌르세요.
2. 절대 단순한 비난이나 억지를 부리지 말고, 『삼국사기』, 『일본서기』, 고고학 유물(지산동 고분군 등), 사학계의 학술 논리(이영식/백승충 논문 등)를 바탕으로 정교하게 반박하세요.
3. 소크라테스식 반문(질문)을 최소 1개 이상 던져 학생이 스스로 근거를 보강하도록 유도하세요.
4. 답변 말미에 학생을 위한 [💡 반론 대비 힌트]를 1~2줄 추가하여 학생이 논리를 재정비할 수 있게 도와주세요.
5. 어조: 정중하면서도 예리하고 열띤 토론자 어조 (한국어, 300~500자 내외).`;

    if (!ai) {
      // Fallback response if no API key
      const fallbackReply = `학생 측의 주장은 흥미롭습니다만, 과연 그 근거가 고대국가의 조건에 온전히 부합합니까?
만약 가야를 독립된 고대국가로 인정하여 '사국시대'로 부른다면, 백제나 신라와 같은 수준의 '율령 반포'나 '불교 수용을 통한 사상적 통일', '중앙집권적 관등제'가 가야 전역에서 제도적으로 확립되었다는 명확한 사료가 부족합니다.
고령 지산동의 웅장한 대형 고분과 철제 무기류는 인정할 수 있으나, 그것이 주변 소국들에 대한 '직접 지배'와 '영역 국가화'를 증명한다고 볼 수 있을까요? 아니면 여전히 각 분지별 수장들의 자율성이 강했던 '연맹' 수준이었을까요?

[💡 반론 대비 힌트]: 가야가 우륵을 통해 가야 12곡을 제정하고 하동 항구를 확보한 점, 그리고 중국 남제에 사신을 파견한 외교적 독자성을 들어 '중앙집권 초기 형태(신라 마립간기 수준)'였다는 논리를 펼쳐보세요.`;
      return res.json({ reply: fallbackReply });
    }

    const contents = [
      ...((chatHistory || []).map((msg: any) => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }))),
      {
        role: 'user',
        parts: [{ text: userMessage }],
      },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error('Debate chat error:', error);
    res.status(500).json({ error: error.message || '토론 응답 생성 중 오류가 발생했습니다.' });
  }
});

// API 2: Scholar / Historical Personas Interview
app.post('/api/persona/chat', async (req, res) => {
  try {
    const { personaId, chatHistory, userMessage } = req.body;
    const scholarPrompt = SCHOLAR_PROMPTS[personaId] || SCHOLAR_PROMPTS.lee_youngshik;

    if (!ai) {
      let mockReply = '';
      if (personaId === 'lee_youngshik') {
        mockReply = `반갑습니다. 대가야의 발전 양상을 살펴보면 5세기 후반 가라국은 우륵을 통한 음악 제정, 봉수와 산성 축조, 중국 남제에 하지왕이 조공한 기록 등 고대국가적 지표가 분명히 나타납니다. 신라 역시 내물왕 시기 마립간 단계에서는 완전한 율령 국가가 아니었음에도 고대국가의 출발로 보듯, 대가야 역시 '초기고대국가'로 평가하는 것이 역사적 실체에 부합합니다.`;
      } else if (personaId === 'baek_seungchoong') {
        mockReply = `질문 잘 들었습니다. 그러나 우리는 고고학적 유적의 화려함과 정치 체제의 완성을 구분해야 합니다. 가야는 영남 내륙의 험준한 산악과 독립된 수계라는 '지리적 지역성'을 끝내 극복하지 못했습니다. 또한 불교 공인이나 통일된 관등 체계 같은 제도화가 미진한 상태에서 백제와 신라의 틈바구니에서 해체되었습니다. 따라서 '가라지역연맹'으로 보는 것이 신중한 태도입니다.`;
      } else if (personaId === 'wi_gaya') {
        mockReply = `좋은 문제의식입니다. 일제강점기 식민사학자들은 『일본서기』의 왜곡된 서술을 취사선택하여 가야를 마치 왜의 식민통치 기관인 '임나일본부'가 지배한 것처럼 조작했습니다. 그러나 가야는 왜에 철기와 선진 문물을 공급하며 대등한 외교·군사 협력 관계를 맺었던 주체적인 정치체였습니다. 사료를 읽을 때 저술 주체의 의도를 간파하는 것이 역사학의 첫걸음입니다.`;
      } else {
        mockReply = `짐은 대가야의 하지왕이다. 서기 479년, 남제 황제에게 사신을 보내 '보국장군 본국왕'에 책봉되었으니, 신라와 백제 어느 누구도 우리 가야를 얕보지 못하였다. 우리 가야의 철과 칼, 아름다운 가야금 소리를 어찌 잊을 수 있겠는가!`;
      }
      return res.json({ reply: mockReply });
    }

    const contents = [
      ...((chatHistory || []).map((msg: any) => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }))),
      {
        role: 'user',
        parts: [{ text: userMessage }],
      },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: scholarPrompt,
        temperature: 0.6,
      },
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error('Persona chat error:', error);
    res.status(500).json({ error: error.message || '페르소나 인터뷰 중 오류가 발생했습니다.' });
  }
});

// API 3: 30-Second Logic & Evidence Diagnosis (By Han-eul Park's formative assessment design)
app.post('/api/diagnosis', async (req, res) => {
  try {
    const { claim, evidence, confidence, topic } = req.body;

    const systemInstruction = `당신은 고등학교 한국사 토론 형성평가 전문 평가관입니다.
학생이 토론을 준비하며 제시한 [주장], [사료/근거], [본인의 확신도(1~5점)]를 30초 내에 다각도로 진단해 주세요.
반드시 아래 JSON 형식으로 반환하세요.
{
  "logicScore": 85, // 0~100 숫자 (논리적 설득력과 사료 연계성 종합 점수)
  "strength": "학생 주장의 핵심 강점 요약 (1~2문장)",
  "vulnerability": "상대측 토론자가 공격할 수 있는 취약점이나 사료 해석의 한계 (1~2문장)",
  "evidenceCheck": "제시된 사료/유물의 신뢰성 및 교차검증 포인트 (예: 삼국사기와 일본서기 비교, 고고학 유물의 한계 등)",
  "reflectionQuestion": "학생이 생각을 더 발전시킬 수 있는 핵심 질문 1개",
  "metacognitionTip": "학생의 확신도 대비 실제 논리 완성도에 대한 메타인지 피드백 (과도한 확신 경계 또는 자신감 부여)"
}`;

    if (!ai) {
      return res.json({
        logicScore: 82,
        strength: '대가야의 대외 교섭과 고고학적 유물을 구체적인 사료적 근거로 연결하여 주장의 실체성을 잘 확보했습니다.',
        vulnerability: '지산동 고분의 대형 순장묘가 과연 가야 전역의 중앙집권적 지배를 의미하는지, 아니면 고령 지역에 한정된 수장권인지에 대한 상대방의 반론에 취약할 수 있습니다.',
        evidenceCheck: '『남제서』의 하지왕 조공 기록과 『삼국사기』 신라본기 기록을 교차 검토하여 대가야의 외교적 주체성을 입증할 필요가 있습니다.',
        reflectionQuestion: '신라 마립간기 역시 불교 수용 이전이었음에도 고대국가의 범주에 넣는다면, 가야와의 결정적 차이는 무엇일까요?',
        metacognitionTip: '현재 확신도가 적절하지만, 상대방이 제기할 제도적(율령, 불교) 결여 지적에 대한 대비책을 미리 세워두면 훨씬 단단해집니다.',
      });
    }

    const prompt = `주제: ${topic || '가야사 고대국가 발전 및 시대구분 논쟁'}
학생의 주장: "${claim}"
제시한 사료 및 근거: "${evidence}"
학생의 본인 확신도: ${confidence} / 5점

위 내용을 바탕으로 객관적이고 교육적인 형성 피드백을 JSON으로 제공해 주세요.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Diagnosis error:', error);
    res.status(500).json({ error: error.message || '진단 생성 중 오류가 발생했습니다.' });
  }
});

// API 4: Debate Brief & 'My Own History Textbook' Generator
app.post('/api/generate-brief', async (req, res) => {
  try {
    const { topic, userStance, keyEvidences, userThoughts, teamName } = req.body;

    const systemInstruction = `당신은 고등학교 한국사 교과서 집필자이자 토론 코치입니다.
학생이 탐구한 내용을 바탕으로 다음 두 가지 산출물을 작성해 주세요:
1. 실전 학급 토론 입론서 (입론 취지, 3가지 핵심 논거, 예상 반론과 재반론 계획, 결론)
2. '나만의 역사 교과서' 한 페이지 (단원명, 탐구 소제목, 본문 서술 2~3단락, 생각 더하기 탐구 질문, 사료 돋보기 코너)

JSON 형식으로 응답하세요:
{
  "debateBrief": {
    "title": "토론 입론서 제목",
    "stanceSummary": "한 문장 명제 요약",
    "arguments": [
      { "point": "논거 1 핵심 요약", "explanation": "사료와 학술적 근거를 바탕으로 한 상세 설명" },
      { "point": "논거 2 핵심 요약", "explanation": "상세 설명" },
      { "point": "논거 3 핵심 요약", "explanation": "상세 설명" }
    ],
    "anticipatedRebuttal": "상대측의 주요 예상 반론",
    "counterRebuttal": "우리의 재반론 논리",
    "closing": "최종 마무리 발언"
  },
  "textbookPage": {
    "unitTitle": "Ⅰ. 근대 이전 한국사의 이해 > 01. 고대 국가의 성장 > 2. 삼국·가야의 발전",
    "sectionTitle": "학생의 관점이 담긴 참신한 소단원 제목 (예: 철과 음악의 나라 가야, 고대국가의 문을 열다)",
    "bodyParagraphs": ["본문 첫 번째 단락", "본문 두 번째 단락", "본문 세 번째 단락"],
    "sourceSpotlight": {
      "title": "사료 돋보기 제목 (예: 『남제서』 가라국전 속 하지왕의 외교)",
      "content": "사료 인용 및 해석 해설"
    },
    "inquiryQuestion": "학생들이 함께 생각해 볼 탐구 질문 1~2개"
  }
}`;

    if (!ai) {
      return res.json({
        debateBrief: {
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
        },
        textbookPage: {
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
        },
      });
    }

    const prompt = `팀/작성자: ${teamName || 'Good조'}
주제: ${topic}
입장: ${userStance}
학생이 선정한 핵심 사료: ${keyEvidences || '남제서 하지왕 조공 기록, 고령 지산동 고분군, 우륵의 가야 12곡'}
학생의 생각: "${userThoughts || '가야를 결론 위주로 암기하지 않고 다양한 학설을 비교하여 논리적인 입장을 세우고 싶다'}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.6,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Generate brief error:', error);
    res.status(500).json({ error: error.message || '입론서 생성 중 오류가 발생했습니다.' });
  }
});

// Serve frontend with Vite middlewares in development
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
