/**
 * Footer Page - Complete Footer Page Export
 * صفحة Footer كاملة - ليس مكونات منفصلة
 * @module FooterPage
 */

// Main Footer Page Component Only
export { Footer as default } from './Footer';
export { Footer } from './Footer';

// Re-export common UI components needed by other pages
export { LoadingSpinner } from '../../UI/LoadingSpinner';
export { EmptyState } from '../../UI/EmptyState';  
export { Button } from '../../UI/Button';
export { Card } from '../../UI/Card';
export { default as PageHeader } from '../../UI/PageHeader';
export { Input } from '../../UI/Input';
export { Alert } from '../../UI/Alert';
export { Modal } from '../../UI/Modal';
export { ToggleSwitch } from '../../UI/ToggleSwitch';
export { Tooltip } from '../../UI/Tooltip';
export { Badge } from '../../UI/Badge';
export { Logo } from '../../UI/Logo';
export { FeatureList } from '../../UI/FeatureList';

// Footer Props Type (للاستخدام الخارجي فقط)
export type { FooterProps } from './Types/types';
