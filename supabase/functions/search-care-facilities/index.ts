import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const GOOGLE_PLACES_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY')

interface SearchParams {
  location: {
    lat: number
    lng: number
  }
  radius?: number // in meters
  keyword?: string
}

serve(async (req) => {
  try {
    // Handle CORS
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        }
      })
    }

    // Verify request method
    if (req.method !== 'POST') {
      throw new Error('Method not allowed')
    }

    // Get search parameters from request body
    const { location, radius = 5000, keyword = 'care home' }: SearchParams = await req.json()

    // Construct Google Places API URL
    const baseUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json'
    const url = new URL(baseUrl)
    url.searchParams.append('location', `${location.lat},${location.lng}`)
    url.searchParams.append('radius', radius.toString())
    url.searchParams.append('keyword', keyword)
    url.searchParams.append('type', 'health')
    url.searchParams.append('key', GOOGLE_PLACES_API_KEY || '')

    // Make request to Google Places API
    const response = await fetch(url.toString())
    const data = await response.json()

    // Transform and filter results
    const facilities = data.results.map((place: any) => ({
      id: place.place_id,
      name: place.name,
      address: place.vicinity,
      location: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng
      },
      rating: place.rating,
      user_ratings_total: place.user_ratings_total,
      types: place.types,
    }))

    return new Response(
      JSON.stringify({ facilities }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    )
  }
})