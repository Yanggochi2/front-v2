// 사이드바·상단 메뉴에 보여 줄 병동 정보. 10/26 계약부터 로그인·역할 구분이 없고, 관리 링크로 들어온 수간호사 화면 하나다.
export type ShellInfo = {
  hospitalName: string;
  wardName: string;
};
