/**
 * [임시 진단] 애드센스 광고 설정 미리보기 "Application error" 원인 수집용
 *
 * 애드센스 미리보기는 Google 서버가 사이트를 직접 렌더링한 뒤 DOM 스냅샷(스크립트 제거,
 * <style>은 유지)을 보여줍니다. 그 서버 렌더러에서 앱이 죽기 때문에 브라우저 콘솔로는
 * 원인을 볼 수 없습니다.
 *
 * 이 스크립트는 오류가 발생했을 때만 <head>에 <style id="donq-diag">를 만들고
 * 오류 메시지·스택·User-Agent를 CSS 주석으로 기록합니다.
 * React가 오류 화면을 그릴 때도 <head>의 <style>은 지우지 않으므로 스냅샷에 남습니다.
 * 오류가 없는 일반 방문자에게는 아무것도 하지 않습니다.
 *
 * 원인을 찾아 고친 뒤 이 파일과 layout.tsx의 사용 부분을 삭제합니다.
 */
export const RENDER_DIAGNOSTICS = `(function(){try{
var n=0,el=null,MAX=12;
function str(a){try{if(a&&a.stack)return String(a.stack);if(a&&typeof a==='object')return JSON.stringify(a);return String(a)}catch(e){return String(a)}}
function w(kind,msg){try{if(n>=MAX)return;n++;
if(!el){el=document.createElement('style');el.id='donq-diag';(document.head||document.documentElement).appendChild(el);
el.appendChild(document.createTextNode('/* ua: '+navigator.userAgent+' | href: '+location.href+' | t: '+Math.round(performance.now())+'ms */\\n'));}
el.appendChild(document.createTextNode('/* '+kind+' @'+Math.round(performance.now())+'ms: '+String(msg).replace(/\\*\\//g,'* /').slice(0,2000)+' */\\n'));
}catch(e){}}
addEventListener('error',function(e){
var t=e.target;
if(t&&t!==window&&(t.src||t.href)){w('resource-error','<'+t.tagName+'> '+(t.src||t.href));return}
w('error',(e.message||'')+' @ '+(e.filename||'')+':'+(e.lineno||'')+':'+(e.colno||'')+' | '+str(e.error));
},true);
addEventListener('unhandledrejection',function(e){w('rejection',str(e.reason))});
var ce=console.error;console.error=function(){try{w('console.error',[].map.call(arguments,str).join(' '))}catch(_){}return ce.apply(console,arguments)};
}catch(e){}})();`;
