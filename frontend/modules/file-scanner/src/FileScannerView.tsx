import { requireNativeView } from 'expo';
import * as React from 'react';

import { FileScannerViewProps } from './FileScanner.types';

const NativeView: React.ComponentType<FileScannerViewProps> =
  requireNativeView('FileScanner');

export default function FileScannerView(props: FileScannerViewProps) {
  return <NativeView {...props} />;
}
