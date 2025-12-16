'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { GoogleMap, MarkerF } from '@react-google-maps/api'

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
  const debounceTimeoutRef = useRef<NodeJS.Timeout>()

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

  // Only get user location for centering the map, but don't update URL automatically
  useEffect(() => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setMapCenter(userPos)
        setMarkerPosition(userPos)
        // Don't update URL automatically - wait for user interaction
      },
      () => {
        // On error, just center on shop position but don't update URL
        setMapCenter(SHOP_POSITION)
      }
    )
  }, []) // Remove updateURL dependency to prevent auto-updates

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
  )
}
