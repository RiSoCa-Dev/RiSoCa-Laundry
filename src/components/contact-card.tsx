'use client';

import React from 'react';
import { Phone } from 'lucide-react';

interface ContactCardProps {
  phoneNumbers: string[];
}

export function ContactCard({ phoneNumbers }: ContactCardProps) {
  return (
    <div className="relative w-[200px] h-[250px] rounded-[14px] z-[1111] overflow-hidden flex flex-col items-center justify-center shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff]">
      <div className="absolute top-[5px] left-[5px] w-[190px] h-[240px] z-[2] bg-white/95 backdrop-blur-[24px] rounded-[10px] overflow-hidden outline outline-2 outline-white flex flex-col items-center justify-center p-4">
        <Phone className="h-8 w-8 text-primary mb-4" />
        <h3 className="text-lg font-semibold text-primary mb-3">Contact Us</h3>
        <div className="flex flex-col gap-2 w-full">
          {phoneNumbers.map((phone, index) => (
            <a
              key={index}
              href={`tel:${phone}`}
              className="text-sm text-primary hover:text-primary/80 hover:underline text-center transition-colors"
            >
              {phone}
            </a>
          ))}
        </div>
      </div>
      <div className="absolute z-[1] top-1/2 left-1/2 w-[150px] h-[150px] rounded-full bg-primary opacity-20 blur-[12px] animate-blob-bounce" />
      <style jsx>{`
        @keyframes blob-bounce {
          0% {
            transform: translate(-100%, -100%) translate3d(0, 0, 0);
          }
          25% {
            transform: translate(-100%, -100%) translate3d(100%, 0, 0);
          }
          50% {
            transform: translate(-100%, -100%) translate3d(100%, 100%, 0);
          }
          75% {
            transform: translate(-100%, -100%) translate3d(0, 100%, 0);
          }
          100% {
            transform: translate(-100%, -100%) translate3d(0, 0, 0);
          }
        }
        .animate-blob-bounce {
          animation: blob-bounce 5s infinite ease;
        }
      `}</style>
    </div>
  );
}

