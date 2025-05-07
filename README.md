# AI 문제은행 & 운세 서비스 (Vue + Electron + NestJS)

> ⚠️ 본 프로젝트는 Vue + Electron + AI 기술 데모 및 실습을 목적으로 하며, API 서버는 필수 기능 위주로만 구현되어 있습니다.  
> (비즈니스 고도화 / 확장성은 고려하지 않았습니다.)

## 🏗️ 주요 기능

- AI 문제 자동 생성(교육 단계/학년별)
- AI 운세 제공(생년월일, 출생시간, 일간/주간/월간)
- 문제 임베딩 및 유사도 검증  
  (로컬 Ollama nomic-embed-text + Qdrant 벡터 DB, 중복 방지)
- 회원 관리(가입, 로그인, 프로필 수정)
- 데스크탑 앱(Electron)
- Notion 연동(포트폴리오 자동 기록)

---

## 🛠️ 기술 스택

- **Frontend**: Vue 3, TypeScript, Electron
- **Backend**: NestJS, Node.js
- **AI**: Ollama API (로컬 LLM, qwen3:30b-a3b), nomic-embed-text(임베딩)
- **Vector DB**: Qdrant (768차원 벡터)
- **DB**: MySQL
- **기타**: MCP 서버, Notion API

---

## ⚙️ 프로젝트 구조

```
src/
  api/
    llm/            # AI 문제/운세/임베딩/유사도 검증 서비스
    learning-quiz/  # 학습 퀴즈 관리
    user/           # 회원 관리
    auth/           # 인증/인가
  prisma/           # Prisma ORM 설정
  config/           # 환경설정
  filters/          # NestJS 필터
  interceptors/     # NestJS 인터셉터
```

---

## 🚀 실행 방법

```bash
# 의존성 설치
yarn install

# 개발 서버 실행
yarn run start:dev

# 프로덕션 빌드 및 실행
yarn run build
yarn run start:prod
```

---

## 🧠 AI 문제 생성 및 중복 방지 로직

- 문제 생성 시 Ollama의 qwen3:30b-a3b LLM을 사용
- 생성된 문제는 nomic-embed-text 임베딩 모델로 벡터화
- Qdrant 벡터 DB에 저장된 기존 문제들과의 유사도를 검증(0.85 이상이면 중복)
- 중복이면 재생성, 중복이 아니면 벡터 DB에 저장

---

## 📝 Notion 연동

- MCP 서버를 통해 Notion 포트폴리오 페이지에 프로젝트 진행 내역 자동 기록

---

## 💡 기타

- 테스트, 배포, 환경설정 등은 필요에 따라 추가 작성
