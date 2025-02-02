import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

interface SearchParams {
  location: {
    lat: number
    lng: number
  }
  radius?: number // in meters
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  try {
    // Handle CORS
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    // Verify request method
    if (req.method !== 'POST') {
      throw new Error('Method not allowed')
    }

    // Get search parameters from request body
    const { location, radius = 5000 }: SearchParams = await req.json()

    // Convert radius from meters to degrees (approximate)
    const radiusDegrees = radius / 111000 // 1 degree is approximately 111km

    // Construct Overpass API query
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="nursing_home"](around:${radius},${location.lat},${location.lng});
        way["amenity"="nursing_home"](around:${radius},${location.lat},${location.lng});
        node["healthcare"="nursing_home"](around:${radius},${location.lat},${location.lng});
        way["healthcare"="nursing_home"](around:${radius},${location.lat},${location.lng});
        node["social_facility"="nursing_home"](around:${radius},${location.lat},${location.lng});
        way["social_facility"="nursing_home"](around:${radius},${location.lat},${location.lng});
      );
      out body;
      >;
      out skel qt;
    `

    console.log('Querying Overpass API with:', query)

    // Make request to Overpass API
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query
    })

    if (!response.ok) {
      throw new Error('Failed to fetch from Overpass API')
    }

    const data = await response.json()
    console.log('Received data from Overpass:', data)

    // Transform results to match our expected format
    const facilities = data.elements
      .filter(element => element.type === 'node' || element.type === 'way')
      .map((place) => ({
        id: place.id.toString(),
        name: place.tags?.name || 'Unnamed Facility',
        address: [
          place.tags?.['addr:street'],
          place.tags?.['addr:housenumber'],
          place.tags?.['addr:city'],
          place.tags?.['addr:postcode']
        ].filter(Boolean).join(', ') || 'Address not available',
        location: {
          lat: place.lat || (place.center?.lat),
          lng: place.lon || (place.center?.lon)
        },
        rating: place.tags?.stars || null,
        user_ratings_total: null,
        types: ['nursing_home'],
      }))

    console.log('Transformed facilities:', facilities)

    return new Response(
      JSON.stringify({ facilities }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      },
    )
  } catch (error) {
    console.error('Error in search-care-facilities:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      },
    )
  }
})