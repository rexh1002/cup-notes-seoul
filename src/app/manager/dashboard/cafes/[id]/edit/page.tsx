import { EditCafeClient } from './edit-client';
import { getCafe } from '@/lib/api';

export default async function EditCafePage({ params }: { params: { id: string } }) {
  const cafe = await getCafe(params.id);
  
  if (!cafe) {
    return <div>카페를 찾을 수 없습니다.</div>;
  }

  return <EditCafeClient cafe={cafe} />;
}
