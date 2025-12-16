// hooks/useProfileValidation.ts
import { useState, useRef } from "react";
import { validateField, type FieldErrors } from "@/Validation/profileValidation";
import type { UserProfile } from "../types/profile.types";

export const useProfileValidation = (user: UserProfile | null) => {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const validationTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  const validateFieldValue = async (
    fieldName: string,
    value: string | undefined
  ) => {
    if (!user) return;

    // Clear previous timeout for this field (debouncing)
    if (validationTimeouts.current[fieldName]) {
      clearTimeout(validationTimeouts.current[fieldName]);
    }

    // Debounce validation by 300ms to prevent excessive calls
    validationTimeouts.current[fieldName] = setTimeout(async () => {

      // Skip duplicate check for phoneNumber (handled separately)
      if (fieldName === "phoneNumber") {
        // Only validate format
        const errorMessage = await validateField(
          fieldName,
          value,
          user.role as "student" | "teacher" | "admin"
        );
        if (errorMessage) {
          setFieldErrors((prev: FieldErrors) => ({
            ...prev,
            [fieldName]: errorMessage,
          }));
        }
        return;
      }

      const errorMessage = await validateField(
        fieldName,
        value,
        user.role as "student" | "teacher" | "admin"
      );
      if (errorMessage) {
        setFieldErrors((prev: FieldErrors) => ({
          ...prev,
          [fieldName]: errorMessage,
        }));
      } else {
        setFieldErrors((prev) => {
          const { [fieldName]: _, ...rest } = prev;
          return rest;
        });
      }
    }, 300); // 300ms debounce delay
  };

  const clearFieldError = (fieldName: string) => {
    setFieldErrors((prev) => {
      const { [fieldName]: _, ...rest } = prev;
      return rest;
    });
  };

  const clearAllErrors = () => {
    setFieldErrors({});
  };

  return {
    fieldErrors,
    setFieldErrors,
    validateFieldValue,
    clearFieldError,
    clearAllErrors,
  };
};
