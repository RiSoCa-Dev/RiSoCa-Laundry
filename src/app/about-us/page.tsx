'use client';

import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { PromoBanner } from '@/components/promo-banner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  WashingMachine, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  Clock, 
  Target, 
  Heart,
  Sparkles,
  Award,
  CheckCircle2,
  ArrowRight,
  Building2
} from 'lucide-react';
import Link from 'next/link';

export default function AboutUsPage() {
  return (
    <div className="flex flex-col h-screen">
      <AppHeader />
      <PromoBanner />
      <main className="flex-1 overflow-y-auto overflow-x-hidden scrollable pb-20">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          
          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                <WashingMachine className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-primary">
                About RKR Laundry
              </h1>
            </div>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Fast. Clean. Convenient.
            </p>
            <p className="text-sm md:text-base text-muted-foreground mt-4 max-w-2xl mx-auto">
              Your trusted laundry service partner in Enrile, Cagayan, providing reliable wash, dry, and fold services with convenient pickup and delivery options.
            </p>
          </div>

          {/* Our Story Section */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-2xl md:text-3xl">Our Story</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p className="leading-relaxed">
                RKR Laundry was founded on <strong className="text-foreground">December 5, 2025</strong> by three passionate entrepreneurs: 
                <strong className="text-foreground"> Racky Carag</strong>, <strong className="text-foreground">Kriszelle Anne Carag</strong>, 
                and <strong className="text-foreground">Richard Carag</strong>. The name "RKR" stands for <strong className="text-foreground">Richard Karaya Racky</strong>, 
                representing the founders' commitment to quality service and family values.
              </p>
              <p className="leading-relaxed">
                With the generous support and guidance of <strong className="text-foreground">Mr. Raymundo Carag</strong> and 
                <strong className="text-foreground"> Mrs. Elizabeth Carag</strong> as our architects, designers, and sponsors, 
                we built a modern laundry service that combines cutting-edge technology with traditional care and attention to detail.
              </p>
              <p className="leading-relaxed">
                From our main branch located at <strong className="text-foreground">228 Divisoria Enrile Cagayan</strong>, 
                we serve our community with reliable, efficient, and affordable laundry solutions that make everyday life easier.
              </p>
            </CardContent>
          </Card>

          {/* Mission & Vision Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl md:text-2xl">Our Mission</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p className="leading-relaxed">
                  To provide fast, clean, and convenient laundry services that save our customers time while delivering exceptional quality results. 
                  We use modern equipment and proven processes to ensure every item is handled with the utmost care and attention.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl md:text-2xl">Our Vision</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p className="leading-relaxed">
                  To become the most trusted and preferred laundry service provider in Enrile and beyond, 
                  known for our reliability, quality, and unwavering commitment to customer satisfaction.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* What We Offer Section */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <WashingMachine className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-2xl md:text-3xl">What We Offer</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Our Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">Wash, Dry, and Fold</p>
                      <p className="text-sm text-muted-foreground">₱180 per 7.5kg load</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">Package 1</p>
                      <p className="text-sm text-muted-foreground">Wash, Dry, and Fold (Drop-off)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">Package 2</p>
                      <p className="text-sm text-muted-foreground">One-Way Transport (Pickup or Delivery)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">Package 3</p>
                      <p className="text-sm text-muted-foreground">All-In Service (Pickup & Delivery)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Operating Hours</p>
                    <p className="text-sm text-muted-foreground">Monday to Sunday, 7:30 AM to 7:30 PM</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold text-foreground mb-3">Key Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Real-time order tracking
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Online ordering system
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Convenient pickup and delivery
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Transparent pricing
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Our Values Section */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-2xl md:text-3xl">What Sets Us Apart</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border bg-card">
                  <h3 className="font-semibold text-foreground mb-2">Quality</h3>
                  <p className="text-sm text-muted-foreground">
                    We handle every item with care using modern equipment and proven techniques.
                  </p>
                </div>
                <div className="p-4 rounded-lg border bg-card">
                  <h3 className="font-semibold text-foreground mb-2">Convenience</h3>
                  <p className="text-sm text-muted-foreground">
                    Order online, track in real-time, and enjoy pickup and delivery services.
                  </p>
                </div>
                <div className="p-4 rounded-lg border bg-card">
                  <h3 className="font-semibold text-foreground mb-2">Reliability</h3>
                  <p className="text-sm text-muted-foreground">
                    Consistent service quality and clear communication at every step.
                  </p>
                </div>
                <div className="p-4 rounded-lg border bg-card">
                  <h3 className="font-semibold text-foreground mb-2">Transparency</h3>
                  <p className="text-sm text-muted-foreground">
                    Clear pricing with no hidden fees and real-time status updates.
                  </p>
                </div>
                <div className="p-4 rounded-lg border bg-card">
                  <h3 className="font-semibold text-foreground mb-2">Customer Focus</h3>
                  <p className="text-sm text-muted-foreground">
                    Responsive customer support and commitment to your satisfaction.
                  </p>
                </div>
                <div className="p-4 rounded-lg border bg-card">
                  <h3 className="font-semibold text-foreground mb-2">Community</h3>
                  <p className="text-sm text-muted-foreground">
                    Locally owned and operated, serving our community with pride.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Our Team Section */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-2xl md:text-3xl">Meet the Founders</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Owners</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border bg-card text-center">
                    <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="font-semibold text-foreground">Racky Carag</p>
                  </div>
                  <div className="p-4 rounded-lg border bg-card text-center">
                    <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="font-semibold text-foreground">Kriszelle Anne Carag</p>
                  </div>
                  <div className="p-4 rounded-lg border bg-card text-center">
                    <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="font-semibold text-foreground">Richard Carag</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold text-foreground mb-3">Special Thanks</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We extend our heartfelt gratitude to <strong className="text-foreground">Mr. Raymundo Carag</strong> and 
                  <strong className="text-foreground"> Mrs. Elizabeth Carag</strong> for their invaluable architectural and design contributions, 
                  and for their unwavering support as sponsors in making RKR Laundry a reality. Their vision and guidance have been instrumental 
                  in shaping our business.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Visit Us Section */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-2xl md:text-3xl">Find Us</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">Main Branch</p>
                  <p className="text-muted-foreground">228 Divisoria Enrile Cagayan</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground mb-1">Contact Numbers</p>
                  <div className="flex flex-col gap-1 text-muted-foreground">
                    <a href="tel:09157079908" className="hover:text-primary">09157079908</a>
                    <a href="tel:09459787490" className="hover:text-primary">09459787490</a>
                    <a href="tel:09154354549" className="hover:text-primary">09154354549</a>
                    <a href="tel:09288112476" className="hover:text-primary">09288112476</a>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">Email</p>
                  <a href="mailto:support@rkrlaundry.com" className="text-muted-foreground hover:text-primary">
                    support@rkrlaundry.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Facebook className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">Social Media</p>
                  <a 
                    href="https://facebook.com/rkrlaundry" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Facebook: RKR Laundry
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">Operating Hours</p>
                  <p className="text-muted-foreground">Monday to Sunday, 7:30 AM to 7:30 PM</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action Section */}
          <Card className="mb-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  Experience RKR Laundry Today
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Ready to experience fast, clean, and convenient laundry service? 
                  Place your order online or visit us at our branch. We're here to make laundry simple.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Link href="/create-order">
                    <Button size="lg" className="w-full sm:w-auto">
                      Create Order
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/contact-us">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      Contact Us
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer Note */}
          <div className="text-center text-sm text-muted-foreground pt-4 border-t">
            <p>
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

        </div>
      </main>
      <AppFooter />
    </div>
  );
}

