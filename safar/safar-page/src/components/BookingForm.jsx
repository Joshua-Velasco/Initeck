import React, { useState, useEffect, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { API_URL, STRIPE_PUBLIC_KEY } from '../config';
import './BookingForm.css';

// Nuevos componentes
import DriverSelection from './DriverSelection';

// Premium Assets
import comfortCar from '../assets/comfort.png';
import eliteCar from '../assets/elite.png';
import futureCar from '../assets/future.png';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoiam9zaHZlbGEiLCJhIjoiY21uOTBleGFyMDNvODJ3cTE1MDU3ZWdmYSJ9.JEARY1ndg_yCWaLsVMIWkQ';
// Using environment variables explicitly for Vite
const stripePromise = loadStripe(STRIPE_PUBLIC_KEY || 'pk_test_fallback');

// Bounding box estricto de Ciudad Juárez, Chihuahua [minLng, minLat, maxLng, maxLat]
const CJ_BBOX = '-106.65,31.55,-106.20,31.87';
// Centro y coordenadas de proximidad
const CJ_PROXIMITY = '-106.4245,31.6904';

// Diccionario de abreviaciones y alias locales de Cd. Juárez
const CJ_ALIASES = {
  // Instituciones educativas
  'itcj': 'Instituto Tecnológico de Ciudad Juárez',
  'tec': 'Instituto Tecnológico de Ciudad Juárez',
  'tecnológico': 'Instituto Tecnológico de Ciudad Juárez',
  'tecnologico': 'Instituto Tecnológico de Ciudad Juárez',
  'uacj': 'Universidad Autónoma de Ciudad Juárez',
  'uach': 'Universidad Autónoma de Chihuahua Ciudad Juárez',
  'cbtis': 'CBTIS Ciudad Juárez',
  'cetis': 'CETIS Ciudad Juárez',
  'conalep': 'CONALEP Ciudad Juárez',
  'cecyte': 'CECyTE Ciudad Juárez',
  'cobach': 'COBACH Ciudad Juárez',
  // Hospitales y salud
  'imss': 'IMSS Ciudad Juárez',
  'issste': 'ISSSTE Ciudad Juárez',
  'hospital general': 'Hospital General de Ciudad Juárez',
  'hospital infantil': 'Hospital Infantil Ciudad Juárez',
  // Gobierno y trámites
  'sat': 'SAT Servicio de Administración Tributaria Ciudad Juárez',
  'inm': 'INM Migración Ciudad Juárez',
  'imip': 'IMIP Ciudad Juárez',
  'municipio': 'Presidencia Municipal Ciudad Juárez',
  'palacio municipal': 'Presidencia Municipal Ciudad Juárez',
  // Transporte
  'aeropuerto': 'Aeropuerto Internacional Abraham González Ciudad Juárez',
  'abraham gonzalez': 'Aeropuerto Internacional Abraham González',
  'central camionera': 'Central Camionera Ciudad Juárez',
  // Comercios y plazas conocidas
  'sendero': 'Plaza Sendero Ciudad Juárez',
  'galerias': 'Galerías Tec Ciudad Juárez',
  'pronaf': 'Zona Pronaf Ciudad Juárez',
  'factor': 'Factor Outlet Ciudad Juárez',
  // Instituciones culturales y deportivas
  'iada': 'IADA Instituto de Artes y Deportes Ciudad Juárez',
  'inba': 'INBA Instituto Nacional de Bellas Artes Ciudad Juárez',
  'ichicult': 'ICHICULT Ciudad Juárez',
  'parque central': 'Parque Central Ciudad Juárez',
  'parque chamizal': 'Parque El Chamizal Ciudad Juárez',
  'estadio olimpico': 'Estadio Olímpico Benito Juárez',
  'estadio benito juarez': 'Estadio Olímpico Benito Juárez',
  'foro': 'Foro de las Estrellas Ciudad Juárez',
  // Zonas y colonias comunes
  'centro': 'Centro Histórico Ciudad Juárez',
  'zaragoza': 'Puente Zaragoza Ciudad Juárez',
  'cordova': 'Puente Córdova Ciudad Juárez',
  'córdova': 'Puente Córdova Ciudad Juárez',
  'lerdo': 'Puente Lerdo Ciudad Juárez',
  'chaparral': 'El Chaparral Ciudad Juárez',
  'cfe': 'CFE Ciudad Juárez',
  'pemex': 'Pemex Ciudad Juárez',
};

/**
 * Expande el query: primero revisa alias exactos, luego agrega contexto
 * "Ciudad Juárez" automáticamente si el usuario no lo escribió.
 */
const buildSearchQuery = (raw) => {
  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();

  // Coincidencia exacta de alias
  if (CJ_ALIASES[lower]) return CJ_ALIASES[lower];

  // Coincidencia parcial: si el query empieza con alguna clave del alias
  for (const [key, value] of Object.entries(CJ_ALIASES)) {
    if (lower.startsWith(key) || key.startsWith(lower)) return value;
  }

  // Si el query ya menciona Juárez o Chihuahua no se agrega contexto extra
  const hasContext = /ju[aá]rez|chihuahua|cd\.?\s*j/i.test(lower);
  return hasContext ? trimmed : `${trimmed} Ciudad Juárez`;
};

// ── CheckoutForm DEBE estar fuera de BookingForm ─────────────────────────────
// Si se define adentro, React lo recrea en cada re-render del padre y destruye
// el contexto de Stripe (bug de "componente cortado" al pagar).
const CheckoutForm = ({ totalPrice, paymentMethod, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isElementReady, setIsElementReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Previene doble-clic y envíos antes de que Stripe cargue
    if (!stripe || !elements || !isElementReady || isSubmitting) return;

    setIsSubmitting(true);
    setLocalError('');

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Solo se usa si hay redirect (3D Secure), apunta de vuelta a la app
          return_url: window.location.origin + window.location.pathname,
        },
        redirect: 'if_required', // No redirige a menos que sea requerido (ej. 3DS)
      });

      if (error) {
        // error.type puede ser: card_error, validation_error, invalid_request_error
        const friendly = error.type === 'card_error'
          ? error.message
          : 'No se pudo procesar el pago. Verifica los datos e intenta de nuevo.';
        setLocalError(friendly);
        onError(friendly);
        setIsSubmitting(false);
      } else if (paymentIntent?.status === 'succeeded') {
        onSuccess(paymentIntent);
      } else if (paymentIntent?.status === 'requires_action') {
        // 3D Secure completado o pendiente
        setLocalError('Se requiere autenticación adicional con tu banco.');
        onError('Autenticación adicional requerida.');
        setIsSubmitting(false);
      } else {
        setLocalError('Pago incompleto. Intenta de nuevo.');
        onError('Pago incompleto.');
        setIsSubmitting(false);
      }
    } catch (err) {
      const msg = 'Error de conexión. Verifica tu internet e intenta de nuevo.';
      setLocalError(msg);
      onError(msg);
      setIsSubmitting(false);
    }
  };

  const depositAmt = Math.round(totalPrice * 0.30);
  const btnLabel = isSubmitting
    ? 'Procesando...'
    : paymentMethod === 'cash_deposit'
      ? `Pagar depósito $${depositAmt}.00`
      : `Pagar $${totalPrice}.00`;

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <PaymentElement
        onReady={() => setIsElementReady(true)}
        options={{ layout: 'tabs' }}
      />
      {localError && (
        <p className="stripe-local-error">{localError}</p>
      )}
      <button
        type="submit"
        className="main-cta-btn"
        style={{ width: '100%', marginTop: '1.25rem' }}
        disabled={!isElementReady || isSubmitting}
      >
        {btnLabel}
      </button>
    </form>
  );
};
// ─────────────────────────────────────────────────────────────────────────────

