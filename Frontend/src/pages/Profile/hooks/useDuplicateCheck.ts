// hooks/useDuplicateCheck.ts
import { useState, useRef, useEffect } from "react";
import { checkDuplicateField } from "@/Api/profileApi";
import type { FieldErrors } from "@/Validation/profileValidation";

export const useDuplicateCheck = (
  onDuplicateFound?: (field: string, message: string) => void,
  onDuplicateCleared?: (field: string) => void
) => {
  const [checkingDuplicate, setCheckingDuplicate] = useState<string | null>(null);
  const duplicateCheckTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (duplicateCheckTimerRef.current) {
        clearTimeout(duplicateCheckTimerRef.current);
      }
    };
  }, []);

  const checkPhoneNumber = async (
    value: string,
    currentValue: string | undefined,
    setFieldErrors: (updater: (prev: FieldErrors) => FieldErrors) => void
  ) => {
    const numbersOnly = value.replace(/\D/g, "");

    // Clear previous timer
    if (duplicateCheckTimerRef.current) {
      clearTimeout(duplicateCheckTimerRef.current);
    }

    // Remove error if value is empty or same as current
    if (!numbersOnly || numbersOnly === currentValue) {
      setFieldErrors((prev) => {
        const { phoneNumber, ...rest } = prev;
        return rest;
      });
      setCheckingDuplicate(null);
      if (onDuplicateCleared) {
        onDuplicateCleared("phoneNumber");
      }
      return;
    }

    // Validate format first
    if (numbersOnly.length < 10) {
      setCheckingDuplicate(null);
      return; // Wait for complete number
    }

    // Set checking state
    setCheckingDuplicate("phoneNumber");

    // Debounce duplicate check (500ms)
    duplicateCheckTimerRef.current = setTimeout(async () => {
      try {
        const result = await checkDuplicateField("phoneNumber", numbersOnly);

        if (result.isDuplicate) {
          const errorMessage = result.message || "رقم الهاتف مُستخدم بالفعل";
          setFieldErrors((prev) => ({
            ...prev,
            phoneNumber: errorMessage,
          }));
          if (onDuplicateFound) {
            onDuplicateFound("phoneNumber", errorMessage);
          }
        } else {
          setFieldErrors((prev) => {
            const { phoneNumber, ...rest } = prev;
            return rest;
          });
          if (onDuplicateCleared) {
            onDuplicateCleared("phoneNumber");
          }
        }
      } catch (error) {
        console.error("خطأ في التحقق من التكرار:", error);
      } finally {
        setCheckingDuplicate(null);
      }
    }, 500);
  };

  return {
    checkingDuplicate,
    checkPhoneNumber,
  };
};
