import Script from 'next/script';
import localFont from "next/font/local";
import { Noto_Sans_KR } from 'next/font/google';
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const notoSansKr = Noto_Sans_KR({ 
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-kr',
});

export const metadata = {
  title: "Cup Notes Seoul",
  description: "Find your perfect coffee taste in Seoul",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="text/javascript"
          src="https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=sn5m2djclr&submodules=geocoder"
        ></script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${notoSansKr.variable} font-noto-sans-kr antialiased`}>
        {children}
      </body>
    </html>
  );
}