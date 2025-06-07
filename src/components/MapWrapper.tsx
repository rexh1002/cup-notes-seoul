import dynamic from 'next/dynamic';
import React, { forwardRef } from 'react';

// Dynamically import Map with SSR disabled
const DynamicMap = dynamic(() => import('./Map'), { ssr: false });

// Wrapper to forward refs
const MapWrapper = forwardRef<any, React.ComponentProps<typeof DynamicMap>>((props, ref) => {
  return <DynamicMap {...props} ref={ref} />;
});

MapWrapper.displayName = 'MapWrapper';

export default MapWrapper; 