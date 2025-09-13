// Simple exports - no complex orchestration
export { SmartMailSimple as default } from './smartmail-simple';
export { SmartMailSimple } from './smartmail-simple';

// Legacy compatibility - redirect old complex imports to new simple component
export { SmartMailSimple as SmartMailInterface } from './smartmail-simple';
export { SmartMailSimple as SmartMailIntegration } from './smartmail-simple';