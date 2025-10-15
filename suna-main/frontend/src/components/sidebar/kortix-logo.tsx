'use client';

import Image from 'next/image';

interface AbilityLogoProps {
  size?: number;
}
export function AbilityLogo({ size = 24 }: AbilityLogoProps) {
  return (
    <Image
        src="/new-logo.png"
        alt="Ability Systems"
        width={size}
        height={size}
        className="flex-shrink-0 opacity-70"
        style={{
          width: size,
          height: size,
          minWidth: size,
          minHeight: size,
          objectFit: 'contain',
          filter: 'brightness(0) saturate(100%) invert(48%) sepia(8%) saturate(394%) hue-rotate(182deg) brightness(93%) contrast(89%)'
        }}
      />
  );
}

// Keep KortixLogo for backward compatibility
export const KortixLogo = AbilityLogo;
