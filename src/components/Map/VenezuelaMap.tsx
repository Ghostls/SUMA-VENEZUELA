import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { CLUBS } from '@/services/dashboard'
import venezuelaGeoJSON from '@/assets/venezuela.json'

/**
 * VenezuelaMap.tsx — v2.0 (Evolución sin Destrucción)
 * - NUEVO v2.0: mapa ampliado a los 10 estados activos de los 11 clubes
 *   Barinas, Táchira (San Cristóbal), Bolívar (Puerto Ordaz),
 *   Carabobo (Puerto Cabello) agregados
 * - v1.0: Leaflet + GeoJSON, pings animados, tooltip glassmorphism, Esequibo
 */

// ── Estado GeoJSON → ciudad del club ─────────────────────────────────────────
// Los nombres deben coincidir EXACTAMENTE con los que vienen en el GeoJSON.
// Si el mapa no resalta algún estado, revisar en consola los "Nombres estados:"
// que loguea el useEffect y ajustar las keys aquí.
const STATE_TO_CITY: Record<string, string> = {
  // ── Clubes originales ──────────────────────────────────────────────────────
  'Lara':          'Barquisimeto',   // Victoria Padel Club
  'Aragua':        'Maracay',        // Olympus Sport Club
  'Miranda':       'Caracas',        // Capital Sports · La Marina (Lechería está en Anzoátegui)
  'Anzoátegui':    'Lechería',       // La Marina Sport Club
  'Anzoategui':    'Lechería',       // alias sin tilde
  'Mérida':        'Mérida',         // Metro Atletik
  'Merida':        'Mérida',         // alias sin tilde
  'Monagas':       'Maturín',        // Saque Pádel Club
  'Nueva Esparta': 'Margarita',      // Margarita Pádel Club
  'Nueva esparta': 'Margarita',      // alias capitalización
  // ── Clubes nuevos ──────────────────────────────────────────────────────────
  'Barinas':       'Barinas',        // Padel Sports Barinas
  'Táchira':       'San Cristóbal',  // Smash Padel · Andes Padel
  'Tachira':       'San Cristóbal',  // alias sin tilde
  'Bolívar':       'Puerto Ordaz',   // Arenas Padel Club
  'Bolivar':       'Puerto Ordaz',   // alias sin tilde
  'Carabobo':      'Puerto Cabello', // Waikiki Beach Padel Club
}

// ── Coordenadas del ping por estado ──────────────────────────────────────────
const STATE_CENTERS: Record<string, [number, number]> = {
  'Lara':          [ 9.98, -69.65],
  'Aragua':        [10.07, -67.28],
  'Miranda':       [10.23, -66.58],
  'Anzoategui':    [ 9.32, -64.68],
  'Merida':        [ 8.59, -71.14],
  'Monagas':       [ 9.33, -63.01],
  'Nueva Esparta': [11.00, -63.90],
  'Barinas':       [ 8.62, -70.20], // nuevo
  'Tachira':       [ 7.88, -72.22], // nuevo
  'Bolivar':       [ 8.10, -63.55], // nuevo
  'Carabobo':      [10.48, -68.00], // nuevo
}

interface TooltipData {
  city: string
  clubs: string
  count: number
  x: number
  y: number
}

