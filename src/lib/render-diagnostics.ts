/**
 * [임시 진단] 애드센스 광고 설정 미리보기 "Application error" 원인 수집용
 *
 * 애드센스 미리보기는 Google 서버가 사이트를 직접 렌더링한 뒤 DOM 스냅샷(스크립트 제거,
 * <style>은 유지)을 보여줍니다. 그 서버 렌더러에서 앱이 죽기 때문에 브라우저 콘솔로는
 * 원인을 볼 수 없습니다.
 *
 * 이 스크립트는 로딩 과정의 이벤트(페이지 로딩 단계, RSC 스트림 종료, 데이터 조각 수 등)를
 * 메모리에만 모아 두었다가, 오류가 발생했을 때만 <head>에 <style id="donq-diag">를 만들고
 * CSS 주석으로 기록합니다. React가 오류 화면을 그릴 때도 <head>의 <style>은 지우지 않으므로
 * 스냅샷에 남습니다. 오류가 없는 일반 방문자에게는 화면에 아무것도 추가하지 않습니다.
 *
 * 원인을 찾아 고친 뒤 이 파일과 layout.tsx의 사용 부분을 삭제합니다.
 */
export const RENDER_DIAGNOSTICS = `(function(){try{
var g=self;g.__donqRuns=(g.__donqRuns||0)+1;
var T0=Math.round(performance.now()),ev=[],n=0,el=null,MAX=14,dumped=false;
function now(){return Math.round(performance.now())}
function log(m){if(ev.length<60)ev.push(now()+'ms '+m)}
g.__donqLog=log;
function str(a){try{if(a&&a.stack)return String(a.stack);if(a&&typeof a==='object')return JSON.stringify(a);return String(a)}catch(e){return String(a)}}
function clean(s){return String(s).replace(/\\*\\//g,'* /')}
function w(kind,msg){try{if(n>=MAX)return;n++;
if(!el){el=document.createElement('style');el.id='donq-diag';(document.head||document.documentElement).appendChild(el);
el.appendChild(document.createTextNode('/* ua: '+navigator.userAgent+' | href: '+location.href+' | start: '+T0+'ms | runs: '+g.__donqRuns+' */\\n'));}
el.appendChild(document.createTextNode('/* '+kind+' @'+now()+'ms: '+clean(msg).slice(0,2500)+' */\\n'));
if(!dumped){dumped=true;try{
var st=g.__next_f&&g.__next_f.__donqStats;
el.appendChild(document.createTextNode('/* flight: '+clean(JSON.stringify(st||null))+' | readyState: '+document.readyState+' | scripts in DOM: '+document.scripts.length+' */\\n'));
var res={};performance.getEntriesByType('resource').forEach(function(r){if(r.name.indexOf('/_next/')>=0){var k=r.name.split('/').pop();res[k]=(res[k]||0)+1}});
var dup=Object.keys(res).filter(function(k){return res[k]>1});
el.appendChild(document.createTextNode('/* next resources: '+Object.keys(res).length+' files, fetched more than once: '+clean(JSON.stringify(dup))+' */\\n'));
el.appendChild(document.createTextNode('/* events: '+clean(ev.join(' | ')).slice(0,4000)+' */\\n'));
}catch(e){}}
}catch(e){}}
g.__donqDiag=w;
if(g.__donqRuns>1)w('info','page script re-executed in the same window');
log('diag start readyState='+document.readyState);
document.addEventListener('readystatechange',function(){log('readyState='+document.readyState+' scripts='+document.scripts.length)});
document.addEventListener('DOMContentLoaded',function(){log('DOMContentLoaded')});
try{var P=ReadableStreamDefaultController.prototype,oc=P.close,oe=P.error;
P.close=function(){log('stream close (desiredSize='+this.desiredSize+') scripts='+document.scripts.length);return oc.apply(this,arguments)};
P.error=function(r){log('stream error: '+str(r).slice(0,300));return oe.apply(this,arguments)};}catch(e){}
addEventListener('error',function(e){
var t=e.target;
if(t&&t!==window&&(t.src||t.href)){log('resource-error <'+t.tagName+'> '+(t.src||t.href));return}
w('error',(e.message||'')+' @ '+(e.filename||'')+':'+(e.lineno||'')+':'+(e.colno||'')+' | '+str(e.error));
},true);
addEventListener('unhandledrejection',function(e){w('rejection',str(e.reason))});
var ce=console.error;console.error=function(){try{w('console.error',[].map.call(arguments,str).join(' '))}catch(_){}return ce.apply(console,arguments)};
var cw=console.warn;console.warn=function(){try{log('console.warn: '+[].map.call(arguments,str).join(' ').slice(0,300))}catch(_){}return cw.apply(console,arguments)};
}catch(e){}})();`;
