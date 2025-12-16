
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LocateFixed } from 'lucide-react'

interface LocationConfirmationProps {
  coords?: { lat: number; lng: number } | null;
  saving?: boolean
  status?: string | null
  onSave?: () => void
}

export function LocationConfirmation({
  coords,
  saving = false,
  status,
  onSave,
}: LocationConfirmationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const distanceParam = searchParams.get('distance')
  const calculatedDistance = distanceParam
    ? parseFloat(distanceParam)
    : 0

  // Validate distance - must be > 0 and <= 50km
  const isValidDistance = calculatedDistance > 0 && calculatedDistance <= 50

  const handleConfirm = async () => {
    if (!isValidDistance) {
      return
    }

    if (onSave) {
      await onSave()
    }

    const params = new URLSearchParams(searchParams.toString())
    params.set('distance', calculatedDistance.toFixed(2))
    
    // Ensure servicePackage is preserved
    if (!params.has('servicePackage')) {
      // Try to get from localStorage as fallback, or default to package2
      const storedPackage = typeof window !== 'undefined' 
        ? localStorage.getItem('selectedServicePackage') 
        : null
      params.set('servicePackage', storedPackage || 'package2')
    }
    
    router.push(`/create-order?${params.toString()}`)
  }

  return (
    <Card className="h-full w-full rounded-none border-0 md:border-r shadow-none flex flex-col">
      <CardHeader className="p-4 flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <LocateFixed /> Confirm Your Location
        </CardTitle>
        <CardDescription>
          Distance is calculated from our main branch.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow flex flex-col items-center justify-center p-4 overflow-y-auto scrollable">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Calculated Distance
          </p>
          <p className="text-4xl font-bold text-primary">
            {calculatedDistance.toFixed(2)} km
          </p>

          {status && (
            <p className="mt-3 text-sm text-muted-foreground">{status}</p>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pb-20 md:pb-4 flex-shrink-0">
        <Button
          onClick={handleConfirm}
          className="w-full text-base py-6"
          disabled={saving || !isValidDistance}
        >
          {saving 
            ? 'Saving…' 
            : !isValidDistance 
              ? calculatedDistance === 0 
                ? 'Please select a location' 
                : 'Distance exceeds 50km limit'
              : 'Confirm & Save Location'}
        </Button>
        {!isValidDistance && calculatedDistance > 0 && (
          <p className="text-xs text-destructive mt-2 text-center w-full">
            Maximum delivery distance is 50km
          </p>
        )}
      </CardFooter>
    </Card>
  )
}
