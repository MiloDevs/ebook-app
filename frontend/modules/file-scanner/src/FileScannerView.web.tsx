import * as React from 'react';

import { FileScannerViewProps } from './FileScanner.types';

export default function FileScannerView(props: FileScannerViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
