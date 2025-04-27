import Script from 'next/script';

export default function Head() {
  return (
    <>
      <title>Cup Notes Seoul</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <Script
        src="https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=sn5m2djclr&submodules=geocoder"
        strategy="beforeInteractive"
      />
    </>
  );
} 