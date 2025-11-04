/**
 * Footer Page - Complete Footer Page Export
 * صفحة Footer كاملة - ليس مكونات منفصلة
 * @module FooterPage
 */

// Main Footer Page Component Only
export { Footer as default } from './Footer';
export { Footer } from './Footer';

// Re-export common UI components needed by other pages
export { LoadingSpinner } from '@/components/UI/LoadingSpinner';
export { EmptyState } from '@/components/UI/EmptyState';  
export { Button } from '@/components/UI/Button';
export { Card } from '@/components/UI/Card';
export { default as PageHeader } from '@/components/UI/PageHeader';
export { Input } from '@/components/UI/Input';
export { Alert } from '@/components/UI/Alert';
export { Modal } from '@/components/UI/Modal';
export { ToggleSwitch } from '@/components/UI/ToggleSwitch';
export { Tooltip } from '@/components/UI/Tooltip';
export { Badge } from '@/components/UI/Badge';
export { Logo } from '@/components/UI/Logo';
export { FeatureList } from '@/components/UI/FeatureList';

// Footer Props Type (للاستخدام الخارجي فقط)
export type { FooterProps } from './Types/types';
