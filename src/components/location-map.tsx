'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { GoogleMap, MarkerF } from '@react-google-maps/api'
import { LocationPermissionDialog } from './location-permission-dialog'

const SHOP_POSITION = { lat: 17.522928, lng: 121.775073 }

interface LocationMapProps {
  onSelectLocation?: (lat: number, lng: number) => void
}

export function LocationMap({ onSelectLocation }: LocationMapProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [markerPosition, setMarkerPosition] =
    useState(SHOP_POSITION)
  const [mapCenter, setMapCenter] =
    useState(SHOP_POSITION)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const [showPermissionDialog, setShowPermissionDialog] = useState(false)
  const [locationPermission, setLocationPermission] = useState<'prompt' | 'granted' | 'denied' | 'checking'>('prompt')
  const [locationError, setLocationError] = useState<string | null>(null)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const hasRequestedLocationRef = useRef<boolean>(false)

  const updateURL = useCallback(
    (pos: google.maps.LatLng, isUserInteraction: boolean = true) => {
      // Mark that user has interacted if this is a user action
      if (isUserInteraction) {
        setHasUserInteracted(true)
      }

      const shopLatLng = new google.maps.LatLng(
        SHOP_POSITION.lat,
        SHOP_POSITION.lng
      )

      const distanceInKm =
        google.maps.geometry.spherical.computeDistanceBetween(
          shopLatLng,
          pos
        ) / 1000

      // Clear previous debounce timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }

      // Debounce URL updates to prevent excessive router calls
      debounceTimeoutRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('distance', distanceInKm.toFixed(2))
        router.replace(`/select-location?${params.toString()}`)
      }, 300)

      // Update marker position immediately for better UX
      setMarkerPosition({ lat: pos.lat(), lng: pos.lng() })
      
      // Call onSelectLocation immediately
      onSelectLocation?.(pos.lat(), pos.lng())
    },
    [router, searchParams, onSelectLocation]
  )

  // Request location permission on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationPermission('denied')
      setLocationError('Geolocation is not supported by your browser.')
      return
    }

    // Check if permission was already requested
    if (hasRequestedLocationRef.current) return

    // Show permission dialog first
    setShowPermissionDialog(true)
  }, [])

  // Handle location permission request
  const handleAllowLocation = useCallback(() => {
    if (!navigator.geolocation) return

    setLocationPermission('checking')
    setShowPermissionDialog(false)
    hasRequestedLocationRef.current = true

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setMapCenter(userPos)
        setMarkerPosition(userPos)
        setLocationPermission('granted')
        setLocationError(null)

        // Wait for Google Maps API to be ready, then calculate distance
        const checkAndUpdate = () => {
          if (typeof window !== 'undefined' && window.google && window.google.maps) {
            const userLatLng = new google.maps.LatLng(userPos.lat, userPos.lng)
            // Auto-update URL with distance calculation
            updateURL(userLatLng, false) // false = auto-calculated, not user interaction
          } else {
            // Retry after a short delay if API not ready
            setTimeout(checkAndUpdate, 100)
          }
        }
        checkAndUpdate()
      },
      (error) => {
        setLocationPermission('denied')
        hasRequestedLocationRef.current = false // Allow retry
        
        let errorMessage = 'Unable to get your location.'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission was denied. You can manually select your location on the map.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable. Please select your location on the map.'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please select your location on the map.'
            break
        }
        setLocationError(errorMessage)
        setMapCenter(SHOP_POSITION)
      },
      options
    )
  }, [updateURL])

  const handleDenyLocation = useCallback(() => {
    setShowPermissionDialog(false)
    setLocationPermission('denied')
    hasRequestedLocationRef.current = true
    setLocationError('You can manually select your location on the map.')
  }, [])

  // Auto-calculate distance when marker position changes and permission is granted
  useEffect(() => {
    if (
      locationPermission === 'granted' &&
      markerPosition !== SHOP_POSITION &&
      !hasUserInteracted // Only auto-calculate on initial load, not after user interactions
    ) {
      // Wait for Google Maps API to be ready
      const checkAndUpdate = () => {
        if (typeof window !== 'undefined' && window.google && window.google.maps) {
          const userLatLng = new google.maps.LatLng(markerPosition.lat, markerPosition.lng)
          // Ensure distance is calculated
          updateURL(userLatLng, false)
        } else {
          // Retry after a short delay if API not ready
          setTimeout(checkAndUpdate, 100)
        }
      }
      checkAndUpdate()
    }
  }, [locationPermission, markerPosition, hasUserInteracted, updateURL])

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  const mapOptions = useMemo<google.maps.MapOptions>(
    () => ({
      disableDefaultUI: true,
      scrollwheel: true,
    }),
    []
  )

  return (
    <>
      <LocationPermissionDialog
        open={showPermissionDialog}
        onAllow={handleAllowLocation}
        onDeny={handleDenyLocation}
        onClose={handleDenyLocation}
      />
      
      <GoogleMap
        zoom={14}
        center={mapCenter}
        options={mapOptions}
        mapContainerStyle={{ width: '100%', height: '100%' }}
        onClick={(e) => e.latLng && updateURL(e.latLng, true)}
      >
        <MarkerF
          position={markerPosition}
          draggable
          onDragEnd={(e) =>
            e.latLng && updateURL(e.latLng, true)
          }
        />

        <MarkerF
          position={SHOP_POSITION}
          icon={{
            url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          }}
        />
      </GoogleMap>
    </>
  )
}
