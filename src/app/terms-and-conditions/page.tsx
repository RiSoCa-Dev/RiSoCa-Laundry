import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { PromoBanner } from '@/components/promo-banner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shirt, Hand, AlertTriangle, Lock, Shield, Phone } from 'lucide-react';

export default function TermsAndConditionsPage() {
  return (
    <div className="flex flex-col h-screen">
      <AppHeader />
      <PromoBanner />
      <main className="flex-1 overflow-y-auto overflow-x-hidden scrollable pb-20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="w-full">
            <CardHeader className="text-center border-b pb-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shirt className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-3xl md:text-4xl font-bold text-primary">
                  RKR LAUNDRY
                </CardTitle>
              </div>
              <div className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg">
                <h1 className="text-2xl md:text-3xl font-bold">TERMS AND CONDITIONS</h1>
              </div>
            </CardHeader>
            <CardContent className="space-y-8 py-8">
              
              {/* Section 1: Customer Responsibilities */}
              <section className="space-y-3">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shirt className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-primary">1. CUSTOMER RESPONSIBILITIES</h2>
                </div>
                <ul className="space-y-2 text-muted-foreground ml-14">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Make a full inventory of all clothing items before handing them over.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Empty all pockets. Personal belongings (e.g., money, jewelry, IDs, accessories) must be removed before drop-off. RKR Laundry is not liable for loss of any personal items left inside pockets.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Ensure all garments are free from hazardous materials (e.g., sharp objects, lighters, flammable items).</span>
                  </li>
                </ul>
              </section>

              {/* Section 2: Garment Care Policy */}
              <section className="space-y-3">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Hand className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-primary">2. GARMENT CARE POLICY</h2>
                </div>
                <ul className="space-y-2 text-muted-foreground ml-14">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Provide accurate instructions for delicate fabrics or items requiring special care. Additional charges may apply.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Efforts will be made to remove stains, but complete stain removal is not guaranteed, as some stains may be permanent.</span>
                  </li>
                </ul>
              </section>

              {/* Section 3: Damage and Loss Policy */}
              <section className="space-y-3">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-primary">3. DAMAGE AND LOSS POLICY</h2>
                </div>
                <div className="space-y-3 text-muted-foreground ml-14">
                  <p className="font-semibold text-foreground">RKR Laundry handles items with care but is not responsible for:</p>
                  <ul className="space-y-1 ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Color fading/discoloration</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Color bleeding</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Shrinkage</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Damage to buttons, zippers, or accessories</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Tears or small holes caused by washing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Damage to weak fabrics or pre-existing defects</span>
                    </li>
                  </ul>
                  <p className="flex items-start gap-2 mt-3">
                    <span className="text-primary mt-1">•</span>
                    <span>Missing items must be reported within 24 hours after pickup or delivery. Failure to report releases RKR Laundry from any liability.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Items made of leather, suede, or rubber are not accepted.</span>
                  </p>
                </div>
              </section>

              {/* Section 4: Privacy Policy */}
              <section className="space-y-3">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-primary">4. PRIVACY POLICY</h2>
                </div>
                <div className="space-y-2 text-muted-foreground ml-14">
                  <p className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>RKR Laundry collects and uses personal information solely for service transactions.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Your information will not be shared with third parties without your consent.</span>
                  </p>
                  <p className="mt-4 text-sm">
                    <strong className="text-foreground">Note:</strong> For detailed information about how we collect, use, and protect your data, please see our{' '}
                    <a href="/privacy-policy" className="text-primary hover:underline font-semibold">Privacy Policy</a>.
                  </p>
                </div>
              </section>

              {/* Section 5: Health and Safety Policy */}
              <section className="space-y-3">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-primary">5. HEALTH AND SAFETY POLICY</h2>
                </div>
                <ul className="space-y-2 text-muted-foreground ml-14">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Items heavily soiled or contaminated with bodily fluids (from humans or pets) may be charged at a higher rate or refused for cleaning.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Items with foul odor, infestation, or hazardous contamination may also be declined.</span>
                  </li>
                </ul>
              </section>

              {/* Section 6: Pricing and Payment Policy */}
              <section className="space-y-3">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-primary">6. PRICING AND PAYMENT POLICY</h2>
                </div>
                <ul className="space-y-2 text-muted-foreground ml-14">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Prices are based on weight or item type.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Accepted payment methods include cash and mobile payments.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Rates are subject to change without prior notice.</span>
                  </li>
                </ul>
              </section>

              {/* Footer Note */}
              <div className="mt-8 pt-6 border-t">
                <p className="text-sm text-muted-foreground text-center">
                  Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  By using RKR Laundry services, you agree to these Terms and Conditions. If you have any questions, please{' '}
                  <a href="/contact-us" className="text-primary hover:underline font-semibold">contact us</a>.
                </p>
              </div>

            </CardContent>
          </Card>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
