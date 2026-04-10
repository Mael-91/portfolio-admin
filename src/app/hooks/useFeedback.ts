import { useState } from "react";

export type FeedbackState = "idle" | "success" | "error" | "loading";

export function useFeedback() {
  const [state, setState] = useState<FeedbackState>("idle");

  function setSuccess() {
    setState("success");
  }

  function setError() {
    setState("error");
  }

  function setLoadingError() {
    setState("loading");
  }

  function reset() {
    setState("idle");
  }

  return {
    feedbackState: state,
    setSuccess,
    setError,
    setLoadingError,
    reset,
  };
}