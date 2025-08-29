'use client';

import Image from 'next/image';

interface AbilityLogoProps {
  size?: number;
}
export function AbilityLogo({ size = 24 }: AbilityLogoProps) {
  return (
    <Image
        src="/logo2.png"
        alt="Ability Systems"
        width={size}
        height={size}
        className="flex-shrink-0"
        style={{ 
          width: size,
          height: size,
          minWidth: size,
          minHeight: size,
          objectFit: 'contain'
        }}
      />
  );
}

// Keep KortixLogo for backward compatibility
export const KortixLogo = AbilityLogo;
