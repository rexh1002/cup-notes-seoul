'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';

export default function ManagerSignupPage() {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [confirmPassword, setConfirmPassword] = useState('');
 const [cafeName, setCafeName] = useState('');
 const [cafeAddress, setCafeAddress] = useState('');
 const [cafePhone, setCafePhone] = useState('');
 const [error, setError] = useState('');
 const [isLoading, setIsLoading] = useState(false);
 const router = useRouter();

 const handleSignup = async (e: React.FormEvent) => {
   e.preventDefault();
   setError('');
   setIsLoading(true);

   if (password !== confirmPassword) {
     setError('비밀번호가 일치하지 않습니다.');
     setIsLoading(false);
     return;
   }

   if (password.length < 8) {
     setError('비밀번호는 8자 이상이어야 합니다.');
     setIsLoading(false);
     return;
   }

   try {
     const res = await fetch('/api/auth/manager/signup', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         email,
         password,
         cafeName,
         cafeAddress,
         cafePhone,
       }),
     });

     const data = await res.json();

     if (!res.ok) {
       throw new Error(data.error || '회원가입에 실패했습니다.');
     }

     alert('회원가입이 완료되었습니다. 로그인 후 내카페 정보를 수정해 보세요.');
     router.push('/auth/login');
   } catch (err) {
     setError(err instanceof Error ? err.message : '회원가입 중 오류가 발생했습니다.');
   } finally {
     setIsLoading(false);
   }
 };

 return (
   <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
     <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
       <div>
         <h1 className="text-2xl font-bold text-center">카페 매니저 회원가입</h1>
         <p className="mt-2 text-center text-sm text-gray-600">
           카페 운영자 전용 회원가입입니다
         </p>
       </div>

       {error && (
         <div className="mb-4 p-3 bg-red-100 text-red-600 rounded text-sm">
           {error}
         </div>
       )}

       <form onSubmit={handleSignup} className="space-y-6">
         <div>
           <label htmlFor="email" className="block text-sm font-medium text-gray-700">
             이메일
           </label>
           <Input
             id="email"
             type="email"
             value={email}
             onChange={(e) => setEmail(e.target.value)}
             required
             autoComplete="email"
             disabled={isLoading}
           />
         </div>

         <div>
           <label htmlFor="password" className="block text-sm font-medium text-gray-700">
             비밀번호
           </label>
           <Input
             id="password"
             type="password"
             value={password}
             onChange={(e) => setPassword(e.target.value)}
             required
             autoComplete="new-password"
             disabled={isLoading}
             minLength={8}
           />
           <p className="text-xs text-gray-500 mt-1">8자 이상 입력해주세요</p>
         </div>

         <div>
           <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
             비밀번호 확인
           </label>
           <Input
             id="confirmPassword"
             type="password"
             value={confirmPassword}
             onChange={(e) => setConfirmPassword(e.target.value)}
             required
             autoComplete="new-password"
             disabled={isLoading}
           />
         </div>

         <div>
           <label htmlFor="cafeName" className="block text-sm font-medium text-gray-700">
             카페명
           </label>
           <Input
             id="cafeName"
             type="text"
             value={cafeName}
             onChange={(e) => setCafeName(e.target.value)}
             required
             disabled={isLoading}
           />
         </div>

         <div>
           <label htmlFor="cafeAddress" className="block text-sm font-medium text-gray-700">
             카페 주소
           </label>
           <Input
             id="cafeAddress"
             type="text"
             value={cafeAddress}
             onChange={(e) => setCafeAddress(e.target.value)}
             required
             disabled={isLoading}
           />
         </div>

         <div>
           <label htmlFor="cafePhone" className="block text-sm font-medium text-gray-700">
             카페 전화번호
           </label>
           <Input
             id="cafePhone"
             type="tel"
             value={cafePhone}
             onChange={(e) => setCafePhone(e.target.value)}
             required
             placeholder="'-' 포함하여 입력"
             disabled={isLoading}
           />
         </div>

         <Button type="submit" className="w-full" disabled={isLoading}>
           {isLoading ? '처리 중...' : '회원가입'}
         </Button>
       </form>
     </div>
   </div>
 );
}