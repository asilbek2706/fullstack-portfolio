interface BrandLogoProps {
  size?: number;
  className?: string;
}

export function BrandLogo({ size = 36, className = '' }: BrandLogoProps) {
  return (
    <svg
      className={`brand-logo ${className}`}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label="Portfolio administration"
    >
      <rect x="2" y="2" width="44" height="44" rx="4" fill="#79aec8" />

      <path
        d="M19 14L10 24L19 34"
        fill="none"
        stroke="#102a36"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M29 14L38 24L29 34"
        fill="none"
        stroke="#102a36"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M28 11L20 37"
        fill="none"
        stroke="#f5dd5d"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
