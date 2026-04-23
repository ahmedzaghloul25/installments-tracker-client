import { useState, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';

export function useBiometrics() {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    LocalAuthentication.hasHardwareAsync().then((hasHW) => {
      if (hasHW) {
        LocalAuthentication.isEnrolledAsync().then(setIsAvailable);
      }
    });
  }, []);

  const authenticate = async (): Promise<boolean> => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access your vault',
      fallbackLabel: 'Use Passcode',
    });
    return result.success;
  };

  return { isAvailable, authenticate };
}
