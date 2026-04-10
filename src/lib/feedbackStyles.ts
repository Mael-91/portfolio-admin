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