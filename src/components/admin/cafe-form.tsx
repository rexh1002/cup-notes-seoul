'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';

export default function CafeForm() {
  const [cafeData, setCafeData] = useState({
    name: '',
    address: '',
    rating: 0,
    openUntil: '',
    cupNotes: [] as string[],
    origins: [] as string[],
    processes: [] as string[],
    roastLevel: '',
    imageUrl: ''
  });

  const [newNote, setNewNote] = useState('');
  const [newOrigin, setNewOrigin] = useState('');
  const [newProcess, setNewProcess] = useState('');

  const addItem = (
    item: string, 
    list: string[], 
    setter: (items: string[]) => void,
    resetInput: () => void
  ) => {
    if (item.trim() && !list.includes(item)) {
      setter([...list, item.trim()]);
      resetInput();
    }
  };

  const removeItem = (item: string, list: string[], setter: (items: string[]) => void) => {
    setter(list.filter(i => i !== item));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/cafes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cafeData),
      });
      
      if (response.ok) {
        alert('카페 정보가 저장되었습니다.');
        // 폼 리셋
        setCafeData({
          name: '',
          address: '',
          rating: 0,
          openUntil: '',
          cupNotes: [],
          origins: [],
          processes: [],
          roastLevel: '',
          imageUrl: ''
        });
      } else {
        alert('저장 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name">카페명</Label>
        <Input
          id="name"
          value={cafeData.name}
          onChange={(e) => setCafeData(prev => ({
            ...prev,
            name: e.target.value
          }))}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="address">주소</Label>
        <Input
          id="address"
          value={cafeData.address}
          onChange={(e) => setCafeData(prev => ({
            ...prev,
            address: e.target.value
          }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="rating">평점</Label>
        <Input
          id="rating"
          type="number"
          min="0"
          max="5"
          step="0.1"
          value={cafeData.rating}
          onChange={(e) => setCafeData(prev => ({
            ...prev,
            rating: Number(e.target.value)
          }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="openUntil">영업 시간</Label>
        <Input
          id="openUntil"
          value={cafeData.openUntil}
          onChange={(e) => setCafeData(prev => ({
            ...prev,
            openUntil: e.target.value
          }))}
          placeholder="예: 오후 10:00"
          required
        />
      </div>

      {/* 컵 노트 입력 */}
      <div>
        <Label>컵 노트</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="새로운 컵 노트 입력"
          />
          <Button 
            type="button"
            onClick={() => addItem(
              newNote, 
              cafeData.cupNotes, 
              (notes) => setCafeData(prev => ({ ...prev, cupNotes: notes })),
              () => setNewNote('')
            )}
          >
            추가
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {cafeData.cupNotes.map(note => (
            <Badge 
              key={note}
              variant="secondary"
              className="cursor-pointer hover:bg-primary/80"
              onClick={() => removeItem(
                note, 
                cafeData.cupNotes,
                (notes) => setCafeData(prev => ({ ...prev, cupNotes: notes }))
              )}
            >
              {note} ×
            </Badge>
          ))}
        </div>
      </div>

      {/* 원산지 입력 */}
      <div>
        <Label>원산지</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={newOrigin}
            onChange={(e) => setNewOrigin(e.target.value)}
            placeholder="원산지 입력"
          />
          <Button 
            type="button"
            onClick={() => addItem(
              newOrigin,
              cafeData.origins,
              (origins) => setCafeData(prev => ({ ...prev, origins })),
              () => setNewOrigin('')
            )}
          >
            추가
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {cafeData.origins.map(origin => (
            <Badge 
              key={origin}
              variant="secondary"
              className="cursor-pointer hover:bg-primary/80"
              onClick={() => removeItem(
                origin,
                cafeData.origins,
                (origins) => setCafeData(prev => ({ ...prev, origins }))
              )}
            >
              {origin} ×
            </Badge>
          ))}
        </div>
      </div>

      {/* 프로세스 입력 */}
      <div>
        <Label>프로세스</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={newProcess}
            onChange={(e) => setNewProcess(e.target.value)}
            placeholder="프로세스 입력"
          />
          <Button 
            type="button"
            onClick={() => addItem(
              newProcess,
              cafeData.processes,
              (processes) => setCafeData(prev => ({ ...prev, processes })),
              () => setNewProcess('')
            )}
          >
            추가
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {cafeData.processes.map(process => (
            <Badge 
              key={process}
              variant="secondary"
              className="cursor-pointer hover:bg-primary/80"
              onClick={() => removeItem(
                process,
                cafeData.processes,
                (processes) => setCafeData(prev => ({ ...prev, processes }))
              )}
            >
              {process} ×
            </Badge>
          ))}
        </div>
      </div>

      {/* 로스팅 레벨 */}
      <div>
        <Label>로스팅 레벨</Label>
        <div className="flex gap-2">
          {['light', 'medium', 'dark'].map(level => (
            <Button
              key={level}
              type="button"
              variant={cafeData.roastLevel === level ? "default" : "outline"}
              onClick={() => setCafeData(prev => ({ ...prev, roastLevel: level }))}
              className="flex-1"
            >
              {level === 'light' ? '약배전' : level === 'medium' ? '중배전' : '강배전'}
            </Button>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full">
        카페 정보 저장
      </Button>
    </form>
  );
}