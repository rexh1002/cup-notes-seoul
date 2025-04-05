'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '../../../../../../components/ui/input';
import { Textarea } from '../../../../../../components/ui/textarea';
import { Checkbox } from '../../../../../../components/ui/checkbox';
import { Button } from '../../../../../../components/ui/button';
import { toast } from 'react-hot-toast';

// 임시 Button 컴포넌트 직접 정의
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

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
  id?: string;
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
  description: string;
}

interface CafeInput {
  id: string;
  name: string;
  address: string;
  phone: string;
  description: string;
  businessHours: BusinessHour[];
  businessHourNote: string;
  snsLinks: SnsLink[];
  coffees: CoffeeInput[];
}

// 유효성 검사 함수들
const validateCafeData = (data: CafeInput): string | null => {
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

interface EditCafePageProps {
  params: {
    id: string;
  };
}

export default function EditCafePage({ params }: EditCafePageProps) {
  const router = useRouter();
  const { id } = params;
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CafeInput>({
    id: id,
    name: '',
    address: '',
    phone: '',
    description: '',
    businessHours: [],
    businessHourNote: '',
    snsLinks: [],
    coffees: []
  });

  useEffect(() => {
    const fetchCafeData = async () => {
      try {
        setIsLoading(true);
        
        const token = localStorage.getItem('authToken');
        if (!token) {
          router.push('/auth/login');
          return;
        }
        
        const response = await fetch(`/api/manager/cafes/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('카페 정보를 불러오는데 실패했습니다.');
        }
        
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error || '카페 정보를 불러오는데 실패했습니다.');
        }

        setFormData({
          id: data.cafe.id,
          name: data.cafe.name || '',
          address: data.cafe.address || '',
          phone: data.cafe.phone || '',
          description: data.cafe.description || '',
          businessHours: data.cafe.businessHours || [],
          businessHourNote: data.cafe.businessHourNote || '',
          snsLinks: data.cafe.snsLinks || [],
          coffees: data.cafe.coffees || []
        });
      } catch (err) {
        console.error('카페 데이터 로딩 오류:', err);
        toast.error(err instanceof Error ? err.message : '카페 정보를 불러오는데 실패했습니다.');
        router.push('/manager/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCafeData();
  }, [id, router]);

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

  const handleCoffeeAdd = () => {
    const newCoffee: CoffeeInput = {
      name: '',
      price: 0,
      roastLevel: [],
      origins: [],
      processes: [],
      notes: [],
      noteColors: [],
      brewMethods: [],
      customFields: {
        origins: [],
        processes: [],
        brewMethods: [],
        roastLevels: [],
        notes: {
          floral: [],
          fruity: [],
          nutty: []
        }
      },
      description: ''
    };

    setFormData(prev => ({
      ...prev,
      coffees: [...prev.coffees, newCoffee]
    }));
  };

  const handleColorSelect = (coffeeIndex: number, color: string) => {
    const updatedCoffees = [...formData.coffees];
    updatedCoffees[coffeeIndex].noteColors = [color];
    setFormData({ ...formData, coffees: updatedCoffees });
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

    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      // PUT 요청으로 카페 정보 업데이트
      const response = await fetch(`/api/manager/cafes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || '수정 실패');
      }

      toast.success('카페 정보가 성공적으로 수정되었습니다.');
      router.push('/manager/dashboard');
    } catch (error) {
      console.error('수정 실패:', error);
      toast.error(error instanceof Error ? error.message : '카페 정보 수정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto p-6 space-y-6 font-sans">
      <h1 className="text-2xl font-bold mb-6">카페 정보 수정</h1>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">카페명 *</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">전화번호</label>
          <Input
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">주소 *</label>
          <Input
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">설명</label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                checked={(formData.businessHours || []).some(hour => hour.day === day)}
                onCheckedChange={(checked: boolean) => {
                  if (checked) {
                    handleBusinessHourAdd(day);
                  } else {
                    handleBusinessHourRemove(day);
                  }
                }}
                id={`day-${day}`}
              />
              <label htmlFor={`day-${day}`} className="w-20">{day}</label>
              {(formData.businessHours || []).find(hour => hour.day === day) && (
                <>
                  <Input
                    type="time"
                    className="w-32"
                    value={(formData.businessHours || []).find(hour => hour.day === day)?.openTime}
                    onChange={(e) => {
                      const updatedHours = (formData.businessHours || []).map(hour =>
                        hour.day === day ? { ...hour, openTime: e.target.value } : hour
                      );
                      setFormData({ ...formData, businessHours: updatedHours });
                    }}
                  />
                  <span>-</span>
                  <Input
                    type="time"
                    className="w-32"
                    value={(formData.businessHours || []).find(hour => hour.day === day)?.closeTime}
                    onChange={(e) => {
                      const updatedHours = (formData.businessHours || []).map(hour =>
                        hour.day === day ? { ...hour, closeTime: e.target.value } : hour
                      );
                      setFormData({ ...formData, businessHours: updatedHours });
                    }}
                  />
                </>
              )}
            </div>
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">영업시간 특이사항</label>
          <Input
            value={formData.businessHourNote}
            onChange={(e) => setFormData({ ...formData, businessHourNote: e.target.value })}
            placeholder="예: 설날연휴 정상영업"
          />
        </div>
      </div>

      {/* SNS 링크 섹션 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">SNS 링크</h2>
        {(formData.snsLinks || []).map((link, index) => (
          <div key={index} className="grid grid-cols-3 gap-4">
            <select
              className="border rounded-md p-2"
              value={link.type}
              onChange={(e) => {
                const updatedLinks = [...(formData.snsLinks || [])];
                updatedLinks[index].type = e.target.value;
                setFormData({ ...formData, snsLinks: updatedLinks });
              }}
            >
              <option value="">선택하세요</option>
              {SNS_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <Input
              value={link.url}
              onChange={(e) => {
                const updatedLinks = [...(formData.snsLinks || [])];
                updatedLinks[index].url = e.target.value;
                setFormData({ ...formData, snsLinks: updatedLinks });
              }}
              placeholder="URL을 입력하세요"
            />
            <Button type="button" variant="outline" onClick={() => handleSnsLinkRemove(index)}>
              삭제
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={handleSnsLinkAdd}>
          SNS 링크 추가
        </Button>
      </div>

      {/* 원두 정보 섹션 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">원두 정보</h2>
        {formData.coffees.map((coffee, coffeeIndex) => (
          <div key={coffeeIndex} className="p-4 border rounded-lg space-y-4">
            {/* 기본 정보 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">원두명 *</label>
                <Input
                  value={coffee.name}
                  onChange={(e) => {
                    const updatedCoffees = [...formData.coffees];
                    updatedCoffees[coffeeIndex].name = e.target.value;
                    setFormData({ ...formData, coffees: updatedCoffees });
                  }}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">가격 *</label>
                <Input
                  type="number"
                  value={coffee.price || ''}
                  onChange={(e) => {
                    const updatedCoffees = [...formData.coffees];
                    updatedCoffees[coffeeIndex].price = Number(e.target.value) || 0;
                    setFormData({ ...formData, coffees: updatedCoffees });
                  }}
                  required
                />
              </div>
            </div>

            {/* 로스팅 레벨 */}
            <div>
              <label className="block text-sm font-medium text-gray-700">로스팅 레벨</label>
              <div className="space-y-2">
                {ROAST_LEVELS.map(level => (
                  <div key={level} className="flex items-center">
                    <Checkbox
                      checked={coffee.roastLevel?.includes(level) || false}
                      onCheckedChange={(checked) => {
                        const updatedCoffees = [...formData.coffees];
                        if (checked) {
                          if (!updatedCoffees[coffeeIndex].roastLevel) {
                            updatedCoffees[coffeeIndex].roastLevel = [];
                          }
                          updatedCoffees[coffeeIndex].roastLevel.push(level);
                        } else {
                          updatedCoffees[coffeeIndex].roastLevel = 
                            (updatedCoffees[coffeeIndex].roastLevel || []).filter(l => l !== level);
                        }
                        setFormData({ ...formData, coffees: updatedCoffees });
                      }}
                    />
                    <span className={`ml-2 ${level === '직접입력' ? CUSTOM_INPUT_STYLE : ''}`}>
                      {level}
                    </span>
                  </div>
                ))}
                {coffee.roastLevel?.includes('직접입력') && (
                  <Input
                    placeholder="직접 입력"
                    value={coffee.customFields?.roastLevels?.join(', ') || ''}
                    onChange={(e) => {
                      const updatedCoffees = [...formData.coffees];
                      if (!updatedCoffees[coffeeIndex].customFields) {
                        updatedCoffees[coffeeIndex].customFields = {
                          origins: [],
                          processes: [],
                          brewMethods: [],
                          roastLevels: [],
                          notes: { floral: [], fruity: [], nutty: [] }
                        };
                      }
                      updatedCoffees[coffeeIndex].customFields.roastLevels = 
                        e.target.value.split(',').map(item => item.trim());
                      setFormData({ ...formData, coffees: updatedCoffees });
                    }}
                  />
                )}
              </div>
            </div>

            {/* 원산지 */}
            <div>
              <label className="block text-sm font-medium text-gray-700">원산지</label>
              <div className="space-y-2">
                {ORIGINS.map(origin => (
                  <div key={origin} className="flex items-center">
                    <Checkbox
                      checked={coffee.origins?.includes(origin) || false}
                      onCheckedChange={(checked) => {
                        const updatedCoffees = [...formData.coffees];
                        if (checked) {
                          if (!updatedCoffees[coffeeIndex].origins) {
                            updatedCoffees[coffeeIndex].origins = [];
                          }
                          updatedCoffees[coffeeIndex].origins.push(origin);
                        } else {
                          updatedCoffees[coffeeIndex].origins = 
                            (updatedCoffees[coffeeIndex].origins || []).filter(o => o !== origin);
                        }
                        setFormData({ ...formData, coffees: updatedCoffees });
                      }}
                    />
                    <span className={`ml-2 ${origin === '직접입력' ? CUSTOM_INPUT_STYLE : ''}`}>
                      {origin}
                    </span>
                  </div>
                ))}
                {coffee.origins?.includes('직접입력') && (
                  <Input
                    placeholder="직접 입력"
                    value={coffee.customFields?.origins?.join(', ') || ''}
                    onChange={(e) => {
                      const updatedCoffees = [...formData.coffees];
                      if (!updatedCoffees[coffeeIndex].customFields) {
                        updatedCoffees[coffeeIndex].customFields = {
                          origins: [],
                          processes: [],
                          brewMethods: [],
                          roastLevels: [],
                          notes: { floral: [], fruity: [], nutty: [] }
                        };
                      }
                      updatedCoffees[coffeeIndex].customFields.origins = 
                        e.target.value.split(',').map(item => item.trim());
                      setFormData({ ...formData, coffees: updatedCoffees });
                    }}
                  />
                )}
              </div>
            </div>

            {/* 프로세스 */}
            <div>
              <label className="block text-sm font-medium text-gray-700">프로세스</label>
              <div className="space-y-2">
                {PROCESSES.map(process => (
                  <div key={process} className="flex items-center">
                    <Checkbox
                      checked={coffee.processes?.includes(process) || false}
                      onCheckedChange={(checked) => {
                        const updatedCoffees = [...formData.coffees];
                        if (checked) {
                          if (!updatedCoffees[coffeeIndex].processes) {
                            updatedCoffees[coffeeIndex].processes = [];
                          }
                          updatedCoffees[coffeeIndex].processes.push(process);
                        } else {
                          updatedCoffees[coffeeIndex].processes = 
                            (updatedCoffees[coffeeIndex].processes || []).filter(p => p !== process);
                        }
                        setFormData({ ...formData, coffees: updatedCoffees });
                      }}
                    />
                    <span className={`ml-2 ${process === '직접입력' ? CUSTOM_INPUT_STYLE : ''}`}>
                      {process}
                    </span>
                  </div>
                ))}
                {coffee.processes?.includes('직접입력') && (
                  <Input
                    placeholder="직접 입력"
                    value={coffee.customFields?.processes?.join(', ') || ''}
                    onChange={(e) => {
                      const updatedCoffees = [...formData.coffees];
                      if (!updatedCoffees[coffeeIndex].customFields) {
                        updatedCoffees[coffeeIndex].customFields = {
                          origins: [],
                          processes: [],
                          brewMethods: [],
                          roastLevels: [],
                          notes: { floral: [], fruity: [], nutty: [] }
                        };
                      }
                      updatedCoffees[coffeeIndex].customFields.processes = 
                        e.target.value.split(',').map(item => item.trim());
                      setFormData({ ...formData, coffees: updatedCoffees });
                    }}
                  />
                )}
              </div>
            </div>

            {/* 추출 방식 */}
            <div>
              <label className="block text-sm font-medium text-gray-700">추출 방식</label>
              <div className="space-y-2">
                {BREW_METHODS.map(method => (
                  <div key={method} className="flex items-center">
                    <Checkbox
                      checked={coffee.brewMethods?.includes(method) || false}
                      onCheckedChange={(checked) => {
                        const updatedCoffees = [...formData.coffees];
                        if (checked) {
                          if (!updatedCoffees[coffeeIndex].brewMethods) {
                            updatedCoffees[coffeeIndex].brewMethods = [];
                          }
                          updatedCoffees[coffeeIndex].brewMethods.push(method);
                        } else {
                          updatedCoffees[coffeeIndex].brewMethods = 
                            (updatedCoffees[coffeeIndex].brewMethods || []).filter(m => m !== method);
                        }
                        setFormData({ ...formData, coffees: updatedCoffees });
                      }}
                    />
                    <span className={`ml-2 ${method === '직접입력' ? CUSTOM_INPUT_STYLE : ''}`}>
                      {method}
                    </span>
                  </div>
                ))}
                {coffee.brewMethods?.includes('직접입력') && (
                  <Input
                    placeholder="직접 입력"
                    value={coffee.customFields?.brewMethods?.join(', ') || ''}
                    onChange={(e) => {
                      const updatedCoffees = [...formData.coffees];
                      if (!updatedCoffees[coffeeIndex].customFields) {
                        updatedCoffees[coffeeIndex].customFields = {
                          origins: [],
                          processes: [],
                          brewMethods: [],
                          roastLevels: [],
                          notes: { floral: [], fruity: [], nutty: [] }
                        };
                      }
                      updatedCoffees[coffeeIndex].customFields.brewMethods = 
                        e.target.value.split(',').map(item => item.trim());
                      setFormData({ ...formData, coffees: updatedCoffees });
                    }}
                  />
                )}
              </div>
            </div>

            {/* 컵 노트 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">컵 노트</h3>
              <div className="grid grid-cols-3 gap-6">
                {Object.entries(CUP_NOTES).map(([category, { title, notes }]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="font-medium text-gray-700">{title}</h4>
                    <div className="space-y-1">
                      {notes.map(note => (
                        <div key={note} className="flex items-center">
                          <Checkbox
                            checked={note === '직접입력' 
                              ? coffee.notes?.includes(`${category}-직접입력`) || false
                              : coffee.notes?.includes(note) || false}
                            onCheckedChange={(checked) => {
                              const updatedCoffees = [...formData.coffees];
                              const noteValue = note === '직접입력' ? `${category}-직접입력` : note;
                              
                              if (!updatedCoffees[coffeeIndex].notes) {
                                updatedCoffees[coffeeIndex].notes = [];
                              }
                              
                              if (checked) {
                                if (!updatedCoffees[coffeeIndex].notes.includes(noteValue)) {
                                  updatedCoffees[coffeeIndex].notes.push(noteValue);
                                }
                              } else {
                                updatedCoffees[coffeeIndex].notes = 
                                  updatedCoffees[coffeeIndex].notes.filter(n => n !== noteValue);
                              }
                              setFormData({ ...formData, coffees: updatedCoffees });
                            }}
                          />
                          <span className={`ml-2 ${note === '직접입력' ? CUSTOM_INPUT_STYLE : ''}`}>
                            {note}
                          </span>
                        </div>
                      ))}
                      {coffee.notes?.includes(`${category}-직접입력`) && (
                        <Input
                          placeholder="직접 입력"
                          value={coffee.customFields?.notes?.[category]?.join(', ') || ''}
                          onChange={(e) => {
                            const updatedCoffees = [...formData.coffees];
                            if (!updatedCoffees[coffeeIndex].customFields) {
                              updatedCoffees[coffeeIndex].customFields = {
                                origins: [],
                                processes: [],
                                brewMethods: [],
                                roastLevels: [],
                                notes: { floral: [], fruity: [], nutty: [] }
                              };
                            }
                            
                            if (!updatedCoffees[coffeeIndex].customFields.notes) {
                              updatedCoffees[coffeeIndex].customFields.notes = { 
                                floral: [], fruity: [], nutty: [] 
                              };
                            }
                            
                            updatedCoffees[coffeeIndex].customFields.notes[category] = 
                              e.target.value.split(',').map(item => item.trim());
                            setFormData({ ...formData, coffees: updatedCoffees });
                          }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 컵 노트 색상 선택 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">컵 노트 색상 (1개 선택)</h3>
              <div className="grid grid-cols-10 gap-2">
                {NOTE_COLORS.map((color, colorIndex) => (
                  <button
                    key={colorIndex}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${
                      (coffee.noteColors || [])[0] === color ? 'border-black' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorSelect(coffeeIndex, color)}
                  />
                ))}
              </div>
            </div>

            {/* 설명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700">설명</label>
              <Textarea
                value={coffee.description || ''}
                onChange={(e) => {
                  const updatedCoffees = [...formData.coffees];
                  updatedCoffees[coffeeIndex].description = e.target.value;
                  setFormData({ ...formData, coffees: updatedCoffees });
                }}
              />
            </div>

            {/* 원두 삭제 버튼 */}
            <div>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  const updatedCoffees = formData.coffees.filter((_, index) => index !== coffeeIndex);
                  setFormData({ ...formData, coffees: updatedCoffees });
                }}
              >
                원두 삭제
              </Button>
            </div>
          </div>
        ))}
        
        {/* 원두 추가 버튼 */}
        <Button type="button" variant="outline" onClick={handleCoffeeAdd}>
          원두 추가
        </Button>
      </div>

      {/* 제출 버튼 */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          취소
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '수정 중...' : '수정'}
        </Button>
      </div>
    </form>
  );
}
