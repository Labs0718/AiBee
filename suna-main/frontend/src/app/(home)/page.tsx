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
            <div className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
              <div className="max-w-7xl mx-auto">
                <StreamingDemo />
              </div>
            </div>
            <FooterSection />
          </div>
        </main>
      </BackgroundAALChecker>
    </>
  );
}
