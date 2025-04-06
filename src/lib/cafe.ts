import { CafeInfo } from '@/types/types';

export async function getCafeById(id: string, token?: string): Promise<CafeInfo | null> {
  try {
    if (!token) {
      throw new Error('인증 토큰이 없습니다.');
    }

    const response = await fetch(`/api/manager/cafes/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const error = await response.json().catch(() => ({ message: '알 수 없는 오류가 발생했습니다.' }));
      throw new Error(error.message || '카페 정보를 가져오는데 실패했습니다.');
    }

    const data = await response.json();
    return data.cafe;
  } catch (error) {
    console.error('Error fetching cafe:', error);
    throw error;
  }
} 