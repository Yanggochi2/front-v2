import { redirect } from "next/navigation";

// 앱의 시작 화면은 /schedule이다. 로그인하지 않았으면 (app) 레이아웃이 /login으로 보낸다.
export default function RootPage() {
  redirect("/schedule");
}
