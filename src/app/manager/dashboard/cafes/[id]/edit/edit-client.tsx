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

interface BusinessHour {
  day: string;
  openTime: string;
  closeTime: string;
}

interface SnsLink {
  type: string;
  url: string;
}

export function EditCafeClient({ cafe }: { cafe: CafeInfo }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: cafe.name,
    address: cafe.address,
    phone: cafe.phone,
    description: cafe.description || '',
    businessHours: cafe.businessHours || [],
    businessHourNote: cafe.businessHourNote || '',
    snsLinks: cafe.snsLinks || [],
    imageUrl: cafe.imageUrl || '',
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