import { type FeedbackState } from "../app/hooks/useFeedback";

export function getFeedbackClasses(state: FeedbackState) {
  switch (state) {
    case "success":
      return "border-green-500/30 bg-green-500/10";

    case "error":
      return "border-red-500/30 bg-red-500/10";

    case "loading":
      return "border-admin-accent/30 bg-admin-accent/10 animate-pulse";

    default:
      return "";
  }
}

export function getInputFeedbackClasses(
  state: FeedbackState,
  hasError: boolean
) {
  if (hasError) {
    return "border-red-500 focus:border-red-400";
  }

  if (state === "error") {
    return "border-red-500/30";
  }

  if (state === "success") {
    return "border-green-500/30";
  }

  return "border-white/10 focus:border-white/20";
}

export function getButtonFeedbackClasses(state: FeedbackState) {
  switch (state) {
    case "loading":
      return "opacity-70 cursor-not-allowed";

    case "success":
      return "bg-green-500/20 text-green-400 border-green-500/30";

    case "error":
      return "bg-red-500/20 text-red-400 border-red-500/30";

    default:
      return "";
  }
}