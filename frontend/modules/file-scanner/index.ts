// Reexport the native module. On web, it will be resolved to FileScannerModule.web.ts
// and on native platforms to FileScannerModule.ts
export { default } from './src/FileScannerModule';
export { default as FileScannerView } from './src/FileScannerView';
export * from  './src/FileScanner.types';
