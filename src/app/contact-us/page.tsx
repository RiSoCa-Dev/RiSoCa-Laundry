'use client';

import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { PromoBanner } from '@/components/promo-banner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { ContactCard } from '@/components/contact-card';

const phoneNumbers = [
  '09157079908',
  '09459787490',
  '09154354549',
  '09288112476',
];

export default function ContactUsPage() {
  return (
    <div className="flex flex-col h-screen">
      <AppHeader />
      <PromoBanner />
      <main className="flex-1 overflow-y-auto overflow-x-hidden scrollable pb-20">
        <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-start min-h-full gap-8">
          <div className="flex flex-col items-center">
            <h1 className="text-2xl md:text-4xl font-bold text-primary mb-2">Contact Us</h1>
            <p className="text-sm md:text-base text-muted-foreground text-center">
              Get in touch with us. We're here to help!
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-4xl">
            <ContactCard phoneNumbers={phoneNumbers} />
            
            <Card className="w-full max-w-lg">
              <CardHeader className="p-4">
                <CardTitle className="text-xl">Send us a Message</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <form className="space-y-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Your Name" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="Your Email" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" placeholder="Your message..." className="min-h-[60px]" />
                  </div>
                  <Button type="submit" className="w-full bg-accent text-accent-foreground">
                    <Send className="mr-2 h-4 w-4"/> Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
