import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para mantener la pantalla encendida (Wake Lock API)
 */
export const useWakeLock = () => {
    // Wake Lock desactivado por solicitud del usuario (satura el navegador)
    const requestWakeLock = useCallback(async () => {
        // No-op
    }, []);

    const releaseWakeLock = useCallback(async () => {
        // No-op
    }, []);

    return { requestWakeLock, releaseWakeLock, isLocked: false };
};
