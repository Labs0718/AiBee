'use client';

import { useEffect, useState } from 'react';
import { FooterSection } from '@/components/home/sections/footer-section';
import { HeroSection } from '@/components/home/sections/hero-section';
import { ModalProviders } from '@/providers/modal-providers';
import { BackgroundAALChecker } from '@/components/auth/background-aal-checker';
import StreamingDemo from '@/components/home/streaming-demo';

export default function Home() {
  return (
    <>
      <ModalProviders />
      <BackgroundAALChecker>
        <main className="flex flex-col items-center justify-center min-h-screen w-full">
          <div className="w-full">
            <HeroSection />
            <div className="py-16 bg-gradient-to-br from-blue-50/30 via-white to-indigo-50/20">
              <StreamingDemo />
            </div>
            <FooterSection />
          </div>
        </main>
      </BackgroundAALChecker>
    </>
  );
}
