/**
 * RSC(서버 컴포넌트) 데이터 중복 주입 방지 (<head> 인라인 스크립트, Next.js 스크립트보다 먼저 실행)
 *
 * Next.js는 페이지 데이터를 인라인 스크립트로 넣습니다.
 *   self.__next_f.push([0])            ← 시작 표시 (페이지당 1번)
 *   self.__next_f.push([1, "..."])     ← 데이터 조각 (여러 번)
 *
 * 같은 창에서 페이지 스크립트가 다시 실행되면 이미 처리한 데이터 조각이 다시 들어가
 * React가 `TypeError: t.reason.enqueueModel is not a function` 등으로 앱 전체가 죽습니다.
 * 이 스크립트는 __next_f를 감싸서, 두 번째 [0]이 들어온 뒤("다시 실행" 상태)에는
 * 이미 받은 조각과 내용이 같은 조각을 순서대로 비교해 버리고, 새 조각만 Next.js에 넘깁니다.
 * 일반 방문자는 [0]이 한 번만 들어오므로 "다시 실행" 상태가 되지 않고, 동작이 바뀌지 않습니다.
 *
 * [임시 진단] 데이터 조각 수, 내용 중복, Next.js가 push를 연결한 횟수를 __donqStats로 노출합니다.
 * (render-diagnostics가 오류 시 스냅샷에 기록)
 */
export const FLIGHT_REPLAY_GUARD = `(function(){try{
var g=self;
if(g.__next_f&&g.__next_f.__donqGuard)return;
var arr=g.__next_f||[];
var inner=null,booted=false,replay=false,pos=0,dropped=0,got=[],pushes=0,sets=0,dupes=0,firstDupe=-1,seen={};
function log(m){try{g.__donqLog&&g.__donqLog('flight: '+m)}catch(e){}}
function rs(){try{return document.readyState}catch(e){return '?'}}
function accept(s){
pushes++;
if(!s||typeof s!=='object')return true;
if(pushes===1)log('first push kind='+s[0]+' readyState='+rs());
if(s[0]===0){if(booted){if(!replay)log('second [0] after '+got.length+' segments');replay=true;pos=0;return false}booted=true;return true}
if(s[0]===1||s[0]===3){
var k=s[0]+':'+s[1];if(seen[k]){dupes++;if(firstDupe<0){firstDupe=got.length;log('duplicate content segment at #'+got.length+' len='+String(s[1]).length)}}else seen[k]=1;
if(replay&&pos<got.length&&got[pos][0]===s[0]&&got[pos][1]===s[1]){pos++;dropped++;return false}
got.push(s);if(replay)pos=got.length-1;return true}
return true}
function push(){for(var i=0;i<arguments.length;i++){var s=arguments[i];if(!accept(s))continue;if(inner)inner(s);else Array.prototype.push.call(arr,s)}return arr.length}
Object.defineProperty(arr,'push',{configurable:true,get:function(){return push},set:function(fn){sets++;log('next attached push handler #'+sets+' after '+got.length+' segments, readyState='+rs());inner=fn}});
Object.defineProperty(arr,'__donqGuard',{value:true});
Object.defineProperty(arr,'__donqStats',{get:function(){return {pushes:pushes,received:got.length,handlerSets:sets,dupes:dupes,firstDupe:firstDupe,replay:replay,dropped:dropped}}});
g.__next_f=arr;
}catch(e){}})();`;
