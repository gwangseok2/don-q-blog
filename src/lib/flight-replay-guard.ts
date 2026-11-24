/**
 * RSC(서버 컴포넌트) 데이터 중복 주입 방지 (<head> 인라인 스크립트, Next.js 스크립트보다 먼저 실행)
 *
 * Next.js는 페이지 데이터를 인라인 스크립트로 넣습니다.
 *   self.__next_f.push([0])            ← 시작 표시 (페이지당 1번)
 *   self.__next_f.push([1, "..."])     ← 데이터 조각 (여러 번)
 *
 * 애드센스 광고 설정 미리보기의 Google 서버 렌더러(UA에 GoogleAdSenseInfeed)는 같은 창에서
 * 페이지 스크립트를 다시 실행합니다(진단 결과 [0]이 두 번 들어옴). 그러면 window에 남아 있는
 * __next_f로 이미 처리한 데이터 조각이 다시 들어가고, React가 같은 조각을 또 받아
 *   TypeError: t.reason.enqueueModel is not a function
 * 으로 앱 전체가 "Application error"가 됩니다.
 *
 * 이 스크립트는 __next_f를 감싸서, 두 번째 [0]이 들어온 뒤("다시 실행" 상태)에는
 * 이미 받은 조각과 내용이 같은 조각을 순서대로 비교해 버리고, 새 조각만 Next.js에 넘깁니다.
 * (페이지 전체를 다시 실행하는 경우와 스크립트마다 두 번씩 실행하는 경우 모두 처리)
 *
 * 일반 방문자는 [0]이 한 번만 들어오므로 "다시 실행" 상태가 되지 않고, 동작이 바뀌지 않습니다.
 * Next.js가 나중에 `__next_f.push = 콜백`으로 덮어써도 감시가 유지되도록 push를 getter/setter로 정의합니다.
 */
export const FLIGHT_REPLAY_GUARD = `(function(){try{
var g=self;
if(g.__next_f&&g.__next_f.__donqGuard)return;
var arr=g.__next_f||[];
var inner=null,booted=false,replay=false,pos=0,dropped=0,got=[];
function note(m){try{g.__donqDiag&&g.__donqDiag('flight-guard',m)}catch(e){}}
function accept(s){
if(!s||typeof s!=='object')return true;
if(s[0]===0){if(booted){if(!replay)note('replay detected after '+got.length+' segments');replay=true;pos=0;return false}booted=true;return true}
if(s[0]===1||s[0]===3){
if(replay&&pos<got.length&&got[pos][0]===s[0]&&got[pos][1]===s[1]){pos++;dropped++;return false}
got.push(s);if(replay)pos=got.length-1;return true}
return true}
function push(){for(var i=0;i<arguments.length;i++){var s=arguments[i];if(!accept(s))continue;if(inner)inner(s);else Array.prototype.push.call(arr,s)}return arr.length}
Object.defineProperty(arr,'push',{configurable:true,get:function(){return push},set:function(fn){inner=fn}});
Object.defineProperty(arr,'__donqGuard',{value:true});
Object.defineProperty(arr,'__donqStats',{get:function(){return {replay:replay,dropped:dropped,received:got.length}}});
g.__next_f=arr;
}catch(e){}})();`;
