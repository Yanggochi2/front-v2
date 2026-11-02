// 사이드바·상단 메뉴에 보여 줄 병동과 로그인한 수간호사 정보.
// 10/26 계약부터 계정은 수간호사만 있어 역할별 메뉴가 없다. 일반 간호사는 공유 링크로 본다.
export type ShellInfo = {
  hospitalName: string;
  wardName: string;
  userName: string;
};
