import { BulbOutlined, DesktopOutlined, MoonOutlined } from '@ant-design/icons';
import { Segmented } from 'antd';
import type { ThemeMode } from '../../theme/theme.types';
import { useTheme } from '../../theme/useTheme';

const options = [
  {
    value: 'light',
    label: (
      <span className="theme-option" title="Light rejim">
        <BulbOutlined />
        <span className="theme-option-label">Light</span>
      </span>
    ),
  },
  {
    value: 'dark',
    label: (
      <span className="theme-option" title="Dark rejim">
        <MoonOutlined />
        <span className="theme-option-label">Dark</span>
      </span>
    ),
  },
  {
    value: 'system',
    label: (
      <span className="theme-option" title="System rejimi">
        <DesktopOutlined />
        <span className="theme-option-label">System</span>
      </span>
    ),
  },
];

export function ThemeSwitcher() {
  const { mode, setMode } = useTheme();

  return (
    <Segmented
      className="theme-switcher"
      value={mode}
      options={options}
      onChange={(value) => setMode(value as ThemeMode)}
    />
  );
}
