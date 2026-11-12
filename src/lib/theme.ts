// 화면 모드(라이트/다크). 선택은 이 브라우저에만 기억한다 (localStorage). 서버 값이 아니다.
export type Theme = "light" | "dark";

export const THEME_KEY = "ottugi.theme";

// 첫 화면을 그리기 전에 저장된 모드를 <html>에 걸어 라이트로 잠깐 보이는 깜빡임을 막는다 (app/layout.tsx의 <head>).
export const THEME_INIT_SCRIPT = `try{if(localStorage.getItem("${THEME_KEY}")==="dark")document.documentElement.dataset.theme="dark"}catch(e){}`;
