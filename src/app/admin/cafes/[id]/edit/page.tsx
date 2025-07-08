'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';
import { Textarea } from '../../../../../components/ui/textarea';
import { CheckboxGroup } from '../../../../../components/ui/CheckboxGroup';
import { Checkbox } from '../../../../../components/ui/checkbox';

const CUSTOM_INPUT_STYLE = "text-blue-600 font-bold";

const DAYS_OF_WEEK = ['매일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];
const SNS_TYPES = ['네이버지도', '인스타그램', '페이스북', '홈페이지', '기타'];

const ORIGINS = [
  '에티오피아', '콜롬비아', '과테말라', '코스타리카', '파나마', '인도네시아', '브라질', '케냐', '엘살바도르', '르완다', 
  '직접입력'
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
      '라즈베리', '자두', '딸기', '포도', '자몽', '오렌지', '레몬', '크랜베리', '망고', '체리', '살구', '열대과일', '레드와인', '직접입력']
  },
  nutty: {
    title: 'Nutty',
    notes: ['초콜렛', '캐러멜', '고구마', '꿀', '헤이즐넛', '브라운슈거', '엿기름', '아몬드', '피칸', '호두',
      '로스트피넛', '마카다미아', '땅콩', '바닐라', '캐슈넛', '메이플 시럽', '토피', '피스타치오', '카카오닙스', '직접입력']
  }
};

const NOTE_COLORS = [
  '#FFE4E1', '#FFC0CB', '#FFB6C1', '#FF69B4', '#FF1493', // Pink shades
  '#FFE4B5', '#FFDAB9', '#FFA07A', '#FF7F50', '#FF6347', // Orange/Peach shades
  '#98FB98', '#90EE90', '#3CB371', '#2E8B57', '#006400', // Green shades
  '#E6E6FA', '#D8BFD8', '#DDA0DD', '#DA70D6', '#8B008B', // Purple shades
  '#F0F8FF', '#87CEEB', '#87CEFA', '#4169E1', '#0000CD', // Blue shades
  '#8B4513', '#A0522D', '#CD853F', '#DEB887', '#F4A460', // Brown shades
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
  description: string;
}

interface CafeInput {
  name: string;
  address: string;
  phone: string;
  description: string;
  businessHours: BusinessHour[];
  businessHourNote: string;
  snsLinks: SnsLink[];
  coffees: CoffeeInput[];
}

