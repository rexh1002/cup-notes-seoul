'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';
import { Textarea } from '../../../../../components/ui/textarea';

interface CoffeeInput {
  id?: string;
  name: string;
  price: number;
  roastLevel: string[];
  origins: string[];
  processes: string[];
  description?: string;
  notes: string[];
  brewMethods: string[];
}

interface CafeInput {
  name: string;
  address: string;
  phone: string;
  description: string;
  openTime: string;
  closeTime: string;
  closedDays: string[];
  coffees: CoffeeInput[];
}

interface Props {
  params: {
    id: string;
  };
}

export default function EditCafePage({ params }: Props) {
  const router = useRouter();
  const [formData, setFormData] = useState<CafeInput>({
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
    fetchCafeData();
  }, [params.id]);

  const fetchCafeData = async () => {
    try {
      const response = await fetch(`/api/admin/cafes/${params.id}`);
      if (!response.ok) throw new Error('카페 정보를 불러올 수 없습니다.');
      const data = await response.json();
      setFormData(data);
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
      alert('카페 정보를 불러오는데 실패했습니다.');
      router.push('/admin/dashboard');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/admin/cafes/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('수정 실패');
      }

      alert('카페 정보가 수정되었습니다.');
      router.push('/admin/dashboard');
    } catch (error) {
      console.error('수정 실패:', error);
      alert('카페 정보 수정에 실패했습니다.');
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
        processes: [],
        notes: [],
        brewMethods: [],
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
      <h1 className="text-2xl font-bold mb-6">카페 정보 수정</h1>

      {/* 기본 정보 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            카페명 *
          </label>
          <Input
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            주소 *
          </label>
          <Input
            value={formData.address}
            onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            전화번호
          </label>
          <Input
            value={formData.phone}
            onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            설명
          </label>
          <Textarea
            value={formData.description}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              오픈 시간
            </label>
            <Input
              type="time"
              value={formData.openTime}
              onChange={e => setFormData(prev => ({ ...prev, openTime: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              마감 시간
            </label>
            <Input
              type="time"
              value={formData.closeTime}
              onChange={e => setFormData(prev => ({ ...prev, closeTime: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            휴무일 (쉼표로 구분)
          </label>
          <Input
            value={formData.closedDays.join(', ')}
            onChange={e => setFormData(prev => ({
              ...prev,
              closedDays: e.target.value.split(',').map(day => day.trim())
            }))}
            placeholder="예: 월요일, 화요일"
          />
        </div>
      </div>

      {/* 원두 정보 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">원두 정보</h2>
        {formData.coffees.map((coffee, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">원두 #{index + 1}</h3>
              <Button
                type="button"
                variant="destructive"
                onClick={() => handleCoffeeRemove(index)}
              >
                삭제
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  원두명 *
                </label>
                <Input
                  value={coffee.name}
                  onChange={e => {
                    const newCoffees = [...formData.coffees];
                    newCoffees[index] = { ...coffee, name: e.target.value };
                    setFormData(prev => ({ ...prev, coffees: newCoffees }));
                  }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  가격 *
                </label>
                <Input
                  type="number"
                  value={coffee.price}
                  onChange={e => {
                    const newCoffees = [...formData.coffees];
                    newCoffees[index] = { ...coffee, price: parseInt(e.target.value) };
                    setFormData(prev => ({ ...prev, coffees: newCoffees }));
                  }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  로스팅 레벨 (쉼표로 구분)
                </label>
                <Input
                  value={coffee.roastLevel.join(', ')}
                  onChange={e => {
                    const newCoffees = [...formData.coffees];
                    newCoffees[index] = {
                      ...coffee,
                      roastLevel: e.target.value.split(',').map(level => level.trim())
                    };
                    setFormData(prev => ({ ...prev, coffees: newCoffees }));
                  }}
                  placeholder="예: Light, Medium, Dark"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  원산지 (쉼표로 구분)
                </label>
                <Input
                  value={coffee.origins.join(', ')}
                  onChange={e => {
                    const newCoffees = [...formData.coffees];
                    newCoffees[index] = {
                      ...coffee,
                      origins: e.target.value.split(',').map(origin => origin.trim())
                    };
                    setFormData(prev => ({ ...prev, coffees: newCoffees }));
                  }}
                  placeholder="예: 에티오피아, 케냐, 콜롬비아"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  프로세스 (쉼표로 구분)
                </label>
                <Input
                  value={coffee.processes.join(', ')}
                  onChange={e => {
                    const newCoffees = [...formData.coffees];
                    newCoffees[index] = {
                      ...coffee,
                      processes: e.target.value.split(',').map(process => process.trim())
                    };
                    setFormData(prev => ({ ...prev, coffees: newCoffees }));
                  }}
                  placeholder="예: 워시드, 내추럴, 허니"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  컵 노트 (쉼표로 구분)
                </label>
                <Input
                  value={coffee.notes.join(', ')}
                  onChange={e => {
                    const newCoffees = [...formData.coffees];
                    newCoffees[index] = {
                      ...coffee,
                      notes: e.target.value.split(',').map(note => note.trim())
                    };
                    setFormData(prev => ({ ...prev, coffees: newCoffees }));
                  }}
                  placeholder="예: 초콜릿, 견과류, 캐러멜"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  추출 방식 (쉼표로 구분)
                </label>
                <Input
                  value={coffee.brewMethods.join(', ')}
                  onChange={e => {
                    const newCoffees = [...formData.coffees];
                    newCoffees[index] = {
                      ...coffee,
                      brewMethods: e.target.value.split(',').map(method => method.trim())
                    };
                    setFormData(prev => ({ ...prev, coffees: newCoffees }));
                  }}
                  placeholder="예: 에스프레소, 드립, 콜드브루"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  설명
                </label>
                <Textarea
                  value={coffee.description || ''}
                  onChange={e => {
                    const newCoffees = [...formData.coffees];
                    newCoffees[index] = { ...coffee, description: e.target.value };
                    setFormData(prev => ({ ...prev, coffees: newCoffees }));
                  }}
                  rows={3}
                />
              </div>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleCoffeeAdd}
        >
          원두 추가
        </Button>
      </div>

      <div className="flex justify-end gap-4 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          취소
        </Button>
        <Button type="submit">수정</Button>
      </div>
    </form>
  );
}