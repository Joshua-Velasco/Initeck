import React, { useState, useRef, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { API_URL } from '../config';
import './ProfileSetup.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MAPBOX_TOKEN = 'pk.eyJ1Ijoiam9zaHZlbGEiLCJhIjoiY21uOTBleGFyMDNvODJ3cTE1MDU3ZWdmYSJ9.JEARY1ndg_yCWaLsVMIWkQ';
const CJ_BBOX = '-106.65,31.55,-106.20,31.87';
const CJ_PROXIMITY = '-106.4245,31.6904';

const SETUP_API_URL = `${API_URL}/profile_setup.php`;

const COUNTRIES = [
  { code: '+52',  flag: '🇲🇽', name: 'México',           maxDigits: 10 },
  { code: '+1',   flag: '🇺🇸', name: 'EE.UU. / Canadá', maxDigits: 10 },
  { code: '+34',  flag: '🇪🇸', name: 'España',           maxDigits: 9  },
  { code: '+54',  flag: '🇦🇷', name: 'Argentina',        maxDigits: 10 },
  { code: '+57',  flag: '🇨🇴', name: 'Colombia',         maxDigits: 10 },
  { code: '+56',  flag: '🇨🇱', name: 'Chile',            maxDigits: 9  },
  { code: '+51',  flag: '🇵🇪', name: 'Perú',             maxDigits: 9  },
  { code: '+58',  flag: '🇻🇪', name: 'Venezuela',        maxDigits: 10 },
  { code: '+55',  flag: '🇧🇷', name: 'Brasil',           maxDigits: 11 },
  { code: '+593', flag: '🇪🇨', name: 'Ecuador',          maxDigits: 9  },
  { code: '+502', flag: '🇬🇹', name: 'Guatemala',        maxDigits: 8  },
  { code: '+503', flag: '🇸🇻', name: 'El Salvador',      maxDigits: 8  },
  { code: '+504', flag: '🇭🇳', name: 'Honduras',         maxDigits: 8  },
  { code: '+505', flag: '🇳🇮', name: 'Nicaragua',        maxDigits: 8  },
  { code: '+506', flag: '🇨🇷', name: 'Costa Rica',       maxDigits: 8  },
  { code: '+507', flag: '🇵🇦', name: 'Panamá',           maxDigits: 8  },
];

const formatPhone = (digits) => {
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
};

const STEPS = [
  { id: 1, label: 'Datos Personales' },
  { id: 2, label: 'Identificación' },
  { id: 3, label: 'Dirección' },
];

const ProfileSetup = ({ revealRef, authUser, setAuthUser, setActiveView }) => {
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Step 1
  const [countryCode, setCountryCode] = useState('+52');
  const [telefono, setTelefono] = useState('');
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const fotoRef = useRef();

  // Step 2
  const [fotoIne, setFotoIne] = useState(null);
  const [fotoInePreview, setFotoInePreview] = useState(null);
  const fotoIneRef = useRef();

  // Step 3
  const [calle, setCalle] = useState('');
  const [numExterior, setNumExterior] = useState('');
  const [colonia, setColonia] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [estado, setEstado] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');

  // Map & address intelligence
  const [mapLat, setMapLat] = useState(null);
  const [mapLon, setMapLon] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [isFetchingCP, setIsFetchingCP] = useState(false);
  const [coloniaOptions, setColoniaOptions] = useState([]);
  const [coloniaData, setColoniaData] = useState({});
  const [autofilledFields, setAutofilledFields] = useState([]);
  const [streetSuggestions, setStreetSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const mapContainerRef = useRef(null);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);
  const geocodeTimeout = useRef(null);
  const skipNextGeocodeRef = useRef(false);
  const userHasEditedAddressRef = useRef(false);
  const searchTimeout = useRef(null);

  // Auto-fill address from CP
  useEffect(() => {
    if (codigoPostal.length !== 5) return;
    const fetchAddress = async () => {
      setIsFetchingCP(true);
      setColoniaOptions([]);
      setColoniaData({});
      try {
        const url = `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/geonames-postal-code/records?where=postal_code%3D'${codigoPostal}'%20and%20country_code%3D'MX'&limit=100`;
        const res = await fetch(url);
        const data = await res.json();
        if (data?.results?.length > 0) {
          const results = data.results;
          const uniqueColonias = [...new Set(results.map(r => r.place_name))].sort();
          const colMapping = {};
          results.forEach(r => { colMapping[r.place_name] = { lat: r.latitude, lon: r.longitude }; });
          setColoniaData(colMapping);
          let municip = results[0].admin_name2 || '';
          if (municip.toLowerCase().includes('juarez')) municip = 'Ciudad Juárez';
          setCiudad(municip);
          setEstado(results[0].admin_name1 || '');
          if (uniqueColonias.length > 1) {
            setColoniaOptions(uniqueColonias);
          } else {
            setColonia(uniqueColonias[0] || '');
            setColoniaOptions([]);
          }
          setAutofilledFields(['colonia', 'ciudad', 'estado']);
          setTimeout(() => setAutofilledFields([]), 3000);
        }
      } catch (e) {
        console.error('Error fetching CP:', e);
      } finally {
        setIsFetchingCP(false);
      }
    };
    fetchAddress();
  }, [codigoPostal]);

  // Real-time geocoding — solo cuando hay calle ingresada
  useEffect(() => {
    if (!userHasEditedAddressRef.current) return;
    if (skipNextGeocodeRef.current) { skipNextGeocodeRef.current = false; return; }
    if (!calle.trim()) return; // no geocodificar sin calle
    const addressStr = [calle, colonia, ciudad, estado, codigoPostal].filter(Boolean).join(' ');
    if (addressStr.length < 5) return;
    let isMounted = true;
    if (geocodeTimeout.current) clearTimeout(geocodeTimeout.current);
    geocodeTimeout.current = setTimeout(async () => {
      try {
        const fullAddress = [calle, numExterior, colonia, ciudad, estado, codigoPostal, 'México'].filter(Boolean).join(', ');
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(fullAddress)}.json?access_token=${MAPBOX_TOKEN}&limit=1&bbox=${CJ_BBOX}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!isMounted) return;
        if (data?.features?.length > 0) {
          const [lon, lat] = data.features[0].center;
          setMapLat(lat); setMapLon(lon); setShowMap(true);
        } else {
          const coords = coloniaData[colonia];
          if (coords) { setMapLat(coords.lat); setMapLon(coords.lon); setShowMap(true); }
        }
      } catch (e) { console.error('Geocoding error:', e); }
    }, 1000);
    return () => { isMounted = false; clearTimeout(geocodeTimeout.current); };
  }, [calle, numExterior, colonia, ciudad, codigoPostal, estado, coloniaData]);

  // Leaflet map init & update
  useEffect(() => {
    if (!showMap || !mapContainerRef.current) return;
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapContainerRef.current, { zoomControl: true, attributionControl: false })
        .setView([mapLat, mapLon], 16);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance.current);
      markerInstance.current = L.marker([mapLat, mapLon], { draggable: true }).addTo(mapInstance.current);
      markerInstance.current.on('dragend', e => {
        const { lat, lng } = e.target.getLatLng();
        setMapLat(lat); setMapLon(lng);
      });
      setTimeout(() => mapInstance.current.invalidateSize(), 300);
    } else {
      markerInstance.current.setLatLng([mapLat, mapLon]);
      mapInstance.current.panTo([mapLat, mapLon]);
    }
  }, [showMap, mapLat, mapLon]);

  const STREET_PREFIX_RE = /^(calle|av(enida)?\.?|blvd?\.?|boulevard|privada|priv\.?|callejón|callejon|circuito|paseo|periférico|periferico|carretera|camino|prolongación|prolongacion|retorno|andador)\s/i;

  const fetchStreetSuggestions = (query) => {
    if (query.length < 3) { setStreetSuggestions([]); return; }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      try {
        const coords = coloniaData[colonia];
        const proximity = coords ? `${coords.lon},${coords.lat}` : CJ_PROXIMITY;
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
      } catch (e) { console.error('Street suggestions error:', e); }
    }, 400);
  };

  const handleSelectStreet = (feature) => {
    if (feature.center?.length === 2) {
      const [lon, lat] = feature.center;
      setMapLat(lat); setMapLon(lon); setShowMap(true);
      skipNextGeocodeRef.current = true;
    }
    setCalle(feature.text);
    const cpContext = feature.context?.find(c => c.id.startsWith('postcode'));
    if (cpContext) setCodigoPostal(cpContext.text);
    setStreetSuggestions([]); setShowSuggestions(false);
  };

  const handleFileChange = (e, setFile, setPreview) => {
    const file = e.target.files[0];
    if (!file) return;
    setFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '');
    const country = COUNTRIES.find(c => c.code === countryCode);
    const trimmed = digits.slice(0, country ? country.maxDigits : 10);
    setTelefono(formatPhone(trimmed));
  };

  const validateStep1 = () => {
    const digits = telefono.replace(/\D/g, '');
    const country = COUNTRIES.find(c => c.code === countryCode);
    const maxDigits = country ? country.maxDigits : 10;
    if (!digits) return 'El teléfono es obligatorio.';
    if (digits.length < maxDigits) return `El número debe tener ${maxDigits} dígitos.`;
    if (!foto) return 'La foto de perfil es obligatoria.';
    return null;
  };

  const validateStep2 = () => {
    if (!fotoIne) return 'La foto del INE es obligatoria.';
    return null;
  };

  const validateStep3 = () => {
    if (!calle.trim()) return 'La calle es obligatoria.';
    if (!numExterior.trim()) return 'El número exterior es obligatorio.';
    if (!colonia.trim()) return 'La colonia es obligatoria.';
    if (!ciudad.trim()) return 'La ciudad es obligatoria.';
    if (!estado.trim()) return 'El estado es obligatorio.';
    if (!codigoPostal.trim()) return 'El código postal es obligatorio.';
    if (!/^\d{5}$/.test(codigoPostal.trim())) return 'El código postal debe tener 5 dígitos.';
    return null;
  };

  const handleNextStep = () => {
    setError('');
    let err = null;
    if (step === 1) err = validateStep1();
    if (step === 2) err = validateStep2();
    if (err) { setError(err); return; }
    setStep(s => s + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const err = validateStep3();
    if (err) { setError(err); return; }

    setIsLoading(true);

    let finalLat = mapLat;
    let finalLon = mapLon;
    if (!finalLat || !finalLon) {
      try {
        const fullAddress = [calle, numExterior, colonia, ciudad, estado, codigoPostal, 'México'].filter(Boolean).join(', ');
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(fullAddress)}.json?access_token=${MAPBOX_TOKEN}&limit=1&bbox=${CJ_BBOX}`;
        const geoRes = await fetch(url);
        const geoData = await geoRes.json();
        if (geoData?.features?.length > 0) {
          [finalLon, finalLat] = geoData.features[0].center;
        } else {
          const coords = coloniaData[colonia];
          if (coords) { finalLat = coords.lat; finalLon = coords.lon; }
        }
      } catch (e) { console.warn('Geocoding fallido al guardar:', e); }
    }

    const formData = new FormData();
    formData.append('codigoUsuario', authUser.codigoUsuario);
    formData.append('telefono', `${countryCode} ${telefono.trim()}`);
    if (finalLat) formData.append('latitud', finalLat);
    if (finalLon) formData.append('longitud', finalLon);
    formData.append('foto', foto);
    formData.append('fotoIne', fotoIne);
    formData.append('calle', calle.trim());
    formData.append('numExterior', numExterior.trim());
    formData.append('colonia', colonia.trim());
    formData.append('ciudad', ciudad.trim());
    formData.append('estado', estado.trim());
    formData.append('codigoPostal', codigoPostal.trim());

    try {
      const res = await fetch(SETUP_API_URL, { method: 'POST', body: formData });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = null; }

      if (data && data.success) {
        setAuthUser({ ...authUser, perfilCompleto: true });
        setActiveView('dashboard');
      } else {
        setError((data && data.message) || 'Error al guardar el perfil.');
      }
    } catch {
      setError('Error de conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="profile-setup-container">
      <div className="profile-setup-bg-glow"></div>

      <div ref={revealRef} className="reveal profile-setup-card">
        {/* Header */}
        <div className="profile-setup-header">
          <h1 className="profile-setup-brand">SAFAR</h1>
          <h2 className="profile-setup-title">Elite Onboarding</h2>
          <p className="profile-setup-subtitle">
            Hola <strong>{authUser?.nombre}</strong>, personalicemos tu experiencia.
          </p>
        </div>

        {/* Stepper */}
        <div className="profile-stepper">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className={`profile-step ${step === s.id ? 'active' : ''} ${step > s.id ? 'done' : ''}`}>
                <div className="profile-step-circle">
                  {step > s.id ? (
                    <span className="profile-step-check">✓</span>
                  ) : (
                    <span>{s.id === 1 ? '👤' : s.id === 2 ? '🪪' : '🏠'}</span>
                  )}
                </div>
                <span className="profile-step-label">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`profile-step-line ${step > s.id ? 'done' : ''}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {error && (
          <div className="profile-setup-error">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Step 1: Datos personales */}
        {step === 1 && (
          <div className="profile-step-content">
            <div className="input-field">
              <label>Número de Contacto</label>
              <div className="phone-input-group">
                <select
                  className="phone-country-select"
                  value={countryCode}
                  onChange={e => { setCountryCode(e.target.value); setTelefono(''); }}
                >
                  {COUNTRIES.map(c => (
                    <option key={c.code + c.name} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  className="phone-number-input"
                  placeholder="XXX-XXX-XXXX"
                  value={telefono}
                  onChange={handlePhoneChange}
                  inputMode="numeric"
                  autoFocus
                />
              </div>
            </div>

            <div className="input-field">
              <label>Avatar de Perfil</label>
              <div
                className="profile-photo-upload"
                onClick={() => fotoRef.current.click()}
                style={fotoPreview ? { backgroundImage: `url(${fotoPreview})`, borderStyle: 'solid' } : {}}
              >
                {!fotoPreview && (
                  <>
                    <span className="profile-photo-icon">📸</span>
                    <span className="profile-photo-hint">Subir Imagen</span>
                  </>
                )}
                {fotoPreview && (
                  <div className="profile-photo-overlay">
                    <span>🔄</span>
                    <span>Cambiar Foto</span>
                  </div>
                )}
              </div>
              <input
                ref={fotoRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={e => handleFileChange(e, setFoto, setFotoPreview)}
              />
              <span className="profile-photo-note">Formatos recomendados: JPG o PNG</span>
            </div>

            <button type="button" className="profile-setup-btn" onClick={handleNextStep}>
              CONTINUAR
            </button>
          </div>
        )}

        {/* Step 2: Identificación */}
        {step === 2 && (
          <div className="profile-step-content">
            <div className="input-field">
              <label>Identificación Oficial (INE / Pasaporte)</label>
              <div
                className="profile-photo-upload profile-photo-upload--ine"
                onClick={() => fotoIneRef.current.click()}
                style={fotoInePreview ? { backgroundImage: `url(${fotoInePreview})`, borderStyle: 'solid' } : {}}
              >
                {!fotoInePreview && (
                  <>
                    <span className="profile-photo-icon">🪪</span>
                    <span className="profile-photo-hint">Adjuntar Documento</span>
                    <span className="profile-photo-note-inline">Asegúrate de que tus datos sean legibles</span>
                  </>
                )}
                {fotoInePreview && (
                  <div className="profile-photo-overlay">
                    <span>🔄</span>
                    <span>Reemplazar Archivo</span>
                  </div>
                )}
              </div>
              <input
                ref={fotoIneRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={e => handleFileChange(e, setFotoIne, setFotoInePreview)}
              />
            </div>

            <div className="profile-step-actions">
              <button type="button" className="profile-setup-btn-back" onClick={() => { setError(''); setStep(1); }}>
                Anterior
              </button>
              <button type="button" className="profile-setup-btn" onClick={handleNextStep}>
                SIGUIENTE
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Dirección */}
        {step === 3 && (
          <form className="profile-step-content" onSubmit={handleSubmit}>

            {/* 1. C.P. + Municipio */}
            <div className="ps-row">
              <div className="ps-field ps-field--cp">
                <label>C.P.{isFetchingCP ? ' …' : ''}</label>
                <input
                  type="text"
                  placeholder="32000"
                  maxLength={5}
                  value={codigoPostal}
                  autoFocus
                  inputMode="numeric"
                  onChange={e => { userHasEditedAddressRef.current = true; setCodigoPostal(e.target.value.replace(/\D/g, '')); }}
                />
              </div>
              <div className="ps-field ps-field--grow">
                <label>Municipio</label>
                <input
                  type="text"
                  placeholder="Cd. Juárez"
                  value={ciudad}
                  className={autofilledFields.includes('ciudad') ? 'is-autofilled' : ''}
                  onChange={e => { userHasEditedAddressRef.current = true; setCiudad(e.target.value); }}
                />
              </div>
            </div>

            {/* 2. Estado */}
            <div className="ps-field">
              <label>Estado</label>
              <input
                type="text"
                placeholder="Chihuahua"
                value={estado}
                className={autofilledFields.includes('estado') ? 'is-autofilled' : ''}
                onChange={e => { userHasEditedAddressRef.current = true; setEstado(e.target.value); }}
              />
            </div>

            {/* 3. Colonia — select si hay opciones del CP */}
            <div className="ps-field">
              <label>Fraccionamiento / Colonia</label>
              <div className="ps-colonia-wrapper">
                {coloniaOptions.length > 0 ? (
                  <select
                    value={colonia}
                    className={`ps-select ${autofilledFields.includes('colonia') ? 'is-autofilled' : ''}`}
                    onChange={e => {
                      userHasEditedAddressRef.current = true;
                      if (e.target.value === '__MANUAL__') { setColoniaOptions([]); setColonia(''); }
                      else {
                        setColonia(e.target.value);
                        const coords = coloniaData[e.target.value];
                        if (coords?.lat && coords?.lon) { setMapLat(coords.lat); setMapLon(coords.lon); setShowMap(true); skipNextGeocodeRef.current = true; }
                      }
                    }}
                  >
                    <option value="" disabled>Selecciona una colonia…</option>
                    {coloniaOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                    <option value="__MANUAL__">+ Escribir manualmente…</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Ej. Bosques de San José"
                    value={colonia}
                    className={autofilledFields.includes('colonia') ? 'is-autofilled' : ''}
                    onChange={e => { userHasEditedAddressRef.current = true; setColonia(e.target.value); }}
                  />
                )}
              </div>
            </div>

            {/* 4. Calle + Número */}
            <div className="ps-row">
              <div className="ps-field ps-field--grow">
                <label>Calle</label>
                <div className="ps-street-wrapper">
                  <input
                    type="text"
                    placeholder={colonia ? `Buscar en ${colonia}…` : 'Av. Juárez'}
                    value={calle}
                    autoComplete="off"
                    onChange={e => {
                      userHasEditedAddressRef.current = true;
                      setCalle(e.target.value);
                      fetchStreetSuggestions(e.target.value);
                    }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onFocus={() => { if (streetSuggestions.length > 0) setShowSuggestions(true); }}
                  />
                  {showSuggestions && streetSuggestions.length > 0 && (
                    <div className="ps-suggestions-list">
                      {streetSuggestions.map(f => (
                        <div key={f.id} className="ps-suggestion-item" onClick={() => handleSelectStreet(f)}>
                          <span className="ps-sugg-main">{f.text}</span>
                          <span className="ps-sugg-sub">{f.place_name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="ps-field ps-field--sm">
                <label>Núm.</label>
                <input
                  type="text"
                  placeholder="123"
                  value={numExterior}
                  onChange={e => { userHasEditedAddressRef.current = true; setNumExterior(e.target.value); }}
                />
              </div>
            </div>

            {/* Mapa */}
            {showMap && (
              <div className="ps-map-section">
                <label className="ps-map-label">Ubicación — Arrastra el pin si es necesario</label>
                <div className="ps-map-container" ref={mapContainerRef} />
              </div>
            )}

            <div className="profile-step-actions">
              <button type="button" className="profile-setup-btn-back" onClick={() => { setError(''); setStep(2); }}>
                Anterior
              </button>
              <button type="submit" className="profile-setup-btn" disabled={isLoading}>
                {isLoading ? <span className="loading-dots">PROCESANDO</span> : 'COMPLETAR REGISTRO'}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};

export default ProfileSetup;