const BookingForm = ({ authUser, userProfile, onBookingComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    origen: '',
    destino: '',
    fecha: '',
    hora: '12:00',
    codigoChofer: '',
    precioEstimado: 850.00,
    vehicleType: 'comfort' // default
  });
  
  const [drivers, setDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(''); // '' | 'cash_deposit' | 'stripe'
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [bookedFolio, setBookedFolio] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // 'idle' | 'processing' | 'success' | 'error'
  const [outcomeMessage, setOutcomeMessage] = useState('');
  const [selectedDays, setSelectedDays] = useState([]); // legacy
  const [paymentMode, setPaymentMode] = useState('per-trip');
  const [isDetecting, setIsDetecting] = useState(false);
  const [scheduleMode, setScheduleMode] = useState('once'); // 'once' | 'multi'
  const [selectedDates, setSelectedDates] = useState([]); // fechas seleccionadas en modo multi
  const [calendarView, setCalendarView] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  // Nuevo: Selección de chofer
  const [selectedDriver, setSelectedDriver] = useState('');
  const [bookingStep, setBookingStep] = useState('location'); // 'location' | 'driver' | 'payment'

  // Timezone Helper: America/Chihuahua (Ciudad Juarez)
  const getJuarezTime = () => {
    const options = { timeZone: 'America/Chihuahua', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    const formatter = new Intl.DateTimeFormat('en-CA', options);
    const parts = formatter.formatToParts(new Date());
    const d = {}; parts.forEach(p => d[p.type] = p.value);
    return new Date(`${d.year}-${d.month}-${d.day}T${d.hour}:${d.minute}:${d.second}`);
  };

  const juarezNow = getJuarezTime();
  const minDateStr = juarezNow.getFullYear() + '-' + String(juarezNow.getMonth() + 1).padStart(2, '0') + '-' + String(juarezNow.getDate()).padStart(2, '0');
  
  // Maps & Location State
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [suggestions, setSuggestions] = useState({ origin: [], destination: [] });
  const [coords, setCoords] = useState({ origin: null, destination: null });
  const [distance, setDistance] = useState(0);
  const [routeGeoJSON, setRouteGeoJSON] = useState(null);
  const [isPickingLocation, setIsPickingLocation] = useState(null); // 'origin' or 'destination'
  const [mapCenter, setMapCenter] = useState(null);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersGroup = useRef(null);
  const polylineRef = useRef(null);
  const searchTimeout = useRef(null);


  // Fetch available drivers when component mounts
  useEffect(() => {
    fetch(`${API_URL}/booking_data.php`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDrivers(data.drivers);
        }
      })
      .catch(err => console.error("Error fetching drivers:", err));
  }, []);

  // Initialize Map
  useEffect(() => {
    // Prevent double initialization if component remounts quickly or React StrictMode
    if (mapInstance.current) return;
    
    const initMap = () => {
      if (!mapRef.current) return;
      
      // Cleanup any existing leaflet instance in the DOM just in case
      if (mapRef.current._leaflet_id) return; 

      console.log("🚀 Initializing Uber Map...");
      mapInstance.current = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([31.6904, -106.4245], 13);

      L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`).addTo(mapInstance.current);

      markersGroup.current = L.featureGroup().addTo(mapInstance.current);
      
      // Force immediate and delayed resize calculation
      const triggerResize = () => {
        if (mapInstance.current) {
          console.log("📐 Invalidating map size...");
          mapInstance.current.invalidateSize();
        }
      };

      triggerResize();
      setTimeout(triggerResize, 300);
      setTimeout(triggerResize, 1000);
    };

    initMap();

    // Resize listener for orientation changes/window resize
    const handleResize = () => {
      if (mapInstance.current) mapInstance.current.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    // Center tracking for picking
    const handleMove = () => {
      if (mapInstance.current) {
        const center = mapInstance.current.getCenter();
        setMapCenter({ lat: center.lat, lng: center.lng });
      }
    };

    if (mapInstance.current) {
      mapInstance.current.on('move', handleMove);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mapInstance.current) {
        mapInstance.current.off('move', handleMove);
        console.log("🧹 Cleaning up map instance...");
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []); // Only once on mount

  // Force map to fill container when steps change or UI elements appear
  useEffect(() => {
    if (mapInstance.current) {
      const timer = setTimeout(() => {
        mapInstance.current.invalidateSize();
        if (polylineRef.current) {
          mapInstance.current.fitBounds(polylineRef.current.getBounds(), { padding: [80, 80] });
        }
      }, 400); 
      return () => clearTimeout(timer);
    }
  }, [step, distance, isRouteLoading, suggestions.origin.length, suggestions.destination.length]);

  // Update Map Markers & Route
  useEffect(() => {
    if (mapInstance.current && markersGroup.current) {
      markersGroup.current.clearLayers();
      if (polylineRef.current) polylineRef.current.remove();

      const points = [];
      if (coords.origin) {
        L.marker([coords.origin.lat, coords.origin.lng], {
          icon: L.divIcon({ className: 'map-marker origin', html: 'A' })
        }).addTo(markersGroup.current);
        points.push([coords.origin.lat, coords.origin.lng]);
      }
      if (coords.destination) {
        L.marker([coords.destination.lat, coords.destination.lng], {
          icon: L.divIcon({ className: 'map-marker destination', html: 'B' })
        }).addTo(markersGroup.current);
        points.push([coords.destination.lat, coords.destination.lng]);
      }

      if (points.length === 2) {
        setIsRouteLoading(true);
        fetchRoute(coords.origin, coords.destination);
      } else if (points.length === 1) {
        mapInstance.current.setView(points[0], 15);
      }
    }
  }, [coords]);

  const fetchRoute = async (origin, dest) => {
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.lng},${origin.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson&access_token=${MAPBOX_TOKEN}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.code === 'Ok' && data.routes.length > 0) {
        const route = data.routes[0];
        const routeGeoJSONData = route.geometry;
        setRouteGeoJSON(routeGeoJSONData);

        if (polylineRef.current) polylineRef.current.remove();
        polylineRef.current = L.geoJSON(routeGeoJSONData, {
          style: { color: '#000000', weight: 5, opacity: 0.8 }
        }).addTo(mapInstance.current);

        if (polylineRef.current && mapInstance.current) {
          mapInstance.current.fitBounds(polylineRef.current.getBounds(), { padding: [100, 100] });
        }

        const d_km = route.distance / 1000;
        const uberKmRate = 18;
        let newPrice;
        if (d_km < 1.0) {
          newPrice = 100;
        } else {
          newPrice = Math.round(d_km * uberKmRate + 50);
        }
        const rawMin = Math.round(route.duration / 60);
        const finalMin = Math.max(rawMin, 5);

        setDistance(d_km);
        setFormData(prev => ({
          ...prev,
          precioEstimado: newPrice,
          tiempoEstimado: `${finalMin} min`,
          rawDuration: route.duration // seconds
        }));
      } else {
        // Mapbox no devolvió ruta — calcular distancia haversine como fallback
        applyFallbackDistance(origin, dest);
      }
    } catch (err) {
      console.error("Error fetching Mapbox route:", err);
      // Fallback: distancia haversine para no bloquear al usuario
      applyFallbackDistance(origin, dest);
    } finally {
      setIsRouteLoading(false);
    }
  };

  const applyFallbackDistance = (origin, dest) => {
    const R = 6371;
    const dLat = (dest.lat - origin.lat) * Math.PI / 180;
    const dLng = (dest.lng - origin.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(origin.lat * Math.PI/180) * Math.cos(dest.lat * Math.PI/180) * Math.sin(dLng/2)**2;
    const straight = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d_km = straight * 1.3; // factor vial estimado
    const uberKmRate = 18;
    const newPrice = d_km < 1.0 ? 100 : Math.round(d_km * uberKmRate + 50);
    const finalMin = Math.max(Math.round(d_km / 30 * 60), 5);
    setDistance(d_km);
    setFormData(prev => ({
      ...prev,
      precioEstimado: newPrice,
      tiempoEstimado: `~${finalMin} min`,
      rawDuration: finalMin * 60,
    }));
  };

  useEffect(() => {
    setFormData(prev => ({...prev, fecha: minDateStr}));
  }, [minDateStr]);

  const fetchSuggestions = (query, type) => {
    if (query.length < 2) {
      setSuggestions(prev => ({ ...prev, [type]: [] }));
      return;
    }

    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      try {
        const searchQuery = buildSearchQuery(query);

        // ── Fuente 1: Mapbox — calles y direcciones ────────────────────────────
        const mapboxFetch = fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json` +
          `?access_token=${MAPBOX_TOKEN}` +
          `&proximity=${CJ_PROXIMITY}` +
          `&bbox=${CJ_BBOX}` +
          `&country=mx&language=es` +
          `&types=poi,address,neighborhood,locality` +
          `&limit=3&autocomplete=true`
        ).then(r => r.json()).catch(() => ({ features: [] }));

        // ── Fuente 2: Nominatim (OSM) — lugares por nombre ─────────────────────
        // viewbox: left(minLng), top(maxLat), right(maxLng), bottom(minLat)
        const nominatimFetch = fetch(
          `https://nominatim.openstreetmap.org/search` +
          `?q=${encodeURIComponent(searchQuery)}` +
          `&countrycodes=mx` +
          `&viewbox=-106.65,31.87,-106.20,31.55` +
          `&bounded=1` +
          `&format=jsonv2` +
          `&limit=5` +
          `&accept-language=es` +
          `&dedupe=1`,
          { headers: { 'Accept': 'application/json' } }
        ).then(r => r.json()).catch(() => []);

        const [mapboxData, nominatimData] = await Promise.all([mapboxFetch, nominatimFetch]);

        // Formatear Mapbox (calles / direcciones)
        const mapboxResults = (mapboxData.features || []).map(f => ({
          display_name: f.place_name,
          short_name: f.text,
          place_type: f.place_type?.[0] || 'address',
          lat: f.center[1],
          lon: f.center[0],
          source: 'mapbox',
        }));

        // Formatear Nominatim (lugares / POIs)
        // Excluir resultados que son "Ciudad Juárez" la ciudad completa
        const POI_CATEGORIES = new Set(['amenity','building','tourism','leisure','shop','education','healthcare','office','sport','historic','natural','man_made','craft']);
        const nominatimResults = (Array.isArray(nominatimData) ? nominatimData : [])
          .filter(r => {
            if (!r.lat || !r.lon) return false;
            // Excluir cuando el resultado sea la ciudad o estado completo
            if (r.type === 'city' || r.type === 'administrative' || r.type === 'state') return false;
            return true;
          })
          .map(r => ({
            display_name: r.display_name,
            short_name: r.name || r.display_name.split(',')[0].trim(),
            place_type: POI_CATEGORIES.has(r.category) ? 'poi' : 'address',
            lat: parseFloat(r.lat),
            lon: parseFloat(r.lon),
            source: 'osm',
          }));

        // Mezclar: lugares (OSM) primero, luego calles (Mapbox)
        // Deduplicar por nombre
        const seen = new Set();
        const merged = [...nominatimResults, ...mapboxResults].filter(r => {
          const key = (r.short_name || '').toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 35);
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        }).slice(0, 6);

        setSuggestions(prev => ({ ...prev, [type]: merged }));
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      }
    }, 350);
  };

  const selectSuggestion = (item, type) => {
    const fieldName = type === 'origin' ? 'origen' : 'destino';
    setFormData(prev => ({ ...prev, [fieldName]: item.display_name }));
    setCoords(prev => ({ ...prev, [type]: { lat: parseFloat(item.lat), lng: parseFloat(item.lon) } }));
    setSuggestions(prev => ({ ...prev, [type]: [] }));
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocalización no soportada.");
      return;
    }

    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords(prev => ({ ...prev, origin: { lat: latitude, lng: longitude } }));
        
        try {
          const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}&types=address,poi&limit=1`;
          const response = await fetch(url);
          const data = await response.json();
          if (data && data.features && data.features.length > 0) {
            setFormData(prev => ({ ...prev, origen: data.features[0].place_name }));
          } else {
            setFormData(prev => ({ ...prev, origen: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
          }
        } catch (err) {
          setFormData(prev => ({ ...prev, origen: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
        } finally {
          setIsDetecting(false);
        }
      },
      (err) => {
        setError("No se pudo obtener tu ubicación.");
        setIsDetecting(false);
      }
    );
  };

  const handleConfirmPick = async () => {
    if (!mapCenter) return;
    
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${mapCenter.lng},${mapCenter.lat}.json?access_token=${MAPBOX_TOKEN}&limit=1&language=es`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const address = data.features[0].place_name;
        if (isPickingLocation === 'origin') {
          setFormData(prev => ({ ...prev, origen: address }));
          setCoords(prev => ({ ...prev, origin: { lat: mapCenter.lat, lng: mapCenter.lng } }));
        } else {
          setFormData(prev => ({ ...prev, destino: address }));
          setCoords(prev => ({ ...prev, destination: { lat: mapCenter.lat, lng: mapCenter.lng } }));
        }
      }
    } catch (err) {
      console.error("Reverse geocoding error:", err);
    } finally {
      setIsPickingLocation(null);
    }
  };

  const handleUseHomeAddress = (type) => {
    if (!userProfile) return;
    const lat = Number(userProfile.latitud);
    const lng = Number(userProfile.longitud);
    
    if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
      setError("No tienes una dirección registrada válida en tu perfil.");
      return;
    }

    const addressStr = [userProfile.calle, userProfile.numexterior, userProfile.colonia, userProfile.ciudad]
      .filter(Boolean)
      .join(', ');

    if (type === 'origin') {
      setFormData(prev => ({ ...prev, origen: addressStr }));
      setCoords(prev => ({ ...prev, origin: { lat, lng } }));
      setSuggestions(prev => ({ ...prev, origin: [] }));
    } else {
      setFormData(prev => ({ ...prev, destino: addressStr }));
      setCoords(prev => ({ ...prev, destination: { lat, lng } }));
      setSuggestions(prev => ({ ...prev, destination: [] }));
    }
  };

  // ── Helpers del calendario ──────────────────────────────────────────────────
  const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  const navigateCalendar = (dir) => {
    setCalendarView(prev => {
      let m = prev.month + dir;
      let y = prev.year;
      if (m > 11) { m = 0; y++; }
      if (m < 0) { m = 11; y--; }
      return { month: m, year: y };
    });
  };

  const MAX_DATES = 7;

  const toggleDate = (dateStr) => {
    setSelectedDates(prev => {
      if (prev.includes(dateStr)) return prev.filter(d => d !== dateStr);
      if (prev.length >= MAX_DATES) return prev; // límite de 7 días
      return [...prev, dateStr].sort();
    });
  };

  const formatDisplayDate = (dateStr) => {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}`;
  };

  const renderCalendarDays = () => {
    const { year, month } = calendarView;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Monday-start: (Sun=0 → shift to 6, Mon=1 → 0, ...)
    const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
    const cells = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`e${i}`} className="cal-day cal-day--empty" />);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isPast = dateStr < minDateStr;
      const isSelected = selectedDates.includes(dateStr);
      const isToday = dateStr === minDateStr;
      const isDisabled = isPast || (!isSelected && selectedDates.length >= MAX_DATES);
      cells.push(
        <button
          key={d}
          type="button"
          disabled={isDisabled}
          onClick={() => toggleDate(dateStr)}
          className={[
            'cal-day',
            isPast ? 'cal-day--past' : '',
            isSelected ? 'cal-day--selected' : '',
            isToday ? 'cal-day--today' : '',
            (!isSelected && selectedDates.length >= MAX_DATES && !isPast) ? 'cal-day--maxed' : '',
          ].filter(Boolean).join(' ')}
        >
          {d}
        </button>
      );
    }
    return cells;
  };
  // ─────────────────────────────────────────────────────────────────────────────

  const handleNext = () => {
    if (step === 1) {
      if (!formData.origen || !formData.destino) {
        setError('Completa origen y destino.');
        return;
      }
      if (scheduleMode === 'once' && !formData.fecha) {
        setError('Selecciona una fecha.');
        return;
      }
      if (scheduleMode === 'multi' && selectedDates.length === 0) {
        setError('Selecciona al menos una fecha.');
        return;
      }
      // Ir al paso de selección de chofer
      setStep(1.5);
      setBookingStep('driver');
      setError('');
      return;
    }

    if (step === 1.5) {
      // Después de seleccionar chofer, continuar al step 2
      setStep(2);
      setBookingStep('payment');
      return;
    }

    setError('');

    if (step === 2) {
      const totalPrice = formData.precioEstimado;
      if (paymentMethod === 'stripe') {
        fetchClientSecret(totalPrice);
      } else if (paymentMethod === 'cash_deposit') {
        // 30% de depósito garantía para pagos en efectivo
        fetchClientSecret(Math.round(totalPrice * 0.30));
      }
    }
    
    setStep(step + 1);
  };

  const fetchClientSecret = async (amount) => {
    try {
      const res = await fetch(`${API_URL}/create_payment_intent.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.round(amount * 100), currency: 'mxn' })
      });
      const data = await res.json();
      if (data.clientSecret) setClientSecret(data.clientSecret);
    } catch (err) {
      console.error("Error client secret:", err);
    }
  };

  const handleBooking = async (stripePaymentData = null) => {
    if (paymentStatus === 'success') return;
    setPaymentStatus('processing');
    try {
      const vehicle = getVehicleData(formData.vehicleType);
      const finalPrice = Math.round(formData.precioEstimado * vehicle.multiplier);
      
      const payload = {
        codigoUsuario: authUser.codigoUsuario,
        origen: formData.origen,
        destino: formData.destino,
        latO: coords.origin?.lat || '0',
        lngO: coords.origin?.lng || '0',
        latD: coords.destination?.lat || '0',
        lngD: coords.destination?.lng || '0',
        routeGeoJSON: routeGeoJSON,
        fechasProgramadas: scheduleMode === 'multi' && selectedDates.length > 0
          ? selectedDates.map(d => `${d} ${formData.hora}:00`)
          : [formData.fecha + ' ' + formData.hora + ':00'],
        codigoChofer: selectedDriver || '',
        precioPorViaje: finalPrice,
        montoTotal: finalPrice,
        esPagoBulk: false,
        metodoPago: paymentMethod === 'stripe' ? 'STRIPE' : paymentMethod === 'cash_deposit' ? 'EFECTIVO_DEPOSITO' : 'EFECTIVO',
        montoDeposito: paymentMethod === 'cash_deposit' ? Math.round(formData.precioEstimado * 0.30) : null,
        stripePaymentIntentId: stripePaymentData?.id || null,
        distancia: distance < 1.0 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`,
        tiempoEstimado: formData.tiempoEstimado,
        vehicleType: formData.vehicleType
      };

      const res = await fetch(`${API_URL}/create_booking.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (result.success) {
        setBookedFolio(result.folio);
        setPaymentStatus('success');
        onBookingComplete(result);
      } else {
        setPaymentStatus('error');
        setOutcomeMessage(result.message);
      }
    } catch (err) {
      setPaymentStatus('error');
    }
  };

  const getVehicleData = () => ({
    name: 'Safar Premium',
    img: comfortCar,
    multiplier: 1,
    pax: 4,
    desc: 'Sedán premium • Chofer certificado'
  });

  // StatusModal renderizado inline (evita patrón de componente anidado)
  const statusModalJSX = paymentStatus !== 'idle' ? (
    <div className={`payment-modal-overlay ${paymentStatus}`}>
      <div className="payment-modal-content">
        {paymentStatus === 'processing' && (
          <div className="status-container processing">
            <div className="elite-spinner"></div>
            <h3>Procesando...</h3>
          </div>
        )}
        {paymentStatus === 'success' && (
          <div className="status-container success">
            <div className="success-check">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <polyline points="5,14 11,21 23,8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="success-texts">
              <h3>Reserva confirmada</h3>
              <p className="success-folio">#{bookedFolio}</p>
            </div>
            <button className="success-done-btn" onClick={onCancel}>Listo</button>
          </div>
        )}
        {paymentStatus === 'error' && (
          <div className="status-container error">
            <div style={{ fontSize: '3rem' }}>❌</div>
            <h3>Error de pago</h3>
            <p>{outcomeMessage}</p>
            <button className="main-cta-btn" onClick={() => setPaymentStatus('idle')}>REINTENTAR</button>
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <div className="booking-form-container">
      {statusModalJSX}
      <div className="uber-layout-wrapper">
        {/* Map as the foundation layer */}
        <div className="uber-map-container">
          <div ref={mapRef} className="main-map"></div>
          {isRouteLoading && <div className="map-route-loading">Calculando...</div>}
          
          {/* Picking Pin - ONLY visible when picking */}
          {isPickingLocation && (
            <div className="uber-picking-pin">
              <div className="pin-body">
                <div className="pin-dot"></div>
              </div>
              <div className="pin-tip"></div>
              <div className="pin-shadow"></div>
            </div>
          )}
        </div>

        {/* UI Mode: Normal Search or Picking */}
        {!isPickingLocation ? (
          <div className={`search-header-overlay ${step > 1 ? 'minimized' : ''}`} style={ step >= 1.5 ? { display: 'none' } : {} }>
            <div className="search-header-top">
              <button className="back-btn" onClick={
                step === 3 ? () => { setStep(2); setBookingStep('payment'); } :
                step === 2 ? () => { setStep(1.5); setBookingStep('driver'); } :
                step === 1.5 ? () => { setStep(1); setBookingStep('location'); } :
                onCancel
              }>←</button>
              <h2 className="search-header-title">Reserva tu Safar</h2>
            </div>
            
            <div className="uber-inputs-container">
              <div className="inputs-connector">
                <div className="dot-origin"></div>
                <div className="line-connector"></div>
                <div className="square-destination"></div>
              </div>
              <div className="inputs-fields">
                <div className="uber-input-wrapper">
                  <div className="uber-input-row">
                    <input
                      type="text" className="uber-input" placeholder="¿Desde dónde?" value={formData.origen}
                      onChange={e => { setFormData({...formData, origen: e.target.value}); fetchSuggestions(e.target.value, 'origin'); }}
                      onFocus={() => { if(step > 1) { setStep(1); setBookingStep('location'); } }}
                    />
                    <div className="input-row-actions">
                      <button className="action-icon-btn" type="button" onClick={() => handleUseHomeAddress('origin')} title="Usar mi Hogar Registrado">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                      </button>
                      <button className="action-icon-btn" onClick={detectLocation} title="Mi ubicación" disabled={isDetecting}>
                        {isDetecting ? <span className="btn-spinner"></span> : (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="9" opacity="0.3"/></svg>
                        )}
                      </button>
                      <button className="action-icon-btn map-pin-btn" onClick={() => setIsPickingLocation('origin')} title="Elegir en mapa">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      </button>
                    </div>
                  </div>
                  {suggestions.origin.length > 0 && (
                    <div className="uber-suggestions-container">
                      {suggestions.origin.map((s, i) => (
                        <div key={i} className="uber-suggestion-item" onClick={() => selectSuggestion(s, 'origin')}>
                          <div className={`suggestion-icon suggestion-icon--${s.place_type}`}>
                            {s.place_type === 'poi' ? '🏢' : s.place_type === 'neighborhood' ? '🏘️' : '📍'}
                          </div>
                          <div className="suggestion-content">
                            <div className="suggestion-main">{s.short_name || s.display_name.split(',')[0]}</div>
                            <div className="suggestion-sub">{s.display_name.split(',').slice(1, 3).join(',').trim()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="uber-input-wrapper">
                  <div className="uber-input-row">
                    <input
                      type="text" className="uber-input" placeholder="¿A dónde vas?" value={formData.destino}
                      onChange={e => { setFormData({...formData, destino: e.target.value}); fetchSuggestions(e.target.value, 'destination'); }}
                      onFocus={() => { if(step > 1) { setStep(1); setBookingStep('location'); } }}
                    />
                    <div className="input-row-actions">
                      <button className="action-icon-btn" type="button" onClick={() => handleUseHomeAddress('destination')} title="Usar mi Hogar Registrado">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                      </button>
                      <button className="action-icon-btn map-pin-btn" onClick={() => setIsPickingLocation('destination')} title="Elegir en mapa">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      </button>
                    </div>
                  </div>
                  {suggestions.destination.length > 0 && (
                    <div className="uber-suggestions-container">
                      {suggestions.destination.map((s, i) => (
                        <div key={i} className="uber-suggestion-item" onClick={() => selectSuggestion(s, 'destination')}>
                          <div className={`suggestion-icon suggestion-icon--${s.place_type}`}>
                            {s.place_type === 'poi' ? '🏢' : s.place_type === 'neighborhood' ? '🏘️' : '📍'}
                          </div>
                          <div className="suggestion-content">
                            <div className="suggestion-main">{s.short_name || s.display_name.split(',')[0]}</div>
                            <div className="suggestion-sub">{s.display_name.split(',').slice(1, 3).join(',').trim()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {error && <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '5px' }}>{error}</div>}
          </div>
        ) : (
          /* Picking Location UI */
          <div className="uber-picking-overlay">
            <div className="picking-header">
              <button className="back-btn" onClick={() => setIsPickingLocation(null)}>←</button>
              <div className="picking-instructions">
                Establecer {isPickingLocation === 'origin' ? 'Origen' : 'Destino'}
              </div>
            </div>
            <button className="confirm-pick-btn" onClick={handleConfirmPick}>
              Confirmar ubicación
            </button>
          </div>
        )}

        {step === 1 && coords.origin && coords.destination && !isRouteLoading && !isPickingLocation && (
          <div className="uber-bottom-sheet trip-details-sheet">
            <div className="sheet-scroll-body">
              <div className="sheet-drag-handle"></div>
              <h3 className="sheet-title">¿Cuándo es tu viaje?</h3>

              {/* Tabs: Una fecha / Varios días */}
              <div className="schedule-tabs">
                <button
                  type="button"
                  className={`schedule-tab ${scheduleMode === 'once' ? 'active' : ''}`}
                  onClick={() => setScheduleMode('once')}
                >
                  Una fecha
                </button>
                <button
                  type="button"
                  className={`schedule-tab ${scheduleMode === 'multi' ? 'active' : ''}`}
                  onClick={() => setScheduleMode('multi')}
                >
                  Varios días
                </button>
              </div>

              {scheduleMode === 'once' ? (
                <div className="once-date-row">
                  <div className="trip-field">
                    <span className="trip-field-label">Fecha</span>
                    <input
                      type="date"
                      className="trip-native-input"
                      value={formData.fecha}
                      min={minDateStr}
                      onChange={e => setFormData({...formData, fecha: e.target.value})}
                    />
                  </div>
                  <div className="trip-field">
                    <span className="trip-field-label">Hora</span>
                    <input
                      type="time"
                      className="trip-native-input"
                      value={formData.hora}
                      onChange={e => setFormData({...formData, hora: e.target.value})}
                    />
                  </div>
                </div>
              ) : (
                <>
                  {/* Hora arriba del calendario para que siempre sea visible */}
                  <div className="multi-time-row">
                    <span className="trip-field-label">Hora para todas las fechas</span>
                    <input
                      type="time"
                      className="trip-native-input"
                      value={formData.hora}
                      onChange={e => setFormData({...formData, hora: e.target.value})}
                    />
                  </div>

                  <div className="multi-calendar">
                    {/* Navegación de mes */}
                    <div className="cal-nav">
                      <button type="button" className="cal-nav-btn" onClick={() => navigateCalendar(-1)}>‹</button>
                      <span className="cal-nav-title">{MONTH_NAMES[calendarView.month]} {calendarView.year}</span>
                      <button type="button" className="cal-nav-btn" onClick={() => navigateCalendar(1)}>›</button>
                    </div>
                    {/* Cabecera días */}
                    <div className="cal-weekdays">
                      {['Lu','Ma','Mi','Ju','Vi','Sa','Do'].map(d => (
                        <span key={d}>{d}</span>
                      ))}
                    </div>
                    {/* Grid de días */}
                    <div className="cal-grid">
                      {renderCalendarDays()}
                    </div>
                    {/* Chips de fechas seleccionadas */}
                    {selectedDates.length > 0 && (
                      <div className="selected-chips-wrap">
                        <div className="chips-header">
                          <span className="chips-label">Fechas seleccionadas</span>
                          <span className={`chips-count ${selectedDates.length >= MAX_DATES ? 'chips-count--max' : ''}`}>
                            {selectedDates.length}/{MAX_DATES}
                          </span>
                        </div>
                      <div className="selected-chips">
                        {selectedDates.map(d => (
                          <span key={d} className="date-chip" onClick={() => toggleDate(d)}>
                            {formatDisplayDate(d)} ✕
                          </span>
                        ))}
                      </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {error && <p className="sheet-error">{error}</p>}
            </div>

            <div className="sheet-sticky-cta">
              <button className="main-cta-btn" style={{ width: '100%' }} onClick={handleNext}>
                {scheduleMode === 'multi' && selectedDates.length > 0
                  ? `Confirmar ${selectedDates.length} fecha${selectedDates.length > 1 ? 's' : ''}`
                  : 'Confirmar Ruta'}
              </button>
            </div>
          </div>
        )}

        {/* Step 1.5: Selección de chofer */}
        {step === 1.5 && (
          <div className="uber-bottom-sheet booking-step2-sheet">
            <div className="driver-step-body">
              {/* Header con back button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <button
                  onClick={() => {
                    setStep(1);
                    setBookingStep('location');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 20,
                    cursor: 'pointer',
                    padding: 4,
                    color: '#666',
                  }}
                >
                  ←
                </button>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Selecciona tu chofer</h3>
              </div>

              {/* Fecha y hora seleccionada */}
              <div style={{ background: '#f8f8f8', borderRadius: 12, padding: 12, marginBottom: 16, fontSize: 13 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>
                  📅 {scheduleMode === 'multi' && selectedDates.length > 0
                    ? `${selectedDates.length} fechas seleccionadas`
                    : formData.fecha}
                </div>
                <div style={{ color: '#666' }}>
                  🕐 {formData.hora}
                </div>
              </div>

              {/* Componente de selección de chofer */}
              <DriverSelection
                fechaSeleccionada={
                  scheduleMode === 'multi' && selectedDates.length > 0
                    ? selectedDates[0] + ' ' + formData.hora + ':00'
                    : formData.fecha + ' ' + formData.hora + ':00'
                }
                choferPreferido={selectedDriver}
                onChoferSeleccionado={(codigo) => {
                  setSelectedDriver(codigo);
                }}
              />
            </div>

            {/* Botón continuar — sticky fuera del scroll body */}
            <div className="sheet-sticky-cta">
              <button
                className="main-cta-btn"
                style={{ width: '100%' }}
                onClick={() => {
                  setStep(2);
                  setBookingStep('payment');
                }}
                disabled={!selectedDriver}
              >
                {selectedDriver ? 'Continuar al pago' : 'Selecciona un chofer'}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="uber-bottom-sheet booking-step2-sheet">
            <div className="driver-step-body">
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <button
                  onClick={() => { setStep(1.5); setBookingStep('driver'); }}
                  style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', padding: 4, color: '#666' }}
                >←</button>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Método de pago</h3>
              </div>

              {/* Resumen del viaje */}
              <div className="trip-summary-row">
                <div className="trip-summary-stat">
                  <span className="ts-value">{distance < 1.0 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`}</span>
                  <span className="ts-label">distancia</span>
                </div>
                <div className="trip-summary-divider" />
                <div className="trip-summary-stat">
                  <span className="ts-value">{formData.tiempoEstimado}</span>
                  <span className="ts-label">tiempo est.</span>
                </div>
                <div className="trip-summary-divider" />
                <div className="trip-summary-stat">
                  <span className="ts-value">${formData.precioEstimado}.00</span>
                  <span className="ts-label">total</span>
                </div>
              </div>

              {/* Tarjeta de vehículo */}
              <div className="safar-vehicle-card">
                <div className="svc-img-wrap">
                  <img src={comfortCar} alt="Safar Premium" />
                </div>
                <div className="svc-info">
                  <div className="svc-name">Safar Premium</div>
                  <div className="svc-desc">Sedán premium • Hasta 4 pasajeros</div>
                  <div className="svc-badges">
                    <span className="svc-badge">✓ Chofer certificado</span>
                    <span className="svc-badge">✓ Reserva anticipada</span>
                  </div>
                </div>
              </div>

              {/* Método de pago */}
              <p className="payment-section-label">¿Cómo vas a pagar?</p>
              <div className="payment-methods-grid">
                <button
                  type="button"
                  className={`pm-card ${paymentMethod === 'stripe' ? 'pm-card--active' : ''}`}
                  onClick={() => { setPaymentMethod('stripe'); setClientSecret(null); }}
                >
                  <span className="pm-icon">💳</span>
                  <span className="pm-title">Tarjeta</span>
                  <span className="pm-subtitle">Pago completo ahora</span>
                </button>
                <button
                  type="button"
                  className={`pm-card ${paymentMethod === 'cash_deposit' ? 'pm-card--active' : ''}`}
                  onClick={() => { setPaymentMethod('cash_deposit'); setClientSecret(null); }}
                >
                  <span className="pm-icon">💵</span>
                  <span className="pm-title">Efectivo</span>
                  <span className="pm-subtitle">Depósito 30% + resto al chofer</span>
                </button>
              </div>

              {paymentMethod === 'cash_deposit' && (
                <div className="deposit-banner">
                  <div className="deposit-amounts">
                    <div className="deposit-item">
                      <span className="deposit-label">Depósito ahora (garantía)</span>
                      <span className="deposit-value">${Math.round(formData.precioEstimado * 0.30)}.00</span>
                    </div>
                    <div className="deposit-item">
                      <span className="deposit-label">Resto al chofer el día del viaje</span>
                      <span className="deposit-value">${formData.precioEstimado - Math.round(formData.precioEstimado * 0.30)}.00</span>
                    </div>
                  </div>
                  <p className="deposit-note">
                    El depósito asegura tu reserva. Se aplica al total del viaje y no es reembolsable si cancelas después de confirmado.
                  </p>
                </div>
              )}
            </div>

            {/* CTA sticky */}
            <div className="sheet-sticky-cta">
              <button className="main-cta-btn" style={{ width: '100%' }} onClick={handleNext} disabled={!paymentMethod}>
                Continuar
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="uber-bottom-sheet booking-step2-sheet">
            <div className="driver-step-body">
              {/* Header con back button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <button
                  onClick={() => { setStep(2); setBookingStep('payment'); }}
                  style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', padding: 4, color: '#666' }}
                >←</button>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
                  {paymentMethod === 'cash_deposit' ? 'Pagar depósito de garantía' : 'Confirmar y pagar'}
                </h3>
              </div>

              {/* Resumen de cobro */}
              <div className="confirm-price-card">
                {paymentMethod === 'cash_deposit' ? (
                  <>
                    <div className="cpc-row">
                      <span>Depósito ahora (30%)</span>
                      <strong>${Math.round(formData.precioEstimado * 0.30)}.00</strong>
                    </div>
                    <div className="cpc-row cpc-row--muted">
                      <span>Resto al chofer</span>
                      <span>${formData.precioEstimado - Math.round(formData.precioEstimado * 0.30)}.00</span>
                    </div>
                    <div className="cpc-divider" />
                    <div className="cpc-row">
                      <span>Total del viaje</span>
                      <strong>${formData.precioEstimado}.00</strong>
                    </div>
                  </>
                ) : (
                  <div className="cpc-row">
                    <span>Total</span>
                    <strong>${formData.precioEstimado}.00</strong>
                  </div>
                )}
                <div className="cpc-meta">{distance < 1.0 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`} • {formData.tiempoEstimado} • Safar Premium</div>
              </div>

              {(paymentMethod === 'stripe' || paymentMethod === 'cash_deposit') ? (
                clientSecret ? (
                  <Elements
                    stripe={stripePromise}
                    options={{ clientSecret, locale: 'es' }}
                    key={clientSecret}
                  >
                    <CheckoutForm
                      totalPrice={formData.precioEstimado}
                      paymentMethod={paymentMethod}
                      onSuccess={(pi) => {
                        setPaymentStatus('processing');
                        handleBooking(pi);
                      }}
                      onError={(msg) => {
                        setPaymentStatus('error');
                        setOutcomeMessage(msg);
                      }}
                    />
                  </Elements>
                ) : (
                  <div className="stripe-loading-skeleton">
                    <div className="skeleton-field" />
                    <div className="skeleton-row">
                      <div className="skeleton-field skeleton-field--half" />
                      <div className="skeleton-field skeleton-field--half" />
                    </div>
                    <div className="skeleton-field skeleton-field--short" />
                    <div className="skeleton-btn" />
                  </div>
                )
              ) : (
                <button className="main-cta-btn" style={{ width: '100%', marginTop: '1rem' }} onClick={() => handleBooking()}>
                  Reservar Ahora
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingForm;
