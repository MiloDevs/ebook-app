import { NativeModule, requireNativeModule } from 'expo';

import { FileScannerModuleEvents } from './FileScanner.types';

declare class FileScannerModule extends NativeModule<FileScannerModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<FileScannerModule>('FileScanner');
