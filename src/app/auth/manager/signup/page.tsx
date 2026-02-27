import { redirect } from 'next/navigation';

export default function ManagerSignupPage() {
  redirect('/auth?type=manager');
}

