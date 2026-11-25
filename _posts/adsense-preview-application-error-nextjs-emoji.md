---
title: "애드센스 미리보기 Application error 해결기｜Next.js 데이터를 깨뜨린 건 이모지였다"
excerpt: "애드센스 광고 설정 미리보기에서만 Next.js 블로그가 'Application error'로 죽던 문제를 해결한 기록입니다. Google 렌더러가 이모지를 ??로 바꾸면서 RSC 데이터의 바이트 길이가 어긋난 원인과, 빌드 후 이모지 이스케이프로 고친 방법을 정리했습니다."
coverImage: "/assets/blog/adsense-preview-application-error-nextjs-emoji/cover.webp"
date: "2026-11-25"
ogImage:
  url: "/assets/blog/adsense-preview-application-error-nextjs-emoji/cover.jpg"
author:
  name: "돈큐"
  picture: "/assets/blog/authors/donq.webp"
preview: false
category: "common-tip"
---

안녕하세요, 돈큐입니다. 😊

이 블로그는 <strong>Next.js(App Router) 정적 빌드 + Cloudflare Pages</strong>로 운영하고, 애드센스 자동 광고를 달아 두었습니다. 그런데 애드센스 관리 화면의 <strong>광고 설정 미리보기</strong>를 열면 사이트 대신 이런 문구만 덩그러니 나왔습니다.

> Application error: a client-side exception has occurred while loading donqlog.com (see the browser console for more information).

이상한 점은 <strong>실제 방문자 화면은 멀쩡했고 광고 수익도 매일 잡히고 있었다</strong>는 것입니다. 미리보기에서만 죽는 문제였죠. 세 번이나 고쳤다고 생각했다가 실패했고, 네 번째에 진짜 원인을 찾았습니다. 범인은 제가 글마다 넣던 바로 이 <strong>이모지</strong>였습니다. 같은 증상으로 검색하실 분들을 위해 과정을 정리해 둡니다.

---

## 1. 증상: 콘솔 오류도 엉뚱한 곳을 가리켰다

미리보기 화면에서 개발자 도구를 열면 콘솔에 이런 오류가 찍힙니다.

```
preview__ko.js:858 Uncaught TypeError: Cannot read properties of null (reading 'style')
```

처음엔 이걸 단서로 삼았는데, `preview__ko.js`는 제 코드가 아니라 <strong>애드센스 미리보기 화면 자체를 그리는 Google 스크립트</strong>입니다. 블로그 페이지가 먼저 죽어서 내용이 사라지니, Google 스크립트가 찾던 요소가 없어 덩달아 오류를 낸 것이었습니다. 결과였지 원인이 아니었던 거죠.

✔ <strong>교훈 1</strong>: 오류가 찍힌 위치가 원인이 있는 위치는 아닐 수 있습니다.

---

## 2. 빗나간 시도 세 번

"미리보기는 사이트를 iframe 안에 넣어서 보여준다"는 가정을 깔고 브라우저 환경 문제부터 의심했습니다.

1. <strong>localStorage 예외</strong>: 다른 도메인 iframe에서는 저장소 접근만 해도 `SecurityError`가 날 수 있어서, 모든 접근을 try/catch 래퍼로 감쌌습니다.
2. <strong>Supabase 클라이언트</strong>: 생성할 때 `sessionStorage`를 읽기 때문에 처음 쓰는 시점에 만들도록 바꿨습니다.
3. <strong>srcdoc iframe의 URL 문제</strong>: `location.href`가 `about:srcdoc`이면 Next.js의 `new URL()`이 실패할 수 있어서 보정 스크립트를 넣었습니다.

셋 다 그럴듯했고 코드 품질에도 나쁘지 않은 수정이었지만, <strong>미리보기 오류는 그대로</strong>였습니다. 가정부터가 틀렸기 때문입니다.

---

## 3. 진짜 단서: 미리보기는 Google 서버가 그린 "스냅샷"이었다

애드센스 미리보기 화면이 사이트를 어떻게 불러오는지 네트워크 요청을 봤습니다. 애드센스는 `GetPageAndConfig`라는 요청으로 페이지를 받아오는데, 응답 안의 HTML이 이렇게 시작했습니다.

```html
<!DOCTYPE html><html id="__next_error__"><head><style ...>...
```

`__next_error__`는 Next.js 앱이 죽었을 때 그리는 오류 화면입니다. 즉, <strong>내 브라우저에 도착하기 전, Google 서버가 사이트를 렌더링하는 단계에서 이미 앱이 죽어 있었던 겁니다.</strong> 미리보기는 그 결과를 찍은 스냅샷(스크립트는 지우고 화면만 남긴 것)이었습니다.

> 💡 <strong>여기서 잠깐! 왜 이전 수정이 안 먹혔을까?</strong>  
> 브라우저 iframe 환경을 고쳐도 소용이 없었습니다. 오류가 나는 곳은 Google 서버 렌더러였으니까요. 그런데 서버 렌더러의 콘솔은 볼 방법이 없습니다.

