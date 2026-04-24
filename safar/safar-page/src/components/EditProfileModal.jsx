import React, { useState, useRef, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { API_URL } from '../config';
import './EditProfileModal.css';

// Fix for Leaflet default icons path
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const API_BASE = API_URL;
const MAPBOX_TOKEN = 'pk.eyJ1Ijoiam9zaHZlbGEiLCJhIjoiY21uOTBleGFyMDNvODJ3cTE1MDU3ZWdmYSJ9.JEARY1ndg_yCWaLsVMIWkQ';

// Bounding box for Ciudad Juárez
const CJ_BBOX = '-106.65,31.55,-106.20,31.87';
const CJ_PROXIMITY = '-106.4245,31.6904';

const EditProfileModal = ({ authUser, onClose, onSaved }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');

  // Fields
  const [telefono, setTelefono]         = useState('');
  const [calle, setCalle]               = useState('');
  const [numExterior, setNumExterior]   = useState('');
  const [colonia, setColonia]           = useState('');
  const [ciudad, setCiudad]             = useState('');
  const [estado, setEstado]             = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');

  // Map states
  const [mapLat, setMapLat] = useState(null);
  const [mapLon, setMapLon] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const mapContainerRef = useRef(null);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);
  const geocodeTimeout = useRef(null);
  const skipNextGeocodeRef = useRef(false);
  const userHasEditedAddressRef = useRef(false);

  // Photos
  const [fotoFile, setFotoFile]       = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [fotoIneFile, setFotoIneFile]       = useState(null);
  const [fotoInePreview, setFotoInePreview] = useState(null);

  const [isFetchingCP, setIsFetchingCP] = useState(false);
  const [coloniaOptions, setColoniaOptions] = useState([]);
  const [coloniaData, setColoniaData] = useState({}); // Stores { name: { lat, lon } }
  const [autofilledFields, setAutofilledFields] = useState([]);

  const [lada, setLada]         = useState('+52');
  const [streetSuggestions, setStreetSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeout = useRef(null);

  const fotoRef    = useRef();
  const fotoIneRef = useRef();

  // Fetch current profile on mount
  useEffect(() => {
    const load = async () => {
      try {
        const res  = await fetch(`${API_BASE}/get_profile.php?codigoUsuario=${authUser.codigoUsuario}`);
        const data = await res.json();
        if (data.success) {
          const p = data.profile;
          
          // Campos básicos (soporte para diferentes casings)
          const findVal = (key) => p[key] || p[key.toLowerCase()] || p[key.toUpperCase()] || '';
          setTelefono(formatPhone(findVal('Telefono')));
          setCalle(findVal('Calle'));
          setNumExterior(findVal('NumExterior'));
          setColonia(findVal('Colonia'));
          setCiudad(findVal('Ciudad'));
          setEstado(findVal('Estado'));
          setCodigoPostal(findVal('CodigoPostal'));

          // Debug coordenadas:
          console.log("[Mapa Inicial] Intentando cargar coords desde BD:", p);
          
          let latDb = p.Latitud ?? p.latitud ?? p.LATITUD;
          let lonDb = p.Longitud ?? p.longitud ?? p.LONGITUD;
          
          const lat = parseFloat(latDb);
          const lon = parseFloat(lonDb);
          
          console.log("[Mapa Inicial] Latitud y Longitud parseadas:", { lat, lon });

          if (!isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0) {
            console.log("[Mapa Inicial] Coordenadas válidas. Activando mapa.");
            setMapLat(lat);
            setMapLon(lon);
            setShowMap(true);
          } else {
            console.log("[Mapa Inicial] Coordenadas inválidas o en cero desde BD.");
          }

          if (p.Telefono) {
            // Si el teléfono empieza con '+', intentar separar LADA del resto
            if (p.Telefono.startsWith('+')) {
              // Intento de detección inteligente de LADA
              if (p.Telefono.startsWith('+52')) {
                setLada('+52');
                setTelefono(p.Telefono.slice(3).replace(/\D/g, '').slice(0, 10));
              } else if (p.Telefono.startsWith('+1')) {
                setLada('+1');
                setTelefono(p.Telefono.slice(2).replace(/\D/g, '').slice(0, 10));
              } else {
                // Caso genérico: tomamos los primeros 3 caracteres como LADA aprox o mejor dejamos el default
                setTelefono(formatPhone(p.Telefono.replace(/\D/g, '').slice(-10)));
              }
            } else {
              setTelefono(formatPhone(p.Telefono.replace(/\D/g, '').slice(0, 10)));
            }
          }
          if (p.UrlFoto) setFotoPreview(`${API_BASE}/${p.UrlFoto}`);
          if (p.UrlINE)  setFotoInePreview(`${API_BASE}/${p.UrlINE}`);
        }
      } catch {
        setError('No se pudo cargar el perfil.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [authUser.codigoUsuario]);

  // Fetch address based on CP
  useEffect(() => {
    if (codigoPostal.length === 5 && !loading) {
      const fetchAddress = async () => {
        setIsFetchingCP(true);
        setColoniaOptions([]); // Reset options
        setColoniaData({});
        try {
          // Usar OpenDataSoft con el dataset de Geonames (limit=100 para obtener todas las colonias)
          const url = `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/geonames-postal-code/records?where=postal_code%3D'${codigoPostal}'%20and%20country_code%3D'MX'&limit=100`;
          const res = await fetch(url);
          const data = await res.json();
          
          if (data && data.results && data.results.length > 0) {
            const results = data.results;
            
            // Extraer colonias únicas y sus coordenadas
            const uniqueColonias = [...new Set(results.map(r => r.place_name))].sort();
            const colMapping = {};
            results.forEach(r => {
              colMapping[r.place_name] = { lat: r.latitude, lon: r.longitude };
            });
            setColoniaData(colMapping);
            
            // Si es Juárez, lo normalizamos como "Ciudad Juárez"
            let municip = results[0].admin_name2 || '';
            if (municip.toLowerCase().includes('juarez')) municip = 'Ciudad Juárez';
            
            setCiudad(municip);
            setEstado(results[0].admin_name1 || '');
            
            if (uniqueColonias.length > 1) {
              setColoniaOptions(uniqueColonias);
              if (!uniqueColonias.includes(colonia)) {
                // setColonia(''); 
              }
            } else {
              setColonia(uniqueColonias[0] || '');
              setColoniaOptions([]);
            }
            
            setAutofilledFields(['colonia', 'ciudad', 'estado']);
            setTimeout(() => setAutofilledFields([]), 3000);
          } else {
            // Reintento con Zippopotam si falla el principal
            const zipRes = await fetch(`https://api.zippopotam.us/mx/${codigoPostal}`);
            const zipData = await zipRes.json();
            if (zipData && zipData.places && zipData.places.length > 0) {
              const places = zipData.places;
              const uniqueColonias = [...new Set(places.map(p => p['place name']))].sort();
              
              const colMapping = {};
              places.forEach(p => {
                colMapping[p['place name']] = { lat: parseFloat(p.latitude), lon: parseFloat(p.longitude) };
              });
              setColoniaData(colMapping);

              const p = places[0];
              setCiudad(p['place name'] || '');
              setEstado(p['state'] || '');
              
              if (uniqueColonias.length > 1) {
                setColoniaOptions(uniqueColonias);
              } else {
                setColonia(uniqueColonias[0] || '');
                setColoniaOptions([]);
              }
              
              setAutofilledFields(['ciudad', 'estado']);
              setTimeout(() => setAutofilledFields([]), 3000);
            }
          }
        } catch (err) {
          console.error("Error fetching CP:", err);
        } finally {
          setIsFetchingCP(false);
        }
      };
      fetchAddress();
    }
  }, [codigoPostal, loading]);

  // (Overpass street logic remota removida en favor del Autocompletado de Mapbox nativo)

  const STREET_PREFIX_RE = /^(calle|av(enida)?\.?|blvd?\.?|boulevard|privada|priv\.?|callejón|callejon|circuito|paseo|periférico|periferico|carretera|camino|prolongación|prolongacion|retorno|andador)\s/i;

  const fetchStreetSuggestions = (query) => {
    if (query.length < 3) { setStreetSuggestions([]); return; }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      try {
        const coords = coloniaData[colonia];
        const proximity = (coords?.lon && coords?.lat) ? `${coords.lon},${coords.lat}` : CJ_PROXIMITY;
        const params = `access_token=${MAPBOX_TOKEN}&proximity=${proximity}&bbox=${CJ_BBOX}&country=mx&language=es&types=address&limit=5&autocomplete=true`;
        const hasPrefix = STREET_PREFIX_RE.test(query.trim());
        const queries = hasPrefix
          ? [`${query}, ${ciudad}`]
          : [`${query}, ${ciudad}`, `calle ${query}, ${ciudad}`];
        const results = await Promise.all(
          queries.map(q =>
            fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?${params}`)
              .then(r => r.json()).then(d => d?.features || []).catch(() => [])
          )
        );
        const seen = new Set();
        const merged = results.flat().filter(f => {
          if (seen.has(f.place_name)) return false;
          seen.add(f.place_name);
          return true;
        }).slice(0, 6);
        if (merged.length > 0) { setStreetSuggestions(merged); setShowSuggestions(true); }
      } catch (err) {
        console.error("Error fetching street suggestions:", err);
      }
    }, 400);
  };

  // Real-time Geocoding and Map logic
  useEffect(() => {
    // Solo geocodificamos en tiempo real si el usuario está activamente editando algún campo manual
    if (!userHasEditedAddressRef.current) {
      return;
    }

    let isMounted = true;

    if (skipNextGeocodeRef.current) {
      console.log("[Mapa] Ignorando búsqueda en tiempo real porque se acaba de seleccionar una sugerencia.");
      skipNextGeocodeRef.current = false;
      return;
    }

    if (!calle.trim()) return; // no geocodificar sin calle
    const addressStr = [calle, colonia, ciudad, estado, codigoPostal].filter(Boolean).join(' ');
    if (addressStr.length < 5) return;

    if (geocodeTimeout.current) clearTimeout(geocodeTimeout.current);
    geocodeTimeout.current = setTimeout(async () => {
      try {
        const queryParts = [calle, numExterior, colonia, ciudad, estado, codigoPostal, "México"].filter(Boolean);
        const fullAddress = queryParts.join(', ');
        
        console.log("[Mapa] Intentando Mapbox con fullAddress:", fullAddress);
        const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(fullAddress)}.json?access_token=${MAPBOX_TOKEN}&limit=1&bbox=${CJ_BBOX}`;
        const geoRes = await fetch(geocodeUrl);
        const geoData = await geoRes.json();
        
        // Si el usuario escribió otra cosa o eligió una sugerencia mientras cargaba el fetch, anulamos esto.
        if (!isMounted) {
          console.log("[Mapa] Petición terminada, pero anulada porque el componente se actualizó antes.");
          return;
        }

        console.log("[Mapa] Respuesta de Mapbox:", geoData);

        if (geoData?.features?.length > 0) {
          const feature = geoData.features[0];
          const isPrecise = feature.place_type?.includes('address') || feature.place_type?.includes('poi') || feature.place_type?.includes('neighborhood');
          console.log("[Mapa] Mapbox Feature Tipo:", feature.place_type, "| Relevancia:", feature.relevance);

          const coords = coloniaData[colonia];
          
          if (!isPrecise && coords && coords.lat && coords.lon) {
            console.log("[Mapa] Mapbox devolvió un punto genérico. Usando Fallback de la colonia:", coords);
            setMapLat(coords.lat);
            setMapLon(coords.lon);
            setShowMap(true);
          } else {
            const [lon, lat] = feature.center;
            console.log("[Mapa] Éxito en Mapbox. Lat:", lat, "Lon:", lon);
            setMapLat(lat);
            setMapLon(lon);
            setShowMap(true);
          }
        } else {
          console.log("[Mapa] Mapbox no encontró resultados para esta dirección. Intentando Fallback a Colonia...");
          const coords = coloniaData[colonia];
          if (coords && coords.lat && coords.lon) {
            console.log("[Mapa] Fallback exitoso. Coordenadas de la colonia:", coords);
            setMapLat(coords.lat);
            setMapLon(coords.lon);
            setShowMap(true);
          } else {
            console.log("[Mapa] Fallback fallido. No hay coordenadas para la colonia:", colonia, coloniaData);
          }
        }
      } catch (e) {
        if (isMounted) console.error("[Mapa] Error catastrófico en geocoding real-time:", e);
      }
    }, 1000);

    return () => {
      isMounted = false;
      clearTimeout(geocodeTimeout.current);
    };
  }, [calle, numExterior, colonia, ciudad, codigoPostal, estado, coloniaData]);

  // Leaflet initialization and updates
  useEffect(() => {
    if (!showMap || !mapContainerRef.current) return;

    if (!mapInstance.current) {
      mapInstance.current = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView([mapLat || 31.69, mapLon || -106.42], 16);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance.current);

      markerInstance.current = L.marker([mapLat || 31.69, mapLon || -106.42], {
        draggable: true
      }).addTo(mapInstance.current);

      markerInstance.current.on('dragend', (e) => {
        const { lat, lng } = e.target.getLatLng();
        setMapLat(lat);
        setMapLon(lng);
      });

      // Asegurar que el mapa calcule su contenedor cuando se muestra por primera vez
      setTimeout(() => mapInstance.current.invalidateSize(), 300);
    } else {
      const latlng = [mapLat, mapLon];
      markerInstance.current.setLatLng(latlng);
      mapInstance.current.panTo(latlng);
    }
  }, [showMap, mapLat, mapLon]);

  const handleSelectStreet = (feature) => {
    const mainText = feature.text;
    const fullText = feature.place_name;
    
    // Al seleccionar una sugerencia, Mapbox YA nos da las coordenadas hiperprecisas.
    if (feature.center && feature.center.length === 2) {
      const [lon, lat] = feature.center;
      console.log("[Mapa] Calle seleccionada de sugerencias. Usando coordenadas exactas:", lat, lon);
      setMapLat(lat);
      setMapLon(lon);
      setShowMap(true);
      skipNextGeocodeRef.current = true; // Evitar que el useEffect re-geocodifique esto y lo arruine
    }

    setCalle(mainText);
    
    // Intentar extraer el CP si viene en el contexto
    const cpContext = feature.context?.find(c => c.id.startsWith('postcode'));
    if (cpContext) {
      setCodigoPostal(cpContext.text);
    }
    
    setStreetSuggestions([]);
    setShowSuggestions(false);
  };

  const formatPhone = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 10);
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (!match) return cleaned;
    const parts = [match[1], match[2], match[3]].filter(Boolean);
    return parts.join('-');
  };

  const handleTelefonoChange = (value) => {
    setTelefono(formatPhone(value));
  };

  const handleFileChange = (e, setFile, setPreview) => {
    const file = e.target.files[0];
    if (!file) return;
    setFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!telefono.trim() || !calle.trim() || !colonia.trim() || !ciudad.trim() || !estado.trim() || !codigoPostal.trim()) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    if (!/^\d{5}$/.test(codigoPostal.trim())) {
      setError('El código postal debe tener 5 dígitos.');
      return;
    }

    setSaving(true);

    // 1. Geocodificación Automática
    let finalLat = mapLat;
    let finalLon = mapLon;

    // Si por alguna razón el mapa no arrojó coordenadas, intentamos geocodificar
    if (!finalLat || !finalLon) {
      try {
        const fullAddress = `${calle} ${numExterior}, ${colonia}, ${ciudad}, ${estado}, ${codigoPostal}, Mexico`;
        const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(fullAddress)}.json?access_token=${MAPBOX_TOKEN}&limit=1&bbox=${CJ_BBOX}`;
        const geoRes = await fetch(geocodeUrl);
        const geoData = await geoRes.json();

        if (geoData && geoData.features && geoData.features.length > 0) {
          [finalLon, finalLat] = geoData.features[0].center;
        } else {
          // Fallback final: coordenadas de la colonia
          const coords = coloniaData[colonia];
          if (coords) {
            finalLat = coords.lat;
            finalLon = coords.lon;
          }
        }
      } catch (e) {
        console.warn("Geocodificación fallida, se procederá sin coordenadas exactas:", e);
      }
    }

    const formData = new FormData();
    formData.append('codigoUsuario', authUser.codigoUsuario);
    formData.append('telefono',     `${lada}${telefono.replace(/\D/g, '')}`);
    formData.append('calle',        calle.trim());
    formData.append('numExterior', numExterior.trim());
    formData.append('colonia',     colonia.trim());
    formData.append('ciudad',      ciudad.trim());
    formData.append('estado',      estado.trim());
    formData.append('codigoPostal',codigoPostal.trim());
    if (finalLat) formData.append('latitud', finalLat);
    if (finalLon) formData.append('longitud', finalLon);
    
    if (fotoFile)    formData.append('foto',    fotoFile);
    if (fotoIneFile) formData.append('fotoIne', fotoIneFile);

    try {
      const res  = await fetch(`${API_BASE}/profile_setup.php`, { method: 'POST', body: formData });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = null; }

      if (data && data.success) {
        setSuccess('Perfil actualizado correctamente.');
        if (onSaved) onSaved();
        setTimeout(onClose, 1200);
      } else {
        setError((data && data.message) || 'Error al guardar.');
      }
    } catch {
      setError('Error de conexión.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="epm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="epm-sheet">
        {/* Handle bar */}
        <div className="epm-handle" />

        {/* Header */}
        <div className="epm-header">
          <h2 className="epm-title">Editar Perfil</h2>
          <button className="epm-close-btn" onClick={onClose} aria-label="Cerrar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="epm-loading">
            <div className="epm-spinner" />
          </div>
        ) : (
          <form className="epm-form" onSubmit={handleSubmit}>
            {error   && <div className="epm-error">{error}</div>}
            {success && <div className="epm-success">{success}</div>}

            {/* Photos Section */}
            <div className="epm-photos-row">
              {/* Profile photo block */}
              <div className="epm-photo-block">
                <div
                  className="epm-avatar-upload"
                  style={fotoPreview ? { backgroundImage: `url(${fotoPreview})` } : {}}
                  onClick={() => fotoRef.current.click()}
                >
                  {!fotoPreview && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="epm-avatar-icon">
                      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.58-7 8-7s8 3 8 7"/>
                    </svg>
                  )}
                  <div className="epm-photo-badge">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                      <path d="M12 15.2A3.2 3.2 0 1 0 12 8.8a3.2 3.2 0 0 0 0 6.4zm7-10.2h-1.38l-1-2H7.38l-1 2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z"/>
                    </svg>
                  </div>
                </div>
                <h3 className="epm-user-name">{authUser?.nombre}</h3>
                <input ref={fotoRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display:'none' }}
                  onChange={e => handleFileChange(e, setFotoFile, setFotoPreview)} />
              </div>

              {/* INE section */}
              <div className="epm-photo-block epm-photo-block--ine">
                <div className="epm-section-label" style={{alignSelf: 'flex-start', marginBottom: '8px'}}>Identificación Oficial (INE)</div>
                <div
                  className="epm-ine-upload"
                  style={fotoInePreview ? { backgroundImage: `url(${fotoInePreview})` } : {}}
                  onClick={() => fotoIneRef.current.click()}
                >
                  {!fotoInePreview && (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
                        <rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="11" r="2"/>
                        <path d="M14 11h4M14 14h2"/>
                      </svg>
                      <span className="epm-ine-hint">Capturar INE</span>
                    </>
                  )}
                  <div className="epm-photo-badge">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                      <path d="M12 15.2A3.2 3.2 0 1 0 12 8.8a3.2 3.2 0 0 0 0 6.4zm7-10.2h-1.38l-1-2H7.38l-1 2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z"/>
                    </svg>
                  </div>
                </div>
                <input ref={fotoIneRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display:'none' }}
                  onChange={e => handleFileChange(e, setFotoIneFile, setFotoInePreview)} />
              </div>
            </div>

            {/* Divider */}
            <div className="epm-section-label">Contacto</div>

            <div className="epm-field">
              <label>Teléfono</label>
              <div className="epm-phone-input-wrapper">
                <select 
                  className="epm-phone-lada-select" 
                  value={lada} 
                  onChange={e => setLada(e.target.value)}
                >
                  <option value="+52">🇲🇽 +52</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+1">🇨🇦 +1</option>
                  <option value="+57">🇨🇴 +57</option>
                  <option value="+54">🇦🇷 +54</option>
                  <option value="+34">🇪🇸 +34</option>
                  <option value="+56">🇨🇱 +56</option>
                </select>
                <input 
                  type="tel" 
                  value={telefono} 
                  onChange={e => handleTelefonoChange(e.target.value)} 
                  placeholder="656-123-4567" 
                  maxLength={12}
                />
              </div>
            </div>

            <div className="epm-section-label">Dirección</div>

            <div className="epm-row">
              <div className="epm-field epm-field--grow">
                <label>Calle</label>
                <div className="epm-street-wrapper">
                  <input 
                    type="text" 
                    value={calle} 
                    onChange={e => { 
                      userHasEditedAddressRef.current = true;
                      setCalle(e.target.value); 
                      fetchStreetSuggestions(e.target.value);
                    }} 
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onFocus={() => { if(streetSuggestions.length > 0) setShowSuggestions(true); }}
                    placeholder={colonia ? `Buscar en ${colonia}...` : "Av. Juárez"} 
                    autoComplete="off"
                  />
                  {colonia && !showSuggestions && calle.length >= 3 && (
                    <span className="epm-field-hint epm-field-hint--street">Comienza a escribir para ver sugerencias</span>
                  )}
                  {showSuggestions && streetSuggestions.length > 0 && (
                    <div className="epm-suggestions-list">
                      {streetSuggestions.map((f) => (
                        <div 
                          key={f.id} 
                          className="epm-suggestion-item"
                          onClick={() => handleSelectStreet(f)}
                        >
                          <span className="epm-sugg-main">{f.text}</span>
                          <span className="epm-sugg-sub">{f.place_name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="epm-field epm-field--sm">
                <label>Núm. Ext.</label>
                <input type="text" value={numExterior} onChange={e => { userHasEditedAddressRef.current = true; setNumExterior(e.target.value); }} placeholder="123" />
              </div>
            </div>

            <div className="epm-field">
              <label>Colonia</label>
              <div className="epm-colonia-wrapper">
                {coloniaOptions.length > 0 ? (
                  <select 
                    value={colonia} 
                    onChange={e => {
                      userHasEditedAddressRef.current = true;
                      if (e.target.value === "MANUAL_INPUT") {
                        setColoniaOptions([]);
                        setColonia('');
                      } else {
                        setColonia(e.target.value);
                        const coords = coloniaData[e.target.value];
                        if (coords?.lat && coords?.lon) { setMapLat(coords.lat); setMapLon(coords.lon); setShowMap(true); skipNextGeocodeRef.current = true; }
                      }
                    }}
                    className={`epm-select ${autofilledFields.includes('colonia') ? 'is-autofilled' : ''}`}
                  >
                    <option value="" disabled>Selecciona una colonia...</option>
                    {coloniaOptions.map((opt, idx) => (
                      <option key={idx} value={opt}>{opt}</option>
                    ))}
                    <option value="MANUAL_INPUT" style={{ fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      + Escribir manualmente...
                    </option>
                  </select>
                ) : (
                  <input 
                    type="text" 
                    value={colonia} 
                    className={autofilledFields.includes('colonia') ? 'is-autofilled' : ''}
                    onChange={e => { userHasEditedAddressRef.current = true; setColonia(e.target.value); }} 
                    placeholder="Centro" 
                  />
                )}
                {coloniaOptions.length > 1 && (
                  <span className="epm-field-hint">Se encontraron varias colonias para este CP</span>
                )}
              </div>
            </div>

            <div className="epm-row">
              <div className="epm-field epm-field--grow">
                <label>Ciudad / Municipio</label>
                <input 
                  type="text" 
                  value={ciudad} 
                  className={autofilledFields.includes('ciudad') ? 'is-autofilled' : ''}
                  onChange={e => { userHasEditedAddressRef.current = true; setCiudad(e.target.value); }} 
                  placeholder="Juárez" 
                />
              </div>
              <div className="epm-field epm-field--sm">
                <label>C.P. {isFetchingCP && "..."}</label>
                <input type="text" value={codigoPostal} maxLength={5}
                  onChange={e => { userHasEditedAddressRef.current = true; setCodigoPostal(e.target.value.replace(/\D/g, '')); }} placeholder="32000" />
              </div>
            </div>

            <div className="epm-field">
              <label>Estado</label>
              <input 
                type="text" 
                value={estado} 
                className={autofilledFields.includes('estado') ? 'is-autofilled' : ''}
                onChange={e => { userHasEditedAddressRef.current = true; setEstado(e.target.value); }} 
                placeholder="Chihuahua" 
              />
            </div>
            
            {showMap && (
              <div className="epm-map-section">
                <div className="epm-section-label">Ubicación Precisa (Arrastra el pin si es necesario)</div>
                <div className="epm-map-container" ref={mapContainerRef}></div>
              </div>
            )}

            <button type="submit" className="epm-save-btn" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditProfileModal;
