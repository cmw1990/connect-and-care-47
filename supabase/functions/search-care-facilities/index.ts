
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

interface SearchParams {
  location: {
    lat: number
    lng: number
  }
  radius?: number // in meters
  country?: string
  city?: string
  state?: string
  types?: string[]
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
    const { location, radius = 5000, country, city, state, types = [] }: SearchParams = await req.json()

    // If no location provided, try OSM Nominatim geocoding for city/state/country
    let searchLocation = location;
    if (!location && (city || state || country)) {
      const searchQuery = [city, state, country].filter(Boolean).join(', ');
      // Use accept-language header to help with Chinese character handling
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1&accept-language=zh`;
      console.log('Geocoding request URL:', nominatimUrl);
      
      const response = await fetch(nominatimUrl, {
        headers: {
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
        }
      });
      const data = await response.json();
      console.log('Geocoding response:', data);
      
      if (data && data[0]) {
        searchLocation = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
    }

    // Construct Overpass API query with specific filters
    let areaQuery = '';
    if (country) {
      const countryCode = getCountryCode(country);
      areaQuery = `area["ISO3166-1"="${countryCode}"]->.searchArea;`;
      if (state) {
        // For China, use different admin levels depending on the region type
        const adminLevel = country === 'China' || country === '中国' ? '4|5|6' : '4';
        areaQuery += `area["admin_level"~"${adminLevel}"]["name"~"${state}"]->.searchArea;`;
      }
      if (city) {
        areaQuery += `area["place"="city"]["name"~"${city}"]->.searchArea;`;
      }
    }

    const query = `
      [out:json][timeout:25];
      ${areaQuery}
      (
        node["amenity"="nursing_home"](around:${radius},${searchLocation.lat},${searchLocation.lng});
        way["amenity"="nursing_home"](around:${radius},${searchLocation.lat},${searchLocation.lng});
        node["healthcare"="nursing_home"](around:${radius},${searchLocation.lat},${searchLocation.lng});
        way["healthcare"="nursing_home"](around:${radius},${searchLocation.lat},${searchLocation.lng});
        node["social_facility"="nursing_home"](around:${radius},${searchLocation.lat},${searchLocation.lng});
        way["social_facility"="nursing_home"](around:${radius},${searchLocation.lat},${searchLocation.lng});
        node["healthcare"="residential_care"](around:${radius},${searchLocation.lat},${searchLocation.lng});
        way["healthcare"="residential_care"](around:${radius},${searchLocation.lat},${searchLocation.lng});
        // Add Chinese-specific tags
        node["amenity"="elderly_nursing_home"](around:${radius},${searchLocation.lat},${searchLocation.lng});
        way["amenity"="elderly_nursing_home"](around:${radius},${searchLocation.lat},${searchLocation.lng});
        node["healthcare"="elderly_care"](around:${radius},${searchLocation.lat},${searchLocation.lng});
        way["healthcare"="elderly_care"](around:${radius},${searchLocation.lat},${searchLocation.lng});
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
        name: place.tags?.name || place.tags?.['name:zh'] || place.tags?.['name:en'] || 'Unnamed Facility',
        address: [
          place.tags?.['addr:street'] || place.tags?.['addr:street:zh'] || place.tags?.['addr:street:en'],
          place.tags?.['addr:housenumber'],
          place.tags?.['addr:city'] || place.tags?.['addr:city:zh'] || place.tags?.['addr:city:en'],
          place.tags?.['addr:postcode'],
          place.tags?.['addr:country'] || place.tags?.['addr:country:zh'] || place.tags?.['addr:country:en']
        ].filter(Boolean).join(', ') || 'Address not available',
        location: {
          lat: place.lat || (place.center?.lat),
          lng: place.lon || (place.center?.lon),
          country: place.tags?.['addr:country'] || country || null,
          city: place.tags?.['addr:city'] || city || null,
          region: place.tags?.['addr:state'] || state || null
        },
        rating: place.tags?.stars || null,
        user_ratings_total: null,
        types: ['nursing_home'],
        description: place.tags?.description || null,
        verified: false
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

function getCountryCode(country: string): string {
  const countryMap: Record<string, string> = {
    'United States': 'US',
    'USA': 'US',
    'Canada': 'CA',
    'United Kingdom': 'GB',
    'UK': 'GB',
    'China': 'CN',
    '中国': 'CN'
  }
  return countryMap[country] || country
}
