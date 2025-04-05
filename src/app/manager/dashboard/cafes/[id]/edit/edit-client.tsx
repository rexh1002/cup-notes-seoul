'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CafeInfo } from '@/lib/api';

const CUSTOM_INPUT_STYLE = "text-blue-600 font-bold";

const DAYS_OF_WEEK = ['매일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];
const SNS_TYPES = ['네이버지도', '인스타그램', '페이스북', '홈페이지', '기타'];

const ORIGINS = [
  '에티오피아', '콜롬비아', '과테말라', '코스타리카', '파나마', '인도네시아', '브라질', '케냐', 
  '엘살바도르', '르완다', '직접입력'
];
const PROCESSES = ['워시드', '내추럴', '허니', '무산소 발효', '디카페인', '직접입력'];
const BREW_METHODS = ['핸드드립', '에스프레소', '콜드브루', '직접입력'];
const ROAST_LEVELS = ['다크', '미디엄다크', '미디엄', '미디엄라이트', '라이트', '직접입력'];

const CUP_NOTES = {
  floral: {
    title: 'Floral',
    notes: ['라벤더', '아카시아', '장미', '자스민', '국화', '히비스커스', '제비꽃', '홍차',
      '얼그레이', '카모마일', '오렌지 블로섬', '은방울꽃', '블랙티', '베르가못', '라일락', '로즈마리', '직접입력']
  },
  fruity: {
    title: 'Fruity',
    notes: ['파인애플', '복숭아', '리치', '사과', '감귤', '배', '패션후르츠', '메론', '파파야', '블루베리',
      '라즈베리', '자두', '딸기', '포도', '자몽', '오렌지', '레몬', '크랜베리', '망고', '체리', '살구', '직접입력']
  },
  nutty: {
    title: 'Nutty',
    notes: ['초콜렛', '캐러멜', '고구마', '꿀', '헤이즐넛', '브라운슈거', '엿기름', '아몬드', '피칸', '호두',
      '로스트피넛', '마카다미아', '땅콩', '바닐라', '캐슈넛', '메이플 시럽', '토피', '피스타치오', '카카오닙스', '직접입력']
  }
};

const NOTE_COLORS = [
  '#FFE4E1', '#FFC0CB', '#FFB6C1', '#FF69B4', '#FF1493',
  '#FFE4B5', '#FFDAB9', '#FFA07A', '#FF7F50', '#FF6347',
  '#98FB98', '#90EE90', '#3CB371', '#2E8B57', '#006400',
  '#E6E6FA', '#D8BFD8', '#DDA0DD', '#DA70D6', '#8B008B',
  '#F0F8FF', '#87CEEB', '#87CEFA', '#4169E1', '#0000CD',
  '#8B4513', '#A0522D', '#CD853F', '#DEB887', '#F4A460',
];

interface BusinessHour {
  day: string;
  openTime: string;
  closeTime: string;
}

interface SnsLink {
  type: string;
  url: string;
}

interface CoffeeInput {
  name: string;
  price: number;
  roastLevel: string[];
  origins: string[];
  processes: string[];
  brewMethods: string[];
  notes: string[];
  noteColors: string[];
  customFields: {
    origins: string[];
    processes: string[];
    brewMethods: string[];
    roastLevels: string[];
    notes: {
      [category: string]: string[];
    };
  };
  description: string | null;
}

interface CafeFormData {
  name: string;
  address: string;
  phone: string;
  description: string;
  businessHours: BusinessHour[];
  businessHourNote: string;
  snsLinks: SnsLink[];
  imageUrl: string;
  coffees: CoffeeInput[];
}

// 유효성 검사 함수들
const validateCafeData = (data: CafeFormData): string | null => {
  if (!data.name.trim()) return '카페명은 필수 입력 항목입니다.';
  if (!data.address.trim()) return '주소는 필수 입력 항목입니다.';
  
  // 영업시간 유효성 검사
  for (const hour of data.businessHours) {
    if (!hour.openTime || !hour.closeTime) {
      return '영업시간을 올바르게 입력해주세요.';
    }
  }

  // SNS 링크 유효성 검사
  for (const link of data.snsLinks) {
    if (link.type && !link.url) {
      return 'SNS 링크의 URL을 입력해주세요.';
    }
  }

  return null;
};

const validateCoffeeData = (coffee: CoffeeInput): string | null => {
  if (!coffee.name.trim()) return '원두명은 필수 입력 항목입니다.';
  if (!coffee.price || coffee.price <= 0) return '원두 가격을 올바르게 입력해주세요.';
  return null;
};

export function EditCafeClient({ cafe }: { cafe: CafeInfo }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CafeFormData>({
    name: cafe.name,
    address: cafe.address,
    phone: cafe.phone,
    description: cafe.description || '',
    businessHours: cafe.businessHours || [],
    businessHourNote: cafe.businessHourNote || '',
    snsLinks: cafe.snsLinks || [],
    imageUrl: cafe.imageUrl || '',
    coffees: (cafe.coffees || []).map(coffee => ({
      ...coffee,
      customFields: {
        origins: [],
        processes: [],
        brewMethods: [],
        roastLevels: [],
        notes: {
          floral: [],
          fruity: [],
          nutty: [],
        },
      },
    })),
  });

  const handleBusinessHourAdd = (day: string) => {
    if (!formData.businessHours.find(hour => hour.day === day)) {
      setFormData(prev => ({
        ...prev,
        businessHours: [...prev.businessHours, {
          day,
          openTime: '09:00',
          closeTime: '21:00'
        }]
      }));
    }
  };

  const handleBusinessHourRemove = (day: string) => {
    setFormData(prev => ({
      ...prev,
      businessHours: prev.businessHours.filter(hour => hour.day !== day)
    }));
  };

  const handleBusinessHourChange = (day: string, field: 'openTime' | 'closeTime', value: string) => {
    setFormData(prev => ({
      ...prev,
      businessHours: prev.businessHours.map(hour =>
        hour.day === day ? { ...hour, [field]: value } : hour
      )
    }));
  };

  const handleSnsLinkAdd = () => {
    setFormData(prev => ({
      ...prev,
      snsLinks: [...prev.snsLinks, { type: '', url: '' }]
    }));
  };

  const handleSnsLinkRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      snsLinks: prev.snsLinks.filter((_, i) => i !== index)
    }));
  };

  const handleSnsLinkChange = (index: number, field: keyof SnsLink, value: string) => {
    setFormData(prev => ({
      ...prev,
      snsLinks: prev.snsLinks.map((link, i) =>
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  const handleCoffeeAdd = () => {
    const newCoffee: CoffeeInput = {
      name: '',
      price: 0,
      roastLevel: [],
      origins: [],
      processes: [],
      brewMethods: [],
      notes: [],
      noteColors: [],
      customFields: {
        origins: [],
        processes: [],
        brewMethods: [],
        roastLevels: [],
        notes: {
          floral: [],
          fruity: [],
          nutty: [],
        },
      },
      description: null,
    };

    setFormData(prev => ({
      ...prev,
      coffees: [...prev.coffees, newCoffee]
    }));
  };

  const handleCoffeeRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      coffees: prev.coffees.filter((_, i) => i !== index)
    }));
  };

  const handleCoffeeChange = (index: number, field: keyof CoffeeInput, value: any) => {
    setFormData(prev => ({
      ...prev,
      coffees: prev.coffees.map((coffee, i) =>
        i === index ? { ...coffee, [field]: value } : coffee
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 기본 유효성 검사
    const cafeError = validateCafeData(formData);
    if (cafeError) {
      toast.error(cafeError);
      return;
    }

    // 원두 데이터 유효성 검사
    for (const coffee of formData.coffees) {
      const coffeeError = validateCoffeeData(coffee);
      if (coffeeError) {
        toast.error(coffeeError);
        return;
      }
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/cafes/${cafe.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          businessHours: Array.isArray(formData.businessHours) ? formData.businessHours : [],
          snsLinks: Array.isArray(formData.snsLinks) ? formData.snsLinks : [],
          coffees: Array.isArray(formData.coffees) ? formData.coffees : [],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '카페 정보 수정에 실패했습니다');
      }

      toast.success('카페 정보가 수정되었습니다');
      router.push('/manager/dashboard');
      router.refresh();
    } catch (error) {
      console.error('Error updating cafe:', error);
      toast.error(error instanceof Error ? error.message : '카페 정보 수정에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto p-6 space-y-6 font-sans">
      <h1 className="text-2xl font-bold mb-6">카페 정보 수정</h1>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">카페명 *</label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">전화번호</label>
          <Input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">주소 *</label>
          <Input
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">설명</label>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
          />
        </div>
      </div>

      {/* 영업시간 섹션 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">영업시간</h2>
        <div className="grid grid-cols-1 gap-4">
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className="flex items-center gap-4">
              <Checkbox
                checked={formData.businessHours.some(hour => hour.day === day)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    handleBusinessHourAdd(day);
                  } else {
                    handleBusinessHourRemove(day);
                  }
                }}
                id={`day-${day}`}
              />
              <label htmlFor={`day-${day}`} className="w-20">{day}</label>
              {formData.businessHours.find(hour => hour.day === day) && (
                <>
                  <Input
                    type="time"
                    className="w-32"
                    value={formData.businessHours.find(hour => hour.day === day)?.openTime}
                    onChange={(e) => handleBusinessHourChange(day, 'openTime', e.target.value)}
                  />
                  <span>-</span>
                  <Input
                    type="time"
                    className="w-32"
                    value={formData.businessHours.find(hour => hour.day === day)?.closeTime}
                    onChange={(e) => handleBusinessHourChange(day, 'closeTime', e.target.value)}
                  />
                </>
              )}
            </div>
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">영업시간 특이사항</label>
          <Input
            name="businessHourNote"
            value={formData.businessHourNote}
            onChange={handleChange}
            placeholder="예: 설날연휴 정상영업"
          />
        </div>
      </div>

      {/* SNS 링크 섹션 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">SNS 링크</h2>
        {formData.snsLinks.map((link, index) => (
          <div key={index} className="grid grid-cols-3 gap-4">
            <select
              className="border rounded-md p-2"
              value={link.type}
              onChange={(e) => handleSnsLinkChange(index, 'type', e.target.value)}
            >
              <option value="">선택하세요</option>
              {SNS_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <div className="col-span-2 flex gap-2">
              <Input
                type="url"
                value={link.url}
                onChange={(e) => handleSnsLinkChange(index, 'url', e.target.value)}
                placeholder="https://"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSnsLinkRemove(index)}
                className="shrink-0"
              >
                삭제
              </Button>
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={handleSnsLinkAdd}>
          SNS 링크 추가
        </Button>
      </div>

      {/* 원두 정보 섹션 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">원두 정보</h2>
          <Button
            type="button"
            variant="outline"
            onClick={handleCoffeeAdd}
          >
            + 원두 추가
          </Button>
        </div>
        {formData.coffees.map((coffee, coffeeIndex) => (
          <Card key={coffeeIndex} className="p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">원두 #{coffeeIndex + 1}</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleCoffeeRemove(coffeeIndex)}
                >
                  삭제
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">원두명 *</label>
                  <Input
                    value={coffee.name}
                    onChange={(e) => handleCoffeeChange(coffeeIndex, 'name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">가격 *</label>
                  <Input
                    type="number"
                    value={coffee.price}
                    onChange={(e) => handleCoffeeChange(coffeeIndex, 'price', Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              {/* 로스팅 레벨 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">로스팅 레벨</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {ROAST_LEVELS.map(level => (
                    <div key={level} className="flex items-center space-x-2">
                      <Checkbox
                        id={`roast-${coffeeIndex}-${level}`}
                        checked={coffee.roastLevel.includes(level)}
                        onCheckedChange={(checked) => {
                          const newLevels = checked
                            ? [...coffee.roastLevel, level]
                            : coffee.roastLevel.filter(l => l !== level);
                          handleCoffeeChange(coffeeIndex, 'roastLevel', newLevels);
                        }}
                      />
                      <label
                        htmlFor={`roast-${coffeeIndex}-${level}`}
                        className={level === '직접입력' ? CUSTOM_INPUT_STYLE : ''}
                      >
                        {level}
                      </label>
                    </div>
                  ))}
                </div>
                {coffee.roastLevel.includes('직접입력') && (
                  <Input
                    className="mt-2"
                    placeholder="직접 입력"
                    value={coffee.customFields.roastLevels.join(', ')}
                    onChange={(e) => {
                      const updatedCoffees = [...formData.coffees];
                      updatedCoffees[coffeeIndex].customFields.roastLevels = 
                        e.target.value.split(',').map(item => item.trim());
                      setFormData({ ...formData, coffees: updatedCoffees });
                    }}
                  />
                )}
              </div>

              {/* 원산지 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">원산지</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {ORIGINS.map(origin => (
                    <div key={origin} className="flex items-center space-x-2">
                      <Checkbox
                        id={`origin-${coffeeIndex}-${origin}`}
                        checked={coffee.origins.includes(origin)}
                        onCheckedChange={(checked) => {
                          const newOrigins = checked
                            ? [...coffee.origins, origin]
                            : coffee.origins.filter(o => o !== origin);
                          handleCoffeeChange(coffeeIndex, 'origins', newOrigins);
                        }}
                      />
                      <label
                        htmlFor={`origin-${coffeeIndex}-${origin}`}
                        className={origin === '직접입력' ? CUSTOM_INPUT_STYLE : ''}
                      >
                        {origin}
                      </label>
                    </div>
                  ))}
                </div>
                {coffee.origins.includes('직접입력') && (
                  <Input
                    className="mt-2"
                    placeholder="직접 입력"
                    value={coffee.customFields.origins.join(', ')}
                    onChange={(e) => {
                      const updatedCoffees = [...formData.coffees];
                      updatedCoffees[coffeeIndex].customFields.origins = 
                        e.target.value.split(',').map(item => item.trim());
                      setFormData({ ...formData, coffees: updatedCoffees });
                    }}
                  />
                )}
              </div>

              {/* 가공방식 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">가공방식</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {PROCESSES.map(process => (
                    <div key={process} className="flex items-center space-x-2">
                      <Checkbox
                        id={`process-${coffeeIndex}-${process}`}
                        checked={coffee.processes.includes(process)}
                        onCheckedChange={(checked) => {
                          const newProcesses = checked
                            ? [...coffee.processes, process]
                            : coffee.processes.filter(p => p !== process);
                          handleCoffeeChange(coffeeIndex, 'processes', newProcesses);
                        }}
                      />
                      <label
                        htmlFor={`process-${coffeeIndex}-${process}`}
                        className={process === '직접입력' ? CUSTOM_INPUT_STYLE : ''}
                      >
                        {process}
                      </label>
                    </div>
                  ))}
                </div>
                {coffee.processes.includes('직접입력') && (
                  <Input
                    className="mt-2"
                    placeholder="직접 입력"
                    value={coffee.customFields.processes.join(', ')}
                    onChange={(e) => {
                      const updatedCoffees = [...formData.coffees];
                      updatedCoffees[coffeeIndex].customFields.processes = 
                        e.target.value.split(',').map(item => item.trim());
                      setFormData({ ...formData, coffees: updatedCoffees });
                    }}
                  />
                )}
              </div>

              {/* 추출방식 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">추출방식</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {BREW_METHODS.map(method => (
                    <div key={method} className="flex items-center space-x-2">
                      <Checkbox
                        id={`brew-${coffeeIndex}-${method}`}
                        checked={coffee.brewMethods.includes(method)}
                        onCheckedChange={(checked) => {
                          const newMethods = checked
                            ? [...coffee.brewMethods, method]
                            : coffee.brewMethods.filter(m => m !== method);
                          handleCoffeeChange(coffeeIndex, 'brewMethods', newMethods);
                        }}
                      />
                      <label
                        htmlFor={`brew-${coffeeIndex}-${method}`}
                        className={method === '직접입력' ? CUSTOM_INPUT_STYLE : ''}
                      >
                        {method}
                      </label>
                    </div>
                  ))}
                </div>
                {coffee.brewMethods.includes('직접입력') && (
                  <Input
                    className="mt-2"
                    placeholder="직접 입력"
                    value={coffee.customFields.brewMethods.join(', ')}
                    onChange={(e) => {
                      const updatedCoffees = [...formData.coffees];
                      updatedCoffees[coffeeIndex].customFields.brewMethods = 
                        e.target.value.split(',').map(item => item.trim());
                      setFormData({ ...formData, coffees: updatedCoffees });
                    }}
                  />
                )}
              </div>

              {/* 컵 노트 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">컵 노트</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(CUP_NOTES).map(([category, { title, notes }]) => (
                    <div key={category} className="space-y-2">
                      <h4 className="font-medium text-gray-700">{title}</h4>
                      <div className="space-y-1">
                        {notes.map(note => (
                          <div key={note} className="flex items-center">
                            <Checkbox
                              id={`note-${coffeeIndex}-${category}-${note}`}
                              checked={note === '직접입력'
                                ? coffee.notes.includes(`${category}-직접입력`)
                                : coffee.notes.includes(note)}
                              onCheckedChange={(checked) => {
                                const noteValue = note === '직접입력' ? `${category}-직접입력` : note;
                                const newNotes = checked
                                  ? [...coffee.notes, noteValue]
                                  : coffee.notes.filter(n => n !== noteValue);
                                handleCoffeeChange(coffeeIndex, 'notes', newNotes);
                              }}
                            />
                            <label
                              htmlFor={`note-${coffeeIndex}-${category}-${note}`}
                              className={`ml-2 ${note === '직접입력' ? CUSTOM_INPUT_STYLE : ''}`}
                            >
                              {note}
                            </label>
                          </div>
                        ))}
                      </div>
                      {coffee.notes.includes(`${category}-직접입력`) && (
                        <Input
                          placeholder="직접 입력"
                          value={coffee.customFields.notes[category].join(', ')}
                          onChange={(e) => {
                            const updatedCoffees = [...formData.coffees];
                            updatedCoffees[coffeeIndex].customFields.notes[category] = 
                              e.target.value.split(',').map(item => item.trim());
                            setFormData({ ...formData, coffees: updatedCoffees });
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 노트 색상 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">노트 색상</label>
                <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                  {NOTE_COLORS.map((color, colorIndex) => (
                    <div
                      key={colorIndex}
                      className={`w-8 h-8 rounded cursor-pointer border-2 ${
                        coffee.noteColors.includes(color) ? 'border-blue-500' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        const newColors = coffee.noteColors.includes(color)
                          ? coffee.noteColors.filter(c => c !== color)
                          : [...coffee.noteColors, color];
                        handleCoffeeChange(coffeeIndex, 'noteColors', newColors);
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* 설명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700">설명</label>
                <Textarea
                  value={coffee.description || ''}
                  onChange={(e) => handleCoffeeChange(coffeeIndex, 'description', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 이미지 URL */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">이미지 URL</label>
        <Input
          name="imageUrl"
          type="url"
          value={formData.imageUrl}
          onChange={handleChange}
          placeholder="https://"
        />
      </div>

      {/* 버튼 */}
      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? '수정 중...' : '수정하기'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          취소
        </Button>
      </div>
    </form>
  );
} 