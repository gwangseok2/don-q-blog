/**
 * 애드센스 "광고 설정 미리보기" 호환 패치 (<head> 최상단 인라인 스크립트)
 *
 * 애드센스 미리보기는 사이트 HTML을 Google 서버(autoads-preview.googleusercontent.com)의
 * sandbox iframe 안에 srcdoc으로 넣어 렌더링합니다. 이때 window.location.href가 "about:srcdoc"이 되는데,
 * Next.js App Router가 시작하면서 `new URL(canonicalUrl, window.location.href)`를 호출하고
 * "about:srcdoc"은 기준 URL로 쓸 수 없어 `TypeError: Invalid URL`이 발생 → 페이지 전체가
 * "Application error"로 실패합니다. 또한 같은 환경에서 history.replaceState도 SecurityError를 던집니다.
 *
 * 이 스크립트는 location이 about: 일 때만 동작하며(일반 방문자에게는 아무 영향 없음)
 *  1) about: 기준 URL로 URL 생성에 실패하면 document.baseURI(또는 사이트 주소)를 기준으로 재시도하고
 *  2) history.pushState/replaceState의 SecurityError를 무시합니다.
 */
export const SRCDOC_PREVIEW_FIX = `(function(){try{
if(location.protocol!=='about:')return;
var b=document.baseURI;var F=(b&&b.indexOf('about:')!==0)?b:'https://donqlog.com/';
var N=window.URL;
window.URL=new Proxy(N,{construct:function(t,a){try{return Reflect.construct(t,a)}catch(e){if(a.length>1&&String(a[1]).indexOf('about:')===0)return new t(a[0],F);throw e}}});
['pushState','replaceState'].forEach(function(k){var o=history[k];history[k]=function(){try{return o.apply(history,arguments)}catch(e){if(e&&e.name==='SecurityError')return;throw e}}});
}catch(e){}})();`;
