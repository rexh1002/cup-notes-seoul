'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';

export default function CoffeeForm() {
 const [newOrigin, setNewOrigin] = useState('');
 const [newProcess, setNewProcess] = useState('');
 
 const [coffeeData, setCoffeeData] = useState({
   name: '',
   price: 0,
   description: '',
   cafeId: '',
   roastLevel: '',
   origins: [] as string[],
   processes: [] as string[]
 });

 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();
   try {
     const response = await fetch('/api/coffees', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify(coffeeData),
     });
     
     if (response.ok) {
       alert('원두 정보가 저장되었습니다.');
       // 폼 리셋
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
       <Label htmlFor="coffee-name">원두명</Label>
       <Input
         id="coffee-name"
         value={coffeeData.name}
         onChange={(e) => setCoffeeData(prev => ({
           ...prev,
           name: e.target.value
         }))}
         required
       />
     </div>
     
     <div>
       <Label htmlFor="price">가격</Label>
       <Input
         id="price"
         type="number"
         value={coffeeData.price}
         onChange={(e) => setCoffeeData(prev => ({
           ...prev,
           price: Number(e.target.value)
         }))}
         placeholder="원"
         required
       />
     </div>

     <div>
       <Label htmlFor="description">설명</Label>
       <Textarea
         id="description"
         value={coffeeData.description}
         onChange={(e) => setCoffeeData(prev => ({
           ...prev,
           description: e.target.value
         }))}
         placeholder="원두에 대한 설명을 입력하세요"
       />
     </div>

     <div>
       <Label>로스팅 레벨</Label>
       <div className="flex gap-2">
         {['light', 'medium', 'dark'].map(level => (
           <Button
             key={level}
             type="button"
             variant={coffeeData.roastLevel === level ? "default" : "outline"}
             onClick={() => setCoffeeData(prev => ({ ...prev, roastLevel: level }))}
             className="flex-1"
           >
             {level === 'light' ? '약배전' : level === 'medium' ? '중배전' : '강배전'}
           </Button>
         ))}
       </div>
     </div>

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
           onClick={() => {
             if (newOrigin.trim()) {
               setCoffeeData(prev => ({
                 ...prev,
                 origins: [...prev.origins, newOrigin.trim()]
               }));
               setNewOrigin('');
             }
           }}
         >
           추가
         </Button>
       </div>
       <div className="flex flex-wrap gap-2">
         {coffeeData.origins.map(origin => (
           <Badge 
             key={origin}
             variant="secondary"
             className="cursor-pointer"
             onClick={() => {
               setCoffeeData(prev => ({
                 ...prev,
                 origins: prev.origins.filter(o => o !== origin)
               }));
             }}
           >
             {origin} ×
           </Badge>
         ))}
       </div>
     </div>

     <div>
       <Label>가공방식</Label>
       <div className="flex gap-2 mb-2">
         <Input
           value={newProcess}
           onChange={(e) => setNewProcess(e.target.value)}
           placeholder="가공방식 입력"
         />
         <Button 
           type="button"
           onClick={() => {
             if (newProcess.trim()) {
               setCoffeeData(prev => ({
                 ...prev,
                 processes: [...prev.processes, newProcess.trim()]
               }));
               setNewProcess('');
             }
           }}
         >
           추가
         </Button>
       </div>
       <div className="flex flex-wrap gap-2">
         {coffeeData.processes.map(process => (
           <Badge 
             key={process}
             variant="secondary"
             className="cursor-pointer"
             onClick={() => {
               setCoffeeData(prev => ({
                 ...prev,
                 processes: prev.processes.filter(p => p !== process)
               }));
             }}
           >
             {process} ×
           </Badge>
         ))}
       </div>
     </div>

     <Button type="submit" className="w-full">
       원두 정보 저장
     </Button>
   </form>
 );
}