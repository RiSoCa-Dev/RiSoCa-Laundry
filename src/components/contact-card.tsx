'use client';

import React, { useState } from 'react';
import { Phone, Send } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ContactCardProps {
  phoneNumbers: string[];
}

export function ContactCard({ phoneNumbers }: ContactCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <div className="relative w-[200px] h-[280px] rounded-[14px] z-[1111] overflow-hidden flex flex-col items-center justify-center shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff]">
        <div className="absolute top-[5px] left-[5px] w-[190px] h-[270px] z-[2] bg-white/95 backdrop-blur-[24px] rounded-[10px] overflow-hidden outline outline-2 outline-white flex flex-col items-center justify-center p-4">
          <Phone className="h-8 w-8 text-primary mb-3" />
          <h3 className="text-lg font-semibold text-primary mb-3">Contact Us</h3>
          <div className="flex flex-col gap-2 w-full mb-4">
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
          <button
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            <Send className="h-4 w-4" />
            Send us a Message
          </button>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send us a Message</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4 mt-4"
            onSubmit={(e) => {
              e.preventDefault();
              // Handle form submission here
              setIsDialogOpen(false);
            }}
          >
            <div className="grid gap-1.5">
              <Label htmlFor="dialog-name">Name</Label>
              <Input id="dialog-name" placeholder="Your Name" required />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="dialog-email">Email</Label>
              <Input id="dialog-email" type="email" placeholder="Your Email" required />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="dialog-message">Message</Label>
              <Textarea id="dialog-message" placeholder="Your message..." className="min-h-[100px]" required />
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 text-white hover:from-amber-500 hover:to-yellow-600">
              <Send className="mr-2 h-4 w-4" />
              Send Message
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
