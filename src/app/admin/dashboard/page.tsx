'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import Link from 'next/link';

interface Cafe {
  id: string;
  name: string;
  address: string;
  updatedAt: string;
}

interface User {
  id: string;
  email: string;
  role: string;
}

export default function AdminDashboard() {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCafes, setFilteredCafes] = useState<Cafe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const fetchCafes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/cafes');
      if (!response.ok) {
        throw new Error('카페 목록을 불러오는데 실패했습니다.');
      }
      const data = await response.json();

      if (Array.isArray(data)) {
        setCafes(data);
        setFilteredCafes(data);
      } else if (data && Array.isArray(data.data)) {
        setCafes(data.data);
        setFilteredCafes(data.data);
      } else {
        console.error('API 응답이 배열이 아닙니다:', data);
        setCafes([]);
        setFilteredCafes([]);
      }
    } catch (error) {
      console.error('카페 목록 로딩 실패:', error);
      alert('카페 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error('사용자 목록을 불러오는데 실패했습니다.');
      }
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error('사용자 목록 로딩 실패:', error);
      alert('사용자 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCafes();
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = cafes.filter(
      (cafe) =>
        cafe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cafe.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCafes(filtered);
  }, [searchTerm, cafes]);

  const getNaverMapUrl = (query: string) => {
    return `https://map.naver.com/v5/search/${encodeURIComponent(query)}`;
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 이 카페를 삭제하시겠습니까?')) return;
  
    try {
      // 1. 토큰 가져오기
      const token = localStorage.getItem('authToken'); // 로그인 시 저장된 토큰 가져오기
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }
  
      // 2. DELETE 요청 보내기
      const response = await fetch(`/api/admin/cafes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`, // Authorization 헤더에 토큰 추가
        },
      });
  
      // 3. 응답 처리
      if (!response.ok) {
        const errorData = await response.json(); // 서버에서 반환한 에러 메시지 확인
        throw new Error(errorData.error || '삭제 실패');
      }
  
      alert('카페가 삭제되었습니다.');
      fetchCafes(); // 카페 목록 새로고침
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('카페 삭제에 실패했습니다.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">관리자 대시보드</h1>
          <Button
            variant="outline"
            onClick={async () => {
              await fetch('/api/admin/logout', { method: 'POST' });
              router.push('/admin/login');
            }}
          >
            로그아웃
          </Button>
        </div>
        <Link href="/admin/cafes/new">
          <Button>신규 카페 등록</Button>
        </Link>
      </div>

      {/* 사용자 목록 */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">사용자 목록</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-6 py-3 text-left">이메일</th>
                  <th className="px-6 py-3 text-left">현재 역할</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b">
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">{user.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 카페 목록 */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">등록된 카페 목록</h2>
            <div className="w-64">
              <Input
                type="text"
                placeholder="카페명 또는 주소로 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-6 py-3 text-left">카페명</th>
                  <th className="px-6 py-3 text-left">주소</th>
                  <th className="px-6 py-3 text-left">최종 수정일</th>
                  <th className="px-6 py-3 text-center">관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredCafes.map((cafe) => (
                  <tr key={cafe.id} className="border-b">
                    <td className="px-6 py-4">
                      <a
                        href={getNaverMapUrl(cafe.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {cafe.name}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={getNaverMapUrl(cafe.address)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {cafe.address}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(cafe.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link href={`/admin/cafes/${cafe.id}/edit`}>
                        <Button variant="outline" className="mr-2">
                          수정
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(cafe.id)}
                      >
                        삭제
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCafes.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              {searchTerm ? '검색 결과가 없습니다.' : '등록된 카페가 없습니다.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
