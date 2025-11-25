import { useState, useEffect, useRef } from "react";

/**
 * Custom hook for generating glitch text effect
 * @param length - Length of the glitch text
 * @param interval - Update interval in milliseconds (default: 150)
 * @returns Current glitch text string
 */
export const useGlitchText = (
  length: number = 4,
  interval: number = 150
): string => {
  const [glitchText, setGlitchText] = useState<string>("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Character set for glitch effect
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";

  // Special characters for more glitchy effect
  const specialChars = "█▓▒░▀▄▌▐■□▪▫◘◙◚◛◜◝◞◟";

  useEffect(() => {
    const generateGlitchText = () => {
      let result = "";
      for (let i = 0; i < length; i++) {
        // 20% chance to use special glitch characters
        const useSpecial = Math.random() < 0.2;
        const charSet = useSpecial ? specialChars : characters;
        const randomIndex = Math.floor(Math.random() * charSet.length);
        result += charSet[randomIndex];
      }
      setGlitchText(result);
    };

    // Generate initial text
    generateGlitchText();

    // Set up interval for continuous glitch effect
    intervalRef.current = setInterval(generateGlitchText, interval);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [length, interval]);

  return glitchText;
};
