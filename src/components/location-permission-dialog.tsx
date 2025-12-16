'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { MapPin, Shield, AlertCircle } from 'lucide-react'

interface LocationPermissionDialogProps {
  open: boolean
  onAllow: () => void
  onDeny: () => void
  onClose: () => void
}

export function LocationPermissionDialog({
  open,
  onAllow,
  onDeny,
  onClose,
}: LocationPermissionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle>Allow Location Access</DialogTitle>
          </div>
          <DialogDescription className="text-left space-y-3 pt-2">
            <p>
              We need your location to calculate accurate delivery distance and pricing for your order.
            </p>
            <div className="flex items-start gap-2 text-sm">
              <Shield className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-muted-foreground">
                Your location is only used to calculate distance. We don't store or track your location.
              </p>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-muted-foreground">
                You can also manually select your location on the map if you prefer.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onDeny}
            className="w-full sm:w-auto"
          >
            Use Map Instead
          </Button>
          <Button
            onClick={onAllow}
            className="w-full sm:w-auto"
          >
            Allow Location Access
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