---

## 4. 볼 수 없는 콘솔을 보는 방법: `<style>` 주석에 남기기

스냅샷을 자세히 보니 <strong>스크립트는 전부 지워지지만 `<style>` 태그는 남아 있었습니다.</strong> 그리고 React는 오류 화면을 그릴 때도 `<head>`의 `<style>`은 지우지 않습니다.

그래서 `<head>` 맨 위에 "오류가 나면 내용을 `<style>` 안에 CSS 주석으로 적어 두는" 임시 진단 스크립트를 넣고 배포했습니다. 핵심만 줄이면 이런 모양입니다.

```js
addEventListener('error', function (e) {
  var el = document.getElementById('diag') || document.createElement('style');
  el.id = 'diag';
  document.head.appendChild(el);
  el.appendChild(document.createTextNode(
    '/* ' + navigator.userAgent + ' | ' + e.message + ' */'
  ));
}, true);
```

배포 후 미리보기를 새로고침하자 스냅샷에 드디어 서버 렌더러의 오류가 남았습니다.

```
UA: ... (KHTML, like Gecko; GoogleAdSenseInfeed) Chrome/157 ...
TypeError: t.reason.enqueueModel is not a function
```

UA에 `GoogleAdSenseInfeed`가 들어간 Google 렌더러였고, 오류는 React가 <strong>서버 컴포넌트 데이터(RSC)</strong>를 처리하는 코드 안에서 나고 있었습니다.

---

## 5. 오류의 정체: RSC 데이터의 "바이트 길이"가 어긋났다

처음엔 "같은 데이터가 두 번 들어와서 생긴 오류"라고 가설을 세웠는데, 진단을 더 붙여 보니 데이터 중복도, 페이지 재실행도 없었습니다. 대신 React가 "데이터 행"으로 읽고 있던 내용이 이상했습니다.

```
//decrypt.co/383505/nvidia-shares-rise-earnings-beat-...
1인당 해외주식 <strong>매도금액 5,000만 원</strong>까지 ...
```

데이터의 머리 부분이 아니라 <strong>글 본문의 한가운데</strong>를 읽고 있었던 거죠. 데이터를 읽는 위치 자체가 밀렸다는 뜻입니다.

> 💡 <strong>여기서 잠깐! Next.js의 RSC 데이터는 어떻게 생겼나?</strong>  
> Next.js App Router는 페이지 데이터를 `self.__next_f.push([1, "..."])` 형태의 인라인 스크립트로 HTML에 넣습니다. 그 안의 긴 텍스트는 `16:T1af3,<텍스트>`처럼 <strong>"이 텍스트는 0x1af3바이트"</strong>라고 길이를 먼저 선언하는 형식입니다. 읽는 쪽은 그 바이트 수만큼 정확히 잘라 읽고 다음 행으로 넘어갑니다.

그래서 렌더러가 받은 데이터를 직접 같은 방식으로 파싱해 보는 진단을 하나 더 넣었습니다. 결과는 이랬습니다.

```
T row 16 declares 6899 bytes → 실제 텍스트가 더 짧음
… 돈큐입니다. ??  지난 [엔비디아 3분기 실적 프리뷰] …
```

원문에는 `돈큐입니다. 😊`였던 자리가 렌더러 안에서는 `??`로 바뀌어 있었습니다.

| 문자 | UTF-8 바이트 |
|---|---|
| 😊 (원래 이모지) | 4바이트 |
| ?? (렌더러에서 바뀐 결과) | 2바이트 |

정리하면 이렇습니다.

1. Google 미리보기 렌더러가 HTML을 처리하면서 <strong>이모지 같은 4바이트 문자를 `??`로 바꿉니다.</strong> (한글은 3바이트 문자라 괜찮았습니다.)
2. 이모지 하나마다 <strong>2바이트씩 짧아지니</strong>, 선언된 길이만큼 읽으면 다음 행의 앞부분까지 먹어 버립니다.
3. 그 뒤로 행 경계가 전부 어긋나 React가 엉뚱한 곳을 데이터로 해석하고, 결국 앱 전체가 Application error로 죽습니다.

이 블로그 홈페이지의 RSC 데이터에는 이모지가 210개 들어 있었습니다. 피할 수가 없었던 거죠. 😂

---

## 6. 재현과 해결: 빌드 후 이모지를 이스케이프

원인이 맞는지 먼저 일반 Chrome에서 재현해 봤습니다. 사이트 HTML의 이모지를 일부러 `??`로 바꿔서 열었더니 <strong>똑같이 Application error가 났습니다.</strong> 원인 확정입니다.

