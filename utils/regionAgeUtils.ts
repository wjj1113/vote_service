export const regions = [
  '서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종',
  '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
];

export const ageGroups = ['20대', '30대', '40대', '50대', '60대 이상'];

export function getRegionColor(region: string) {
  const colors: { [key: string]: string } = {
    서울: 'bg-red-100',
    경기: 'bg-blue-100',
    인천: 'bg-green-100',
    부산: 'bg-yellow-100',
    대구: 'bg-purple-100',
    광주: 'bg-pink-100',
    대전: 'bg-indigo-100',
    울산: 'bg-gray-100',
    세종: 'bg-orange-100',
    강원: 'bg-teal-100',
    충북: 'bg-cyan-100',
    충남: 'bg-lime-100',
    전북: 'bg-emerald-100',
    전남: 'bg-amber-100',
    경북: 'bg-sky-100',
    경남: 'bg-violet-100',
    제주: 'bg-fuchsia-100',
  };
  return colors[region] || 'bg-gray-100';
} 