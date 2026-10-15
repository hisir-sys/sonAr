import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Search, X, MapPin, Loader2 } from 'lucide-react'

interface PhotonFeature {
  type: 'Feature'
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  }
  properties: {
    osm_id?: number
    osm_type?: string
    name?: string
    city?: string
    district?: string
    county?: string
    state?: string
    country?: string
    type?: string
    [key: string]: unknown
  }
}

interface SearchResult {
  id: string
  name: string
  context: string
  lat: number
  lon: number
}

interface SearchPanelProps {
  onClose: () => void
  onLocationSelect: (location: {
    lat: number
    lon: number
    name: string
  }) => void
}

function toSearchResult(feature: PhotonFeature): SearchResult | null {
  const [lon, lat] = feature.geometry.coordinates
  const properties = feature.properties
  const name = properties.name?.trim()

  if (!name || !Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null
  }

  const contextParts = [
    properties.city,
    properties.district,
    properties.county,
    properties.state,
    properties.country,
  ]
    .filter((part): part is string => Boolean(part?.trim()))
    .filter((part, index, all) => all.indexOf(part) === index)
    .filter((part) => part.toLocaleLowerCase() !== name.toLocaleLowerCase())

  const id = `${properties.osm_type ?? 'place'}-${properties.osm_id ?? `${lat}-${lon}`}`

  return {
    id,
    name,
    context: contextParts.join(', ') || String(properties.type ?? 'Place'),
    lat,
    lon,
  }
}

export default function SearchPanel({
  onClose,
  onLocationSelect,
}: SearchPanelProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const requestIdRef = useRef(0)

  useEffect(() => {
    const trimmedQuery = query.trim()

    if (trimmedQuery.length < 2) {
      setResults([])
      setError('')
      setLoading(false)
      setHasSearched(false)
      return
    }

    const controller = new AbortController()
    const requestId = ++requestIdRef.current

    // Debounce keystrokes so we fetch suggestions only after typing pauses.
    const timer = window.setTimeout(async () => {
      setLoading(true)
      setError('')

      try {
        const url = new URL('https://photon.komoot.io/api/')
        url.searchParams.set('q', trimmedQuery)
        url.searchParams.set('limit', '7')
        url.searchParams.set('lang', 'en')

        const response = await fetch(url.toString(), {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        })

        if (!response.ok) {
          throw new Error(`Place search failed (${response.status})`)
        }

        const data = (await response.json()) as {
          features?: PhotonFeature[]
        }

        if (requestId !== requestIdRef.current) return

        const mapped = (data.features ?? [])
          .map(toSearchResult)
          .filter((result): result is SearchResult => result !== null)

        // Keep the result list tidy if the provider returns duplicates.
        const unique = mapped.filter(
          (result, index, all) =>
            all.findIndex(
              (item) =>
                item.name.toLocaleLowerCase() === result.name.toLocaleLowerCase() &&
                item.context.toLocaleLowerCase() === result.context.toLocaleLowerCase(),
            ) === index,
        )

        setResults(unique)
        setHasSearched(true)
      } catch (caught) {
        if (controller.signal.aborted || requestId !== requestIdRef.current) {
          return
        }

        console.error('SONAR: live place search failed', caught)
        setResults([])
        setError('Search is temporarily unavailable. Please try again.')
        setHasSearched(true)
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false)
        }
      }
    }, 350)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    // Enter remains useful, but suggestions also update while typing.
    event.preventDefault()
  }

  const handleSelect = (result: SearchResult) => {
    onLocationSelect({
      lat: result.lat,
      lon: result.lon,
      name: [result.name, result.context].filter(Boolean).join(', '),
    })
  }

  return (
    <div className="flex h-full flex-col p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Search
          </h2>
          <p className="mt-1 text-[10px] text-muted-foreground/60">
            Find a city or place
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close search"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <Search
          size={16}
          strokeWidth={1.8}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />

        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search a city or place..."
          autoFocus
          autoComplete="off"
          aria-label="Search cities and places"
          aria-controls="sonar-place-results"
          aria-expanded={results.length > 0}
          className="w-full rounded-md border border-border bg-card py-2.5 pl-9 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
        />

        {loading && (
          <Loader2
            size={15}
            aria-label="Searching"
            className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground"
          />
        )}
      </form>

      <div
        id="sonar-place-results"
        className="mt-4 min-h-0 flex-1 overflow-y-auto"
        aria-live="polite"
      >
        {error && (
          <div role="status" className="rounded-md border border-border/60 bg-card/50 px-3 py-3 text-xs text-muted-foreground">
            {error}
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-1">
            <div className="mb-2 px-1 text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground/50">
              Suggestions
            </div>

            {results.map((result) => (
              <button
                key={result.id}
                type="button"
                onClick={() => handleSelect(result)}
                className="group flex w-full items-start gap-3 rounded-md border border-transparent px-3 py-3 text-left transition-colors hover:border-border hover:bg-card focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50"
              >
                <MapPin
                  size={16}
                  strokeWidth={1.7}
                  className="mt-0.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                />

                <span className="min-w-0">
                  <span className="block text-xs leading-5 text-foreground">
                    {result.name}
                  </span>
                  <span className="mt-0.5 block line-clamp-2 text-[10px] leading-4 text-muted-foreground">
                    {result.context}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}

        {!loading && !error && query.trim().length < 2 && (
          <div className="flex flex-col items-center justify-center pt-16 text-center">
            <Search
              size={28}
              strokeWidth={1.2}
              className="mb-3 text-muted-foreground/30"
            />
            <p className="text-xs text-muted-foreground/60">
              Start typing to find places
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground/40">
              Suggestions appear automatically
            </p>
          </div>
        )}

        {!loading && !error && hasSearched && results.length === 0 && (
          <div className="rounded-md border border-border/60 bg-card/50 px-3 py-3 text-xs text-muted-foreground">
            No matching places found. Try another spelling.
          </div>
        )}

        {loading && results.length === 0 && (
          <div className="flex items-center gap-2 px-2 py-3 text-xs text-muted-foreground">
            <Loader2 size={14} className="animate-spin" />
            Finding places…
          </div>
        )}
      </div>

      <div className="border-t border-border/50 pt-3">
        <p className="text-[9px] leading-4 text-muted-foreground/40">
          Place suggestions by Photon · OpenStreetMap data
        </p>
      </div>
    </div>
  )
}