export default function EditCafePage({ params }: { params: Promise<{ id: string }> }) {
  const [formData, setFormData] = useState<CafeInput>({
    name: '',
    address: '',
    phone: '',
    description: '',
    businessHours: [],
    businessHourNote: '',
    snsLinks: [],
    coffees: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchCafe = async () => {
      try {
        const resolvedParams = await params;
        const response = await fetch(`/api/admin/cafes/${resolvedParams.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
        const data = await response.json();
        
        // 기존 데이터 구조를 새로운 구조로 변환
        setFormData({
          ...data,
          businessHours: data.businessHours || [], 
          businessHourNote: data.businessHourNote || '',
          snsLinks: data.snsLinks || [],
          coffees: (data.coffees || []).map(coffee => ({
            ...coffee,
            customFields: {
              origins: coffee.customFields?.origins || [],
              processes: coffee.customFields?.processes || [],
              brewMethods: coffee.customFields?.brewMethods || [],
              roastLevels: coffee.customFields?.roastLevels || [],
              notes: {
                floral: coffee.customFields?.notes?.floral || [],
                fruity: coffee.customFields?.notes?.fruity || [],
                nutty: coffee.customFields?.notes?.nutty || [],
              },
            },
          })),
        });
      } catch (err) {
        console.error('Fetch error:', err);
        setError('카페 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchCafe();
  }, [params]);

  const handleBusinessHourAdd = (day: string) => {
    const businessHours = formData.businessHours || []; // 기본값으로 빈 배열 제공
    if (!businessHours.find(hour => hour.day === day)) {
      setFormData(prev => ({
        ...prev,
        businessHours: [...(prev.businessHours || []), {
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
    setFormData(prev => ({
      ...prev,
      coffees: [...prev.coffees, {
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
      }]
    }));
  };

  const handleColorSelect = (coffeeIndex: number, color: string) => {
    const updatedCoffees = [...formData.coffees];
    updatedCoffees[coffeeIndex].noteColors = [color]; // 단일 색상만 저장
    setFormData({ ...formData, coffees: updatedCoffees });
  };

  const validateFormData = (): boolean => {
    if (!formData.name.trim()) {
      alert('카페명을 입력해주세요.');
      return false;
    }
    if (!formData.address.trim()) {
      alert('주소를 입력해주세요.');
      return false;
    }
    for (const coffee of formData.coffees) {
      if (!coffee.name.trim()) {
        alert('원두명을 입력해주세요.');
        return false;
      }
      if (coffee.price <= 0) {
        alert('가격은 0보다 커야 합니다.');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFormData()) return;

    try {
      const resolvedParams = await params;
      const response = await fetch(`/api/admin/cafes/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Error ${response.status}: ${errorMessage}`);
      }

      alert('카페 정보가 수정되었습니다.');
      router.push('/admin/dashboard');
    } catch (error) {
      console.error('수정 실패:', error);
      alert('카페 정보 수정에 실패했습니다.');
    }
  };

  if (loading) return <div className="p-6">로딩 중...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto p-6 space-y-6 font-sans">
      <h1 className="text-2xl font-bold mb-6">카페 정보 수정</h1>

      {/* 기본 정보 */}
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
                    updatedCoffees[coffeeIndex].price = parseInt(e.target.value, 10) || 0;
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
                      checked={coffee.roastLevel.includes(level)}
                      onCheckedChange={(checked) => {
                        const updatedCoffees = [...formData.coffees];
                        if (checked) {
                          updatedCoffees[coffeeIndex].roastLevel.push(level);
                        } else {
                          updatedCoffees[coffeeIndex].roastLevel = 
                            updatedCoffees[coffeeIndex].roastLevel.filter(l => l !== level);
                        }
                        setFormData({ ...formData, coffees: updatedCoffees });
                      }}
                    />
                    <span className={`ml-2 ${level === '직접입력' ? CUSTOM_INPUT_STYLE : ''}`}>
                      {level}
                    </span>
                  </div>
                ))}
                {coffee.roastLevel.includes('직접입력') && (
                  <Input
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
            </div>

            {/* 원산지 */}
            <div>
              <label className="block text-sm font-medium text-gray-700">원산지</label>
              <div className="space-y-2">
                {ORIGINS.map(origin => (
                  <div key={origin} className="flex items-center">
                    <Checkbox
                      checked={coffee.origins.includes(origin)}
                      onCheckedChange={(checked) => {
                        const updatedCoffees = [...formData.coffees];
                        if (checked) {
                          updatedCoffees[coffeeIndex].origins.push(origin);
                        } else {
                          updatedCoffees[coffeeIndex].origins = 
                            updatedCoffees[coffeeIndex].origins.filter(o => o !== origin);
                        }
                        setFormData({ ...formData, coffees: updatedCoffees });
                      }}
                    />
                    <span className={`ml-2 ${origin === '직접입력' ? CUSTOM_INPUT_STYLE : ''}`}>
                      {origin}
                    </span>
                  </div>
                ))}
                {coffee.origins.includes('직접입력') && (
                  <Input
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
            </div>

            {/* 프로세스 */}
            <div>
              <label className="block text-sm font-medium text-gray-700">프로세스</label>
              <div className="space-y-2">
                {PROCESSES.map(process => (
                  <div key={process} className="flex items-center">
                    <Checkbox
                      checked={coffee.processes.includes(process)}
                      onCheckedChange={(checked) => {
                        const updatedCoffees = [...formData.coffees];
                        if (checked) {
                          updatedCoffees[coffeeIndex].processes.push(process);
                        } else {
                          updatedCoffees[coffeeIndex].processes = 
                            updatedCoffees[coffeeIndex].processes.filter(p => p !== process);
                        }
                        setFormData({ ...formData, coffees: updatedCoffees });
                      }}
                    />
                    <span className={`ml-2 ${process === '직접입력' ? CUSTOM_INPUT_STYLE : ''}`}>
                      {process}
                    </span>
                  </div>
                ))}
                {coffee.processes.includes('직접입력') && (
                  <Input
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
            </div>

            {/* 추출 방식 */}
            <div>
              <label className="block text-sm font-medium text-gray-700">추출 방식</label>
              <div className="space-y-2">
                {BREW_METHODS.map(method => (
                  <div key={method} className="flex items-center">
                    <Checkbox
                      checked={coffee.brewMethods.includes(method)}
                      onCheckedChange={(checked) => {
                        const updatedCoffees = [...formData.coffees];
                        if (checked) {
                          updatedCoffees[coffeeIndex].brewMethods.push(method);
                        } else {
                          updatedCoffees[coffeeIndex].brewMethods = 
                            updatedCoffees[coffeeIndex].brewMethods.filter(m => m !== method);
                        }
                        setFormData({ ...formData, coffees: updatedCoffees });
                      }}
                    />
                    <span className={`ml-2 ${method === '직접입력' ? CUSTOM_INPUT_STYLE : ''}`}>
                      {method}
                    </span>
                  </div>
                ))}
                {coffee.brewMethods.includes('직접입력') && (
                  <Input
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
                              ? coffee.notes.includes(`${category}-직접입력`)
                              : coffee.notes.includes(note)}
                            onCheckedChange={(checked) => {
                              const updatedCoffees = [...formData.coffees];
                              const noteValue = note === '직접입력' ? `${category}-직접입력` : note;
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
                value={coffee.description}
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
        <Button type="submit">저장</Button>
      </div>
    </form>
  );
}