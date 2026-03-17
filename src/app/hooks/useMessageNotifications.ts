import { useContext } from "react";
import { MessageNotificationsContext } from "../providers/MessageNotificationsProvider";

export function useMessageNotifications() {
  const context = useContext(MessageNotificationsContext);

  if (!context) {
    throw new Error("useMessageNotifications doit être utilisé dans MessageNotificationsProvider");
  }

  return context;
}