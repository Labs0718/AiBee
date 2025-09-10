'use client';

import React from 'react';
import { KortixLogo } from '@/components/sidebar/kortix-logo';

interface SimpleChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

interface SimpleChatHistoryProps {
  messages: SimpleChatMessage[];
  isLoading?: boolean;
}

export function SimpleChatHistory({ messages, isLoading }: SimpleChatHistoryProps) {
  if (messages.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className="w-full max-w-[650px] space-y-4 mb-6">
      {messages.map((message, index) => (
        <div key={index} className="space-y-2">
          {message.role === 'user' ? (
            // User message
            <div className="flex justify-end">
              <div className="max-w-[80%] bg-blue-500 text-white px-4 py-3 rounded-lg shadow-sm">
                <div className="text-sm font-medium whitespace-pre-wrap break-words">
                  {message.content}
                </div>
              </div>
            </div>
          ) : (
            // Assistant message
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <KortixLogo size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-lg shadow-sm">
                  <div className="text-sm prose prose-sm dark:prose-invert max-w-none break-words whitespace-pre-wrap">
                    {message.content}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
      {isLoading && (
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            <KortixLogo size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                응답을 생성하고 있습니다...
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}