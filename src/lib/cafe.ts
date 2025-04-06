import { CafeInfo } from '@/types/types';

export async function getCafeById(id: string): Promise<CafeInfo | null> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('인증 토큰이 없습니다.');
    }

    const response = await fetch(`/api/manager/cafes/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('카페 정보를 가져오는데 실패했습니다.');
    }

    const data = await response.json();
    return data.cafe;
  } catch (error) {
    console.error('Error fetching cafe:', error);
    return null;
  }
} 