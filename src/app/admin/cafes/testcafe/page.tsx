'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';

interface CafeFormData {
  name: string;
  address: string;
  phone: string;
  description: string;
  openTime: string;
  closeTime: string;
  closedDays: string[];
  coffees: {
    name: string;
    price: number;
    roastLevel: string[];
    origins: string[];
    description?: string;
  }[];
}

interface Props {
  cafeId?: string;  // 수정 시에만 사용
}

export default function CafeForm({ cafeId }: Props) {
  const router = useRouter();
  const [formData, setFormData] = useState<CafeFormData>({
    name: '',
    address: '',
    phone: '',
    description: '',
    openTime: '',
    closeTime: '',
    closedDays: [],
    coffees: []
  });

  useEffect(() => {
    if (cafeId) {
      // 기존 카페 데이터 불러오기
      fetchCafeData();
    }
  }, [cafeId]);

  const fetchCafeData = async () => {
    try {
      const response = await fetch(`/api/admin/cafes/${cafeId}`);
      const data = await response.json();
      setFormData(data);
    } catch (error) {
      console.error('카페 데이터 로딩 실패:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = cafeId ? `/api/admin/cafes/${cafeId}` : '/api/admin/cafes';
      const method = cafeId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('저장 실패');
      }

      router.push('/admin/dashboard');
    } catch (error) {
      console.error('저장 실패:', error);
      alert('카페 정보 저장에 실패했습니다.');
    }
  };

  const handleCoffeeAdd = () => {
    setFormData(prev => ({
      ...prev,
      coffees: [...prev.coffees, {
        name: '',
        price: 0,
        roastLevel: [],
        origins: [],
        description: ''
      }]
    }));
  };

  const handleCoffeeRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      coffees: prev.coffees.filter((_, i) => i !== index)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        {cafeId ? '카페 정보 수정' : '새 카페 등록'}
      </h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">카페명</label>
          <Input
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">주소</label>
          <Input
            value={formData.address}
            onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">전화번호</label>
          <Input
            value={formData.phone}
            onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">설명</label>
          <Textarea
            value={formData.description}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">오픈 시간</label>
            <Input
              type="time"
              value={formData.openTime}
              onChange={e => setFormData(prev => ({ ...prev, openTime: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">마감 시간</label>
            <Input
              type="time"
              value={formData.closeTime}
              onChange={e => setFormData(prev => ({ ...prev, closeTime: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">원두 정보</h3>
          {formData.coffees.map((coffee, index) => (
            <div key={index} className="p-4 border rounded-lg mb-4">
              <div className="flex justify-between mb-2">
                <h4 className="font-medium">원두 #{index + 1}</h4>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => handleCoffeeRemove(index)}
                >
                  삭제
                </Button>
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="원두명"
                  value={coffee.name}
                  onChange={e => {
                    const newCoffees = [...formData.coffees];
                    newCoffees[index] = { ...coffee, name: e.target.value };
                    setFormData(prev => ({ ...prev, coffees: newCoffees }));
                  }}
                />
                <Input
                  type="number"
                  placeholder="가격"
                  value={coffee.price}
                  onChange={e => {
                    const newCoffees = [...formData.coffees];
                    newCoffees[index] = { ...coffee, price: parseInt(e.target.value) };
                    setFormData(prev => ({ ...prev, coffees: newCoffees }));
                  }}
                />
                <Input
                  placeholder="로스팅 레벨 (쉼표로 구분)"
                  value={coffee.roastLevel.join(', ')}
                  onChange={e => {
                    const newCoffees = [...formData.coffees];
                    newCoffees[index] = { 
                      ...coffee, 
                      roastLevel: e.target.value.split(',').map(s => s.trim()) 
                    };
                    setFormData(prev => ({ ...prev, coffees: newCoffees }));
                  }}
                />
                <Input
                  placeholder="원산지 (쉼표로 구분)"
                  value={coffee.origins.join(', ')}
                  onChange={e => {
                    const newCoffees = [...formData.coffees];
                    newCoffees[index] = { 
                      ...coffee, 
                      origins: e.target.value.split(',').map(s => s.trim()) 
                    };
                    setFormData(prev => ({ ...prev, coffees: newCoffees }));
                  }}
                />
                <Textarea
                  placeholder="원두 설명"
                  value={coffee.description}
                  onChange={e => {
                    const newCoffees = [...formData.coffees];
                    newCoffees[index] = { ...coffee, description: e.target.value };
                    setFormData(prev => ({ ...prev, coffees: newCoffees }));
                  }}
                />
              </div>
            </div>
          ))}
          <Button type="button" onClick={handleCoffeeAdd} className="w-full">
            원두 추가
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          취소
        </Button>
        <Button type="submit">
          {cafeId ? '수정하기' : '등록하기'}
        </Button>
      </div>
    </form>
  );
}