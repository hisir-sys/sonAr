import { useState } from 'react'
import { Search, X, MapPin, Loader2 } from 'lucide-react'

interface SearchResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  type?: string
  class?: string
}

interface SearchPanelProps {
  onClose: () => void
  onLocationSelect: (location: {
    lat: number
    lon: number
    name: string
  }) => void
}

export default function SearchPanel({
  onClose,
  onLocationSelect,
}: SearchPanelProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const searchPlaces = async () => {
    const trimmedQuery = query.trim()

    if (!trimmedQuery) {
      setResults([])
      return
    }

    setLoading(true)
    setError('')

    try {
      const url =
        `https://nominatim.openstreetmap.org/search` +
        `?format=jsonv2` +
        `&limit=5` +
        `&addressdetails=1` +
        `&q=${encodeURIComponent(trimmedQuery)}`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Search request failed')
      }

      const data =
        (await response.json()) as SearchResult[]

      setResults(data)

      if (data.length === 0) {
        setError('No places found')
      }
    } catch (err) {
      console.error('SONAR: search failed', err)
      setResults([])
      setError('Unable to search right now')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()
    void searchPlaces()
  }

  const handleSelect = (result: SearchResult) => {
    onLocationSelect({
      lat: Number(result.lat),
      lon: Number(result.lon),
      name: result.display_name,
    })
  }

  return (
    <div className="flex h-full flex-col p-5">
      {/* Header */}
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

      {/* Search form */}
      <form
        onSubmit={handleSubmit}
        className="relative"
      >
        <Search
          size={16}
          strokeWidth={1.8}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />

        <input
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)

            if (error) {
              setError('')
            }
          }}
          placeholder="Search a city or place..."
          autoFocus
          autoComplete="off"
          className="w-full rounded-md border border-border bg-card py-2.5 pl-9 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
        />

        <button
          type="submit"
          disabled={loading || !query.trim()}
          aria-label="Search"
          className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
        >
          {loading ? (
            <Loader2
              size={15}
              className="animate-spin"
            />
          ) : (
            <Search size={15} />
          )}
        </button>
      </form>

      {/* Results */}
      <div className="mt-5 flex-1 overflow-y-auto">
        {error && (
          <div className="rounded-md border border-border/60 bg-card/50 px-3 py-3 text-xs text-muted-foreground">
            {error}
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-1.5">
            <div className="mb-2 px-1 text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground/50">
              Results
            </div>

            {results.map((result) => (
              <button
                key={result.place_id}
                type="button"
                onClick={() => handleSelect(result)}
                className="group flex w-full items-start gap-3 rounded-md border border-transparent px-3 py-3 text-left transition-colors hover:border-border hover:bg-card"
              >
                <MapPin
                  size={16}
                  strokeWidth={1.7}
                  className="mt-0.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                />

                <div className="min-w-0">
                  <div className="text-xs leading-5 text-foreground">
                    {result.display_name.split(',')[0]}
                  </div>

                  <div className="mt-0.5 line-clamp-2 text-[10px] leading-4 text-muted-foreground">
                    {result.display_name}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {!loading &&
          !error &&
          results.length === 0 &&
          query.trim() === '' && (
            <div className="flex flex-col items-center justify-center pt-16 text-center">
              <Search
                size={28}
                strokeWidth={1.2}
                className="mb-3 text-muted-foreground/30"
              />

              <p className="text-xs text-muted-foreground/60">
                Search for a location
              </p>

              <p className="mt-1 text-[10px] text-muted-foreground/40">
                Press Enter to search
              </p>
            </div>
          )}
      </div>

      {/* Footer */}
      <div className="border-t border-border/50 pt-3">
        <p className="text-[9px] leading-4 text-muted-foreground/40">
          Search powered by OpenStreetMap
        </p>
      </div>
    </div>
  )
}