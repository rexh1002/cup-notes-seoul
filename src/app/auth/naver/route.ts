const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID!;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET!;
const REDIRECT_URI = 'https://cupnotescity.com/api/auth/naver/callback';
const BASE_URL = 'https://cupnotescity.com';

export async function GET(request: Request) {
  const state = crypto.randomBytes(10).toString('hex');
  
  const authUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=${state}`;

  // ... rest of the code ...
} 