export default function VenezuelaMap({ byState }: { byState: Record<string, number> }) {
  const mapRef    = useRef<HTMLDivElement>(null)
  const leafletRef = useRef<L.Map | null>(null)
  const mountedRef = useRef(true)

  const [tooltip, setTooltip] = useState<TooltipData | null>(null)
  const [ready, setReady]     = useState(false)

  const clubsOfCity = (city: string) =>
    CLUBS.filter(c => c.state === city).map(c => c.name).join(' · ')

  useEffect(() => {
    mountedRef.current = true
    if (!mapRef.current || leafletRef.current) return

    const map = L.map(mapRef.current, {
      center: [7.5, -66.0],
      zoom: 5,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      dragging: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      touchZoom: false,
    })
    leafletRef.current = map

    const loadMap = async () => {
      try {
        const data = venezuelaGeoJSON as GeoJSON.FeatureCollection

        // Debug: ver nombres exactos del GeoJSON en consola
        console.log('GeoJSON estados:', data.features.map(f =>
          f.properties?.NAME_1 ?? f.properties?.name ?? f.properties?.shapeName
        ))

        L.geoJSON(data, {
          style: (feature) => {
            const name =
              feature?.properties?.NAME_1 ??
              feature?.properties?.name ??
              feature?.properties?.shapeName ?? ''
            const isActive = name in STATE_TO_CITY
            return {
              fillColor:   isActive ? 'rgba(212,160,23,0.28)' : 'rgba(255,255,255,0.04)',
              fillOpacity: 1,
              color:       isActive ? 'rgba(212,160,23,0.75)' : 'rgba(255,255,255,0.15)',
              weight:      isActive ? 1.2 : 0.7,
            }
          },
          onEachFeature: (feature, layer) => {
            const name =
              feature?.properties?.NAME_1 ??
              feature?.properties?.name ??
              feature?.properties?.shapeName ?? ''
            const city = STATE_TO_CITY[name]
            if (!city) return

            layer.on({
              mouseover: (e) => {
                if (!mountedRef.current) return
                ;(e.target as L.Path).setStyle({
                  fillColor: 'rgba(249,115,22,0.52)',
                  color: 'rgba(249,115,22,1)',
                  weight: 1.8,
                })
                const pt = map.latLngToContainerPoint(e.latlng)
                setTooltip({
                  city,
                  clubs: clubsOfCity(city),
                  count: byState[city] || 0,
                  x: pt.x,
                  y: pt.y,
                })
              },
              mousemove: (e) => {
                if (!mountedRef.current) return
                const pt = map.latLngToContainerPoint(e.latlng)
                setTooltip(prev => prev ? { ...prev, x: pt.x, y: pt.y } : null)
              },
              mouseout: (e) => {
                if (!mountedRef.current) return
                ;(e.target as L.Path).setStyle({
                  fillColor: 'rgba(212,160,23,0.28)',
                  color: 'rgba(212,160,23,0.75)',
                  weight: 1.2,
                })
                setTooltip(null)
              },
            })
          },
        }).addTo(map)

        // ── Esequibo (zona en reclamación) ────────────────────────────────────
        L.geoJSON({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-59.8, 8.0], [-59.5, 7.2], [-59.2, 6.5], [-59.0, 5.8],
              [-59.8, 5.5], [-60.5, 5.5], [-61.0, 6.0], [-61.0, 7.0],
              [-60.5, 7.8], [-60.0, 8.5], [-59.8, 8.0],
            ]],
          },
        } as GeoJSON.Feature, {
          style: {
            fillColor: '#D4A017',
            fillOpacity: 0.08,
            color: 'rgba(212,160,23,0.65)',
            weight: 1,
            dashArray: '5 4',
          },
        }).addTo(map)

        L.marker([-60.0, 6.8] as unknown as L.LatLngExpression, {
          icon: L.divIcon({
            html: `<span style="color:rgba(212,160,23,0.7);font-size:9px;font-style:italic;white-space:nowrap;font-family:system-ui,sans-serif">Zona en Reclamación</span>`,
            className: '',
            iconAnchor: [60, 6],
          }),
        }).addTo(map)

        // ── Pings en cada estado activo ───────────────────────────────────────
        Object.entries(STATE_CENTERS).forEach(([stateName, latlng]) => {
          const city = STATE_TO_CITY[stateName]
          if (!city) return
          const n = byState[city] || 0

          L.marker(latlng as L.LatLngExpression, {
            interactive: false,
            icon: L.divIcon({
              html: `
                <div style="position:relative;width:28px;height:28px;transform:translate(-50%,-50%)">
                  <div style="position:absolute;inset:0;border-radius:50%;border:1.5px solid rgba(249,115,22,0.7);animation:ping 2.2s ease-out infinite;"></div>
                  <div style="position:absolute;top:50%;left:50%;width:9px;height:9px;border-radius:50%;background:#D4A017;transform:translate(-50%,-50%);box-shadow:0 0 8px rgba(249,115,22,0.9);"></div>
                  ${n > 0 ? `<div style="position:absolute;top:-18px;left:50%;transform:translateX(-50%);color:#D4A017;font-size:9px;font-weight:700;white-space:nowrap;font-family:system-ui,sans-serif">${n}</div>` : ''}
                </div>
              `,
              className: '',
              iconSize: [0, 0],
            }),
          }).addTo(map)
        })

        if (mountedRef.current) setReady(true)
      } catch (err) {
        console.error('Map init error:', err)
        if (mountedRef.current) setReady(true)
      }
    }

    loadMap()

    return () => {
      mountedRef.current = false
      setTooltip(null)
      map.remove()
      leafletRef.current = null
    }
  }, [])

  return (
    <section className="max-w-5xl mx-auto px-6 py-24">
      <h2 className="display text-4xl md:text-6xl text-center mb-3">
        El mapa del movimiento
      </h2>
      <p className="text-white/50 text-center mb-12">
        Pasa el cursor sobre los estados activos.
      </p>

      <div
        className="relative rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg,rgba(255,255,255,0.06) 0%,rgba(255,255,255,0.02) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12),0 8px 40px rgba(0,0,0,0.45)',
        }}
      >
        <style>{`
          @keyframes ping {
            0%,100% { transform:scale(1); opacity:0.8; }
            50% { transform:scale(2.2); opacity:0; }
          }
          .leaflet-container { background:transparent !important; }
        `}</style>

        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <p className="text-white/30 text-sm uppercase tracking-widest">Cargando mapa…</p>
          </div>
        )}

        <div ref={mapRef} style={{ height: '520px', width: '100%', background: 'transparent' }} />

        <AnimatePresence>
          {tooltip && (
            <motion.div
              key="tip"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="absolute pointer-events-none rounded-xl px-5 py-3 text-center z-[9999]"
              style={{
                left: tooltip.x,
                top: tooltip.y + 16,
                transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg,rgba(249,115,22,0.22),rgba(212,160,23,0.14))',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(212,160,23,0.45)',
                boxShadow: '0 4px 24px rgba(249,115,22,0.2),inset 0 1px 0 rgba(255,255,255,0.15)',
                whiteSpace: 'nowrap',
              }}
            >
              <p className="font-semibold text-gold text-sm">{tooltip.city}</p>
              <p className="text-xs text-white/65 mt-0.5">{tooltip.clubs || 'Club por confirmar'}</p>
              <p className="text-xs text-white/50">{tooltip.count} inscritos</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Leyenda */}
        <div className="flex flex-wrap justify-center gap-5 px-6 pb-5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(212,160,23,0.28)', border: '1px solid rgba(212,160,23,0.75)' }} />
            <span className="text-[10px] uppercase tracking-widest text-white/40">Estado activo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.15)' }} />
            <span className="text-[10px] uppercase tracking-widest text-white/40">Estado inactivo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded-sm" style={{ background: 'repeating-linear-gradient(45deg,rgba(212,160,23,0.5) 0px,rgba(212,160,23,0.5) 2px,transparent 2px,transparent 5px)', border: '1px dashed rgba(212,160,23,0.6)' }} />
            <span className="text-[10px] uppercase tracking-widest text-white/40">Zona en Reclamación (Esequibo)</span>
          </div>
        </div>
      </div>
    </section>
  )
}