'use client';

import { useState, useEffect } from 'react';
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
const PROCESSES = ['워시드', '내추럴', '허니', '웻훌', '무산소 발효', '이스트 발효', '락토 발효', '다크룸 발효', '카보닉 메서레이션', '디카페인', '직접입력'];
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
  '#FFFDD0', '#FFFF00', '#FFD700', '#FDB813', '#DAA520'  // 연한 노란색부터 진한 노란색까지
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

interface EditCafeClientProps {
  cafe: CafeInfo;
}

export default function EditCafeClient({ cafe }: EditCafeClientProps) {
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

  useEffect(() => {
    // 브라우저에서만 실행되는 코드
    const checkAuth = () => {
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as { [key: string]: string });

      console.log('현재 쿠키 상태:', cookies);
      console.log('authToken 존재 여부:', !!cookies['authToken']);

      // localStorage에서도 토큰 확인
      const localToken = localStorage.getItem('authToken');
      console.log('localStorage token 존재 여부:', !!localToken);
    };

    checkAuth();
  }, []);

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
      console.log('[폼 제출 시작] 폼 데이터:', formData);

      // 유효성 검사
      const cafeError = validateCafeData(formData);
      if (cafeError) {
        console.log('[유효성 검사 실패] 카페 정보:', cafeError);
        toast.error(cafeError);
        setIsLoading(false);
        return;
      }

      // 각 원두 데이터 유효성 검사
      for (const coffee of formData.coffees) {
        const coffeeError = validateCoffeeData(coffee);
        if (coffeeError) {
          console.log('[유효성 검사 실패] 원두 정보:', coffeeError);
          toast.error(coffeeError);
          setIsLoading(false);
          return;
        }
      }

      // 인증 토큰 가져오기
      const authToken = localStorage.getItem('authToken');
      console.log('[인증 토큰] 존재 여부:', !!authToken);

      if (!authToken) {
        console.log('[인증 오류] 토큰 없음');
        toast.error('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
        router.push('/auth/login');
        setIsLoading(false);
        return;
      }

      // 로딩 상태 표시
      const loadingToast = toast.loading('카페 정보를 업데이트하고 있습니다...', {
        duration: Infinity,
      });

      console.log('[API 요청 시작] PUT /api/manager/cafes/' + cafe.id);
      const response = await fetch(`/api/manager/cafes/${cafe.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(formData),
      });

      console.log('[API 응답] 상태 코드:', response.status);
      const data = await response.json();
      console.log('[API 응답] 데이터:', data);

      // 로딩 토스트 제거
      toast.dismiss(loadingToast);

      if (!response.ok) {
        let errorMessage = '카페 정보 업데이트에 실패했습니다.';
        
        // HTTP 상태 코드별 사용자 친화적인 메시지
        switch (response.status) {
          case 401:
            errorMessage = '로그인이 필요하거나 로그인이 만료되었습니다. 다시 로그인해주세요.';
            console.log('[인증 오류] 401 Unauthorized');
            router.push('/auth/login');
            break;
          case 403:
            errorMessage = '카페 정보를 수정할 권한이 없습니다.';
            console.log('[권한 오류] 403 Forbidden');
            break;
          case 404:
            errorMessage = '카페를 찾을 수 없습니다.';
            console.log('[조회 오류] 404 Not Found');
            break;
          case 400:
            errorMessage = data.error || '입력하신 정보를 다시 확인해주세요.';
            console.log('[입력 오류] 400 Bad Request:', data.error);
            break;
          case 500:
            errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
            console.log('[서버 오류] 500 Internal Server Error');
            break;
        }

        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      console.log('[성공] 카페 정보 업데이트 완료');
      toast.success('카페 정보가 성공적으로 업데이트되었습니다.');
      router.push('/manager/dashboard');
    } catch (error) {
      console.error('[오류 발생]', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto p-4">
      {/* 기본 정보 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">카페명 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">전화번호</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">주소 *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* 영업시간 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle>영업시간</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
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
            <Label htmlFor="businessHourNote">영업시간 특이사항</Label>
            <Input
              id="businessHourNote"
              value={formData.businessHourNote}
              onChange={(e) => setFormData({ ...formData, businessHourNote: e.target.value })}
              placeholder="예: 설날연휴 정상영업"
            />
          </div>
        </CardContent>
      </Card>

      {/* SNS 링크 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle>SNS 링크</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>

      {/* 원두 정보 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle>원두 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <div key={coffeeIndex} className="space-y-4">
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
                  <Label htmlFor={`coffee-${coffeeIndex}-name`}>원두명 *</Label>
                  <Input
                    id={`coffee-${coffeeIndex}-name`}
                    value={coffee.name}
                    onChange={(e) => handleCoffeeChange(coffeeIndex, 'name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`coffee-${coffeeIndex}-price`}>가격 *</Label>
                  <Input
                    id={`coffee-${coffeeIndex}-price`}
                    type="number"
                    value={coffee.price}
                    onChange={(e) => handleCoffeeChange(coffeeIndex, 'price', Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              {/* 로스팅 레벨 */}
              <div>
                <Label htmlFor={`coffee-${coffeeIndex}-roastLevel`}>로스팅 레벨</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {ROAST_LEVELS.map(level => (
                    <div key={level} className="flex items-center space-x-2">
                      <Checkbox
                        id={`coffee-${coffeeIndex}-${level}`}
                        checked={coffee.roastLevel.includes(level)}
                        onCheckedChange={(checked) => {
                          const newLevels = checked
                            ? [...coffee.roastLevel, level]
                            : coffee.roastLevel.filter(l => l !== level);
                          handleCoffeeChange(coffeeIndex, 'roastLevel', newLevels);
                        }}
                      />
                      <label
                        htmlFor={`coffee-${coffeeIndex}-${level}`}
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
                <Label htmlFor={`coffee-${coffeeIndex}-origins`}>원산지</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {ORIGINS.map(origin => (
                    <div key={origin} className="flex items-center space-x-2">
                      <Checkbox
                        id={`coffee-${coffeeIndex}-${origin}`}
                        checked={coffee.origins.includes(origin)}
                        onCheckedChange={(checked) => {
                          const newOrigins = checked
                            ? [...coffee.origins, origin]
                            : coffee.origins.filter(o => o !== origin);
                          handleCoffeeChange(coffeeIndex, 'origins', newOrigins);
                        }}
                      />
                      <label
                        htmlFor={`coffee-${coffeeIndex}-${origin}`}
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
                <Label htmlFor={`coffee-${coffeeIndex}-processes`}>가공방식</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {PROCESSES.map(process => (
                    <div key={process} className="flex items-center space-x-2">
                      <Checkbox
                        id={`coffee-${coffeeIndex}-${process}`}
                        checked={coffee.processes.includes(process)}
                        onCheckedChange={(checked) => {
                          const newProcesses = checked
                            ? [...coffee.processes, process]
                            : coffee.processes.filter(p => p !== process);
                          handleCoffeeChange(coffeeIndex, 'processes', newProcesses);
                        }}
                      />
                      <label
                        htmlFor={`coffee-${coffeeIndex}-${process}`}
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
                <Label htmlFor={`coffee-${coffeeIndex}-brewMethods`}>추출방식</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {BREW_METHODS.map(method => (
                    <div key={method} className="flex items-center space-x-2">
                      <Checkbox
                        id={`coffee-${coffeeIndex}-${method}`}
                        checked={coffee.brewMethods.includes(method)}
                        onCheckedChange={(checked) => {
                          const newMethods = checked
                            ? [...coffee.brewMethods, method]
                            : coffee.brewMethods.filter(m => m !== method);
                          handleCoffeeChange(coffeeIndex, 'brewMethods', newMethods);
                        }}
                      />
                      <label
                        htmlFor={`coffee-${coffeeIndex}-${method}`}
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
                              id={`coffee-${coffeeIndex}-${category}-${note}`}
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
                              htmlFor={`coffee-${coffeeIndex}-${category}-${note}`}
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
                <Label htmlFor={`coffee-${coffeeIndex}-noteColors`} className="block text-sm font-medium text-gray-700 mb-2">노트 색상</Label>
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
                <Label htmlFor={`coffee-${coffeeIndex}-description`}>설명</Label>
                <Textarea
                  id={`coffee-${coffeeIndex}-description`}
                  value={coffee.description || ''}
                  onChange={(e) => handleCoffeeChange(coffeeIndex, 'description', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 이미지 URL */}
      <Card>
        <CardHeader>
          <CardTitle>이미지 URL</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="imageUrl">이미지 URL</Label>
          <Input
            id="imageUrl"
            type="url"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            placeholder="https://"
          />
        </CardContent>
      </Card>

      {/* 제출 버튼 */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/manager/dashboard')}
          disabled={isLoading}
        >
          취소
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              저장 중...
            </>
          ) : (
            '저장'
          )}
        </Button>
      </div>
    </form>
  );
} 