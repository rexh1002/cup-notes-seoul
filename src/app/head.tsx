import Script from 'next/script';

export default function Head() {
  return (
    <>
      <title>Cup Notes Seoul</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <Script
        type="text/javascript"
        src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=3i3sds8j5s"
        strategy="beforeInteractive"
      />
    </>
  );
} 