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
    coffees: cafe.coffees || [],
  });

  const [selectedOrigins, setSelectedOrigins] = useState<string[]>([]);
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>([]);
  const [selectedBrewMethods, setSelectedBrewMethods] = useState<string[]>([]);
  const [selectedRoastLevels, setSelectedRoastLevels] = useState<string[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [selectedNoteColors, setSelectedNoteColors] = useState<string[]>([]);

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
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>카페 정보 수정</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">카페 이름</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">전화번호</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">주소</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
              />
            </div>

            <div className="space-y-4">
              <Label>영업시간</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {DAYS_OF_WEEK.map(day => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${day}`}
                      checked={formData.businessHours.some(hour => hour.day === day)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleBusinessHourAdd(day);
                        } else {
                          handleBusinessHourRemove(day);
                        }
                      }}
                    />
                    <Label htmlFor={`day-${day}`}>{day}</Label>
                  </div>
                ))}
              </div>
              {formData.businessHours.map(hour => (
                <div key={hour.day} className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`open-${hour.day}`}>오픈 시간</Label>
                    <Input
                      id={`open-${hour.day}`}
                      type="time"
                      value={hour.openTime}
                      onChange={(e) => handleBusinessHourChange(hour.day, 'openTime', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`close-${hour.day}`}>마감 시간</Label>
                    <Input
                      id={`close-${hour.day}`}
                      type="time"
                      value={hour.closeTime}
                      onChange={(e) => handleBusinessHourChange(hour.day, 'closeTime', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessHourNote">영업시간 안내</Label>
              <Textarea
                id="businessHourNote"
                name="businessHourNote"
                value={formData.businessHourNote}
                onChange={handleChange}
                rows={3}
                placeholder="휴무일, 브레이크타임 등 추가 안내사항"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>SNS 링크</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSnsLinkAdd}
                >
                  + 링크 추가
                </Button>
              </div>
              {formData.snsLinks.map((link, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div className="space-y-2">
                    <Label htmlFor={`sns-type-${index}`}>SNS 종류</Label>
                    <select
                      id={`sns-type-${index}`}
                      className="w-full h-10 px-3 rounded-md border"
                      value={link.type}
                      onChange={(e) => handleSnsLinkChange(index, 'type', e.target.value)}
                    >
                      <option value="">선택하세요</option>
                      {SNS_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`sns-url-${index}`}>URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id={`sns-url-${index}`}
                        type="url"
                        value={link.url}
                        onChange={(e) => handleSnsLinkChange(index, 'url', e.target.value)}
                        placeholder="https://"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleSnsLinkRemove(index)}
                        className="shrink-0"
                      >
                        삭제
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>원두 정보</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCoffeeAdd}
                >
                  + 원두 추가
                </Button>
              </div>
              {formData.coffees.map((coffee, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>원두 #{index + 1}</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleCoffeeRemove(index)}
                      >
                        삭제
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`coffee-name-${index}`}>원두명</Label>
                        <Input
                          id={`coffee-name-${index}`}
                          value={coffee.name}
                          onChange={(e) => handleCoffeeChange(index, 'name', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`coffee-price-${index}`}>가격</Label>
                        <Input
                          id={`coffee-price-${index}`}
                          type="number"
                          value={coffee.price}
                          onChange={(e) => handleCoffeeChange(index, 'price', Number(e.target.value))}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>로스팅 레벨</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {ROAST_LEVELS.map(level => (
                          <div key={level} className="flex items-center space-x-2">
                            <Checkbox
                              id={`roast-${index}-${level}`}
                              checked={coffee.roastLevel.includes(level)}
                              onCheckedChange={(checked) => {
                                const newLevels = checked
                                  ? [...coffee.roastLevel, level]
                                  : coffee.roastLevel.filter(l => l !== level);
                                handleCoffeeChange(index, 'roastLevel', newLevels);
                              }}
                            />
                            <Label htmlFor={`roast-${index}-${level}`}>{level}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>원산지</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {ORIGINS.map(origin => (
                          <div key={origin} className="flex items-center space-x-2">
                            <Checkbox
                              id={`origin-${index}-${origin}`}
                              checked={coffee.origins.includes(origin)}
                              onCheckedChange={(checked) => {
                                const newOrigins = checked
                                  ? [...coffee.origins, origin]
                                  : coffee.origins.filter(o => o !== origin);
                                handleCoffeeChange(index, 'origins', newOrigins);
                              }}
                            />
                            <Label htmlFor={`origin-${index}-${origin}`}>{origin}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>가공방식</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {PROCESSES.map(process => (
                          <div key={process} className="flex items-center space-x-2">
                            <Checkbox
                              id={`process-${index}-${process}`}
                              checked={coffee.processes.includes(process)}
                              onCheckedChange={(checked) => {
                                const newProcesses = checked
                                  ? [...coffee.processes, process]
                                  : coffee.processes.filter(p => p !== process);
                                handleCoffeeChange(index, 'processes', newProcesses);
                              }}
                            />
                            <Label htmlFor={`process-${index}-${process}`}>{process}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>추출방식</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {BREW_METHODS.map(method => (
                          <div key={method} className="flex items-center space-x-2">
                            <Checkbox
                              id={`brew-${index}-${method}`}
                              checked={coffee.brewMethods.includes(method)}
                              onCheckedChange={(checked) => {
                                const newMethods = checked
                                  ? [...coffee.brewMethods, method]
                                  : coffee.brewMethods.filter(m => m !== method);
                                handleCoffeeChange(index, 'brewMethods', newMethods);
                              }}
                            />
                            <Label htmlFor={`brew-${index}-${method}`}>{method}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Label>컵 노트</Label>
                      {Object.entries(CUP_NOTES).map(([category, { title, notes }]) => (
                        <div key={category} className="space-y-2">
                          <Label>{title}</Label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {notes.map(note => (
                              <div key={note} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`note-${index}-${category}-${note}`}
                                  checked={coffee.notes.includes(note)}
                                  onCheckedChange={(checked) => {
                                    const newNotes = checked
                                      ? [...coffee.notes, note]
                                      : coffee.notes.filter(n => n !== note);
                                    handleCoffeeChange(index, 'notes', newNotes);
                                  }}
                                />
                                <Label htmlFor={`note-${index}-${category}-${note}`}>{note}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <Label>노트 색상</Label>
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
                              handleCoffeeChange(index, 'noteColors', newColors);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`coffee-description-${index}`}>설명</Label>
                      <Textarea
                        id={`coffee-description-${index}`}
                        value={coffee.description || ''}
                        onChange={(e) => handleCoffeeChange(index, 'description', e.target.value as string | null)}
                        rows={3}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">이미지 URL</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                type="url"
                placeholder="https://"
              />
            </div>

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
        </CardContent>
      </Card>
    </div>
  );
} 