해결 방법은 간단합니다. HTML 안에 <strong>4바이트 문자를 아예 남기지 않으면</strong> 렌더러가 바꿀 것도 없습니다. 빌드가 끝난 뒤 `out/*.html`을 돌면서 이렇게 바꾸는 스크립트를 추가했습니다.

- `<script>` 안: JS 이스케이프 `😊` → `😊`
- 일반 텍스트·속성: HTML 엔티티 `😊` → `&#x1F60A;`
- `<style>` 안: 그대로 둠

브라우저가 해석한 결과는 원래 이모지와 완전히 같아서, 방문자 화면에서는 아무것도 달라지지 않습니다. 핵심 부분만 보면 이렇습니다.

```js
const ASTRAL = /[\u{10000}-\u{10FFFF}]/gu;

const toJsEscape = (ch) => {
  const cp = ch.codePointAt(0) - 0x10000;
  const hi = (0xd800 + (cp >> 10)).toString(16).toUpperCase();
  const lo = (0xdc00 + (cp & 0x3ff)).toString(16).toUpperCase();
  return `\\u${hi}\\u${lo}`;
};
const toEntity = (ch) => `&#x${ch.codePointAt(0).toString(16).toUpperCase()};`;

export function escapeAstralInHtml(html) {
  let out = "", last = 0, m;
  const block = /<(script|style)\b[^>]*>([\s\S]*?)<\/\1\s*>/gi;
  while ((m = block.exec(html))) {
    out += html.slice(last, m.index).replace(ASTRAL, toEntity);
    out += m[1].toLowerCase() === "script" ? m[0].replace(ASTRAL, toJsEscape) : m[0];
    last = m.index + m[0].length;
  }
  return out + html.slice(last).replace(ASTRAL, toEntity);
}
```

그리고 `package.json`의 빌드 명령에 연결했습니다.

```json
"build": "next build && node scripts/escape-astral-html.mjs out"
```

### ⚠️ 마지막 함정: Cloudflare 빌드 명령

배포했는데 프리뷰에 이모지가 그대로 남아 있었습니다. 알고 보니 <strong>Cloudflare Pages의 빌드 명령이 `next build`로 되어 있어서</strong> `package.json`의 `build` 스크립트를 거치지 않고 있었습니다. Cloudflare 대시보드의 Settings → Build에서 빌드 명령을 <strong>`npm run build`</strong>로 바꾸니 그제서야 적용됐습니다.

---

## 7. 결과

- 배포된 HTML에 이스케이프되지 않은 4바이트 문자: <strong>215개 → 0개</strong>
- 애드센스 광고 설정 미리보기: 모바일·데스크톱 모두 <strong>정상 표시</strong>
- 미리보기에 잡히는 인페이지 광고 위치: <strong>0개 → 6개</strong>
- 방문자 화면의 이모지와 동작은 그대로

이제 미리보기로 광고 형식과 위치를 보면서 설정을 조정할 수 있게 됐습니다. ✅

---

## 💡 마치며

이번 문제를 정리하면 이렇습니다.

✔ 애드센스 광고 설정 미리보기는 내 브라우저가 아니라 <strong>Google 서버 렌더러가 그린 스냅샷</strong>입니다.  
✔ 그 렌더러는 <strong>이모지 같은 4바이트 문자를 `??`로 바꾸고</strong>, Next.js App Router의 RSC 데이터는 바이트 길이 기반이라 그 순간 깨집니다.  
✔ 빌드 후 HTML의 4바이트 문자를 <strong>이스케이프</strong>하면 해결됩니다. 정적 빌드라면 빌드 명령이 그 후처리를 실제로 거치는지도 꼭 확인하세요.

다만 이 동작은 제가 2026년 11월에 관찰한 결과입니다. Google 렌더러나 Next.js 버전이 바뀌면 달라질 수 있으니, 같은 증상이라면 위의 `<style>` 주석 진단으로 실제 오류부터 확인해 보시길 권합니다.

블로그를 운영하면서 검색 노출을 챙기고 계시다면 이 글도 참고해 보세요.

- [티스토리 블로그, 네이버에 잘 보이게 만드는 실전 체크리스트](/posts/tistory-naver-seo-checklist)

---

## ✍️ 개인적인 코멘트

세 번이나 "이번엔 고쳤다"고 생각했던 게 제일 부끄러운 대목입니다. 돌아보면 매번 원인을 <strong>추측</strong>하고 고쳤고, 실제로 무슨 일이 일어나는지는 <strong>관측</strong>하지 않았습니다. 볼 수 없는 서버의 콘솔을 `<style>` 주석으로 꺼내 보고 나서야 진짜 원인이 보였습니다.

그리고 범인이 글마다 습관처럼 넣던 이모지였다는 게 아직도 좀 웃깁니다. 이 글에도 이모지가 잔뜩 들어 있지만, 이제는 빌드할 때 알아서 이스케이프되니 안심하고 쓰겠습니다. 😊
