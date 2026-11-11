import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase 환경 변수가 설정되지 않았습니다. 공감 및 댓글 기능이 제한될 수 있습니다.");
}

/**
 * Supabase 클라이언트를 "처음 사용할 때" 생성합니다.
 *
 * 애드센스 광고 설정 미리보기처럼 sandbox iframe(allow-same-origin 없음) 안에서는
 * createClient() 내부의 realtime-js가 window.sessionStorage를 읽는 순간
 * SecurityError를 던집니다. 예전처럼 모듈 최상단에서 생성하면 이 예외로
 * 페이지 전체가 "Application error"로 죽기 때문에, 생성을 지연하고
 * 실패하면 공감·댓글 기능만 비활성화합니다.
 */
let client: SupabaseClient | null | undefined;

function getClient(): SupabaseClient | null {
    if (client !== undefined) return client;
    try {
        client = createClient(supabaseUrl, supabaseAnonKey, {
            // 로그인 기능을 쓰지 않으므로 세션 저장·자동 갱신 비활성화 (저장소 의존 최소화)
            auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
        });
    } catch (e) {
        console.warn("Supabase 클라이언트를 생성할 수 없는 환경입니다. 공감 및 댓글 기능을 비활성화합니다.", e);
        client = null;
    }
    return client;
}

/**
 * 기존 코드(`supabase.from(...)`)를 그대로 쓸 수 있도록 지연 생성 프록시로 내보냅니다.
 * 클라이언트를 만들 수 없는 환경에서는 호출 시 에러를 던지며, 호출부의 try/catch에서 처리됩니다.
 */
export const supabase = new Proxy({} as SupabaseClient, {
    get(_target, prop) {
        const c = getClient();
        if (!c) throw new Error("Supabase를 사용할 수 없는 환경입니다.");
        const value = Reflect.get(c, prop, c);
        return typeof value === "function" ? value.bind(c) : value;
    },
});
