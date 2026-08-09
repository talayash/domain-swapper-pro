import type { EnvironmentRole } from '~/types';
import { ENVIRONMENT_ROLES } from '~/types';

interface EnvironmentBadgeProps {
  role: EnvironmentRole;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

const COLOR_CLASSES: Record<string, { bg: string; text: string; dot: string }> = {
  green:  { bg: 'bg-green-100 dark:bg-green-950', text: 'text-green-700 dark:text-green-300', dot: 'bg-green-500' },
  yellow: { bg: 'bg-yellow-100 dark:bg-yellow-950', text: 'text-yellow-700 dark:text-yellow-300', dot: 'bg-yellow-500' },
  blue:   { bg: 'bg-blue-100 dark:bg-blue-950', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
  red:    { bg: 'bg-red-100 dark:bg-red-950', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-500' },
  gray:   { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', dot: 'bg-gray-500' },
  purple: { bg: 'bg-purple-100 dark:bg-purple-950', text: 'text-purple-700 dark:text-purple-300', dot: 'bg-purple-500' },
};

export function EnvironmentBadge({ role, size = 'sm', showLabel = true }: EnvironmentBadgeProps) {
  const config = ENVIRONMENT_ROLES[role];
  const colors = COLOR_CLASSES[config.color] || COLOR_CLASSES.gray;

  const sizeClasses = size === 'sm'
    ? 'px-1.5 py-0.5 text-[10px]'
    : 'px-2 py-0.5 text-xs';

  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${colors.bg} ${colors.text} ${sizeClasses}`}>
      <span className={`${dotSize} rounded-full ${colors.dot} shrink-0`} />
      {showLabel && <span>{config.shortLabel}</span>}
    </span>
  );
}

export function EnvironmentDot({ role }: { role: EnvironmentRole }) {
  const config = ENVIRONMENT_ROLES[role];
  const colors = COLOR_CLASSES[config.color] || COLOR_CLASSES.gray;

  return (
    <span
      className={`w-2 h-2 rounded-full ${colors.dot} shrink-0`}
      title={config.label}
    />
  );
}
