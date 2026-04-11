import { useMemo, useState } from "react";

type Validator<T> = (value: T) => boolean;

type Validators<FormValues> = {
  [K in keyof FormValues]?: Validator<FormValues[K]>;
};

type TouchedState<FormValues> = {
  [K in keyof FormValues]: boolean;
};

export function useFormValidation<FormValues extends Record<string, any>>(
  values: FormValues,
  validators: Validators<FormValues>
) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [touched, setTouched] = useState<TouchedState<FormValues>>(
    Object.keys(values).reduce((acc, key) => {
      acc[key as keyof FormValues] = false;
      return acc;
    }, {} as TouchedState<FormValues>)
  );

  function touchField<K extends keyof FormValues>(field: K) {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));
  }

  function resetValidation() {
    setIsSubmitted(false);
    setTouched(
      Object.keys(values).reduce((acc, key) => {
        acc[key as keyof FormValues] = false;
        return acc;
      }, {} as TouchedState<FormValues>)
    );
  }

  function submitValidation() {
    setIsSubmitted(true);
  }

  const fieldErrors = useMemo(() => {
    const result = {} as Record<keyof FormValues, boolean>;

    for (const key of Object.keys(values) as Array<keyof FormValues>) {
      const validator = validators[key];
      result[key] = validator ? !validator(values[key]) : false;
    }

    return result;
  }, [values, validators]);

  function hasFieldError<K extends keyof FormValues>(field: K) {
    return fieldErrors[field] && (isSubmitted || touched[field]);
  }

  const hasAnyError = useMemo(() => {
    return (Object.keys(fieldErrors) as Array<keyof FormValues>).some(
      (key) => fieldErrors[key]
    );
  }, [fieldErrors]);

  return {
    isSubmitted,
    touched,
    fieldErrors,
    hasAnyError,
    touchField,
    hasFieldError,
    submitValidation,
    resetValidation,
  };
}