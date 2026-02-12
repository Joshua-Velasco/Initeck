import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { EMPLEADOS_UPDATE_LOCATION_URL } from "../../config.js";
import { useAuth } from "../auth/AuthProvider.jsx";

const TrackingContext = createContext(null);

export const TrackingProvider = ({ children }) => {
  const { user } = useAuth();
  const audioRef = useRef(null);
  const trackingActive = useRef(false);
  const [isTracking, setIsTracking] = useState(false);

  // Importar dinámicamente el plugin solo si es necesario (evita errores en web)
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    const checkPlatform = async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        const platform = Capacitor.getPlatform();
        const isNativePlatform = Capacitor.isNativePlatform();
        
        // Only set isNative to true if we're on iOS or Android
        const actuallyNative = (platform === 'ios' || platform === 'android') && isNativePlatform;
        
        console.log("📍 [PLATFORM CHECK]", {
          platform,
          isNativePlatform,
          actuallyNative,
          willUseNativeGPS: actuallyNative
        });
        
        setIsNative(actuallyNative);
      } catch (err) {
        console.log("📍 [PLATFORM CHECK] Capacitor not available, using web GPS");
        setIsNative(false);
      }
    };
    checkPlatform();
  }, []);

  useEffect(() => {
    let watchId = null;
    let nativeWatcherId = null;

    // Roles definidos: admin, operator, employee, cleaning, development
    const rolesOperativos = [
      "employee",
      "operator",
      "cleaning",
      "admin",
      "development",
    ];

    const startTracking = async () => {
      if (!user?.usuario_id || !rolesOperativos.includes(user.rol)) return;

      console.log("📍 Iniciando rastreo GPS (Dual Mode)...");
      trackingActive.current = true;
      setIsTracking(true);

      if (isNative) {
        try {
           await startNativeTracking();
        } catch (error) {
           console.error("📍 [NATIVE FAILURE] Fallback a Web GPS...", error);
           startWebTracking();
        }
      } else {
        startWebTracking();
      }

      // --- HACK DE AUDIO (SOLO WEB / SAFARI MOBILE) ---
      if (!isNative && audioRef.current) {
        try {
          audioRef.current.volume = 0.01;
          audioRef.current.play().catch(e => console.log("🔇 Autoplay prevenido"));
        } catch (e) { }
      }
    };

    const startNativeTracking = async () => {
        const { Capacitor, registerPlugin } = await import("@capacitor/core");
        const { Geolocation } = await import("@capacitor/geolocation");
        const BackgroundGeolocation = registerPlugin("BackgroundGeolocation");
        const Swal = (await import("sweetalert2")).default;
        
        console.log("📍 Iniciando GPS tracking nativo con Background Geolocation...", {
          platform: Capacitor.getPlatform(),
          isNative: Capacitor.isNativePlatform(),
          pluginExists: !!BackgroundGeolocation
        });
        
        // PASO 1: Verificar permisos básicos (While In Use)
        let permissionStatus = await Geolocation.checkPermissions();
        console.log("📍 [PASO 1] ✅ Estado de permisos:", permissionStatus.location);
        
        if (permissionStatus.location !== 'granted') {
          console.log("📍 [PASO 2] Solicitando permisos de ubicación...");
          permissionStatus = await Geolocation.requestPermissions();
          if (permissionStatus.location !== 'granted') {
            console.warn("📍 [PASO 2] ⚠️ Permisos denegados por el usuario");
            throw new Error("Permisos denegados");
          }
        }

        // PASO 3: Manejo específico para iOS - "Permitir Siempre"
        const isIos = (await import("@capacitor/core")).Capacitor.getPlatform() === 'ios';
        
        if (isIos) {
          console.log("📍 [iOS] Verificando necesidad de 'Permitir siempre'...");
        }

        // PASO 4: Iniciar Background Geolocation
        console.log("📍 [PASO 4] Iniciando watcher de background...");
        
        try {
          const watcherId = await BackgroundGeolocation.addWatcher(
            {
              backgroundMessage: "Rastreando tu viaje en segundo plano...",
              backgroundTitle: "Initeck Flota",
              requestPermissions: true,
              stale: false,
              distanceFilter: 10 // metros
            },
            (position, error) => {
              if (error) {
                console.error("📍 Error en BackgroundGeolocation:", error);
                if (error.code === 'NOT_AUTHORIZED' || error.code === 1) {
                  Swal.fire({
                    title: 'Ubicación Incompleta',
                    text: 'Para rastrear tu viaje en segundo plano, por favor cambia la configuración de ubicación a "Permitir siempre".',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Ir a Ajustes',
                    cancelButtonText: 'Más tarde'
                  }).then((result) => {
                    if (result.isConfirmed) {
                      BackgroundGeolocation.openSettings();
                    }
                  });
                }
                return;
              }
              
              if (!position) return;
              
              console.log("📍 [NATIVE GPS] Señal recibida:", {
                latitude: position.latitude,
                longitude: position.longitude,
                speed: position.speed,
                accuracy: position.accuracy,
                timestamp: new Date(position.time).toISOString()
              });
              
              sendLocationUpdate(
                position.latitude, 
                position.longitude, 
                position.speed
              );
            }
          );
          
          nativeWatcherId = watcherId;
          console.log("✅ [PASO 4] Native Background Watcher Started, ID:", watcherId);
        } catch (watchErr) {
          console.error("📍 [PASO 4] ❌ Error al iniciar background watcher:", watchErr);
          throw watchErr;
        }
    };

    const startWebTracking = () => {
      if (!("geolocation" in navigator)) {
         console.warn("📍 [WEB GPS] Geolocation no soportada en este navegador");
         return;
      }

      console.log('📍 [WEB GPS] Iniciando watchPosition (fallback web)');
      
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
           if (!trackingActive.current) return;
           
           console.log('📍 [WEB GPS] Señal recibida:', {
             latitude: pos.coords.latitude,
             longitude: pos.coords.longitude,
             speed: pos.coords.speed,
             accuracy: pos.coords.accuracy
           });
           
           const { latitude, longitude, speed } = pos.coords;
           sendLocationUpdate(latitude, longitude, speed);
        },
        (err) => {
           console.error("📍 Error GPS Web:", err.message);
        },
        { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
      );
    };

    const sendLocationUpdate = async (latitude, longitude, speed) => {
       try {
          const payload = {
            empleado_id: user.id,
            usuario_id: user.usuario_id,
            latitud: latitude,
            longitud: longitude,
            velocidad: speed || 0,
          };
          
          const res = await fetch(EMPLEADOS_UPDATE_LOCATION_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          
          if (!res.ok) {
            const responseText = await res.text();
            console.warn(`🛰️ [GPS] Error envío GPS: ${res.status} - ${responseText}`);
          } else {
            console.log('✅ [GPS] Ubicación enviada exitosamente');
          }
       } catch (err) {
          console.error("🛰️ [GPS] Fallo red GPS:", err);
       }
    };

    startTracking();

    return () => {
      trackingActive.current = false;
      setIsTracking(false);
      if (watchId) navigator.geolocation.clearWatch(watchId);
      if (nativeWatcherId) {
          import("@capacitor/core").then(({ registerPlugin }) => {
            const BackgroundGeolocation = registerPlugin("BackgroundGeolocation");
            BackgroundGeolocation.removeWatcher({ id: nativeWatcherId });
          });
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [user?.usuario_id, user?.rol, user?.id, isNative]);

  return (
    <TrackingContext.Provider value={{ isTracking }}>
      {children}
      {/* AUDIO SILENCIOSO PARA KEEP-ALIVE GPS (iOS Web) */}
      <audio ref={audioRef} loop style={{ display: "none" }}>
          <source
            src="data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA"
            type="audio/wav"
          />
      </audio>
    </TrackingContext.Provider>
  );
};

export const useTracking = () => {
  return useContext(TrackingContext);
};
