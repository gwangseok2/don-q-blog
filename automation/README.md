# 발행 자동화

```
[월·목 09:00] Draft post 워크플로
   주제 큐(topics.md) 또는 자동 선정 → Claude가 웹 검색으로 조사 → 초안 + 커버 생성 → 규칙 검사 → PR
        ↓
[사람] PR 검토 (Cloudflare 프리뷰로 확인, 수치 대조, 코멘트 추가) → 머지
        ↓
[매일 00:05] Scheduled deploy 워크플로
   date가 오늘인 글이 있으면 Cloudflare 재빌드 → 공개
```

| 파일 | 역할 |
|---|---|
| `src/lib/api.ts` | `date`가 오늘(KST)보다 미래인 글을 목록·사이트맵·RSS·정적 페이지에서 제외 |
| `.github/workflows/scheduled-deploy.yml` | 매일 00:05 KST, 공개 예정 글이 있으면 Cloudflare Deploy Hook 호출 |
| `.github/workflows/draft-post.yml` | 초안 생성 후 PR (스케줄 + 수동 실행) |
| `.github/workflows/post-check.yml` | 글이 바뀌는 모든 PR에 `audit-posts` 규칙 검사 |
| `scripts/draft-post.mjs` | Claude API 호출, rule.md 준수 보정(`**`→`<strong>`, 슬러그 정리 등) |
| `scripts/make-cover.mjs` | 1200×630 커버 PNG 생성 |
| `automation/topics.md` | 쓰고 싶은 주제 대기열 |

## 최초 설정 (1회)

1. **Cloudflare Deploy Hook**
   Cloudflare 대시보드 → Workers & Pages → 블로그 프로젝트 → Settings → Builds → Deploy hooks → 생성 (브랜치 `main`)
   → GitHub 저장소 Settings → Secrets and variables → Actions → `CF_DEPLOY_HOOK_URL` 로 저장
2. **Anthropic API 키**
   https://platform.claude.com 에서 키 발급 → 시크릿 `ANTHROPIC_API_KEY` 로 저장
3. **Actions 권한**
   Settings → Actions → General → Workflow permissions →
   "Read and write permissions" 선택 + "Allow GitHub Actions to create and approve pull requests" 체크
4. (선택) 모델 변경: Variables 탭에서 `DRAFT_MODEL` = `claude-sonnet-5-5` (비용 절감)

## 사용법

- **주제 지정해서 바로 초안**: Actions → Draft post → Run workflow → 주제 입력
- **주제 쌓아두기**: `automation/topics.md`의 대기열에 `- [ ] 주제 | 카테고리 | 메모` 추가
- **직접 쓴 글 예약**: frontmatter `date`를 미래 날짜로 두고 main에 머지하면 그날 공개
- **로컬에서 예약 글 미리보기**: `SHOW_FUTURE_POSTS=true npm run dev`
- **커버만 만들기**: `npm run cover -- --title "제목" --category home-tip --out public/assets/blog/slug/cover.png`

## 원칙

- AI 초안은 **자동 머지하지 않습니다.** 수치 오류는 신뢰도와 검색 평가에 직접 타격이 됩니다.
- 맛집·일상·여행·매매일지는 자동 작성 대상이 아닙니다(직접 경험 필요). AI는 보유 종목·수익률 등 개인 경험을 지어내지 않도록 지시되어 있습니다.
