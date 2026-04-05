import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";
import { ToastProvider } from "./app/components/ToastProvider";
import { MessageNotificationsProvider } from "./app/providers/MessageNotificationsProvider";
import { GeneralSettingsProvider } from "./app/context/GeneralSettingsContext";

function App() {
  return (
    <GeneralSettingsProvider>
      <ToastProvider>
        <MessageNotificationsProvider>
          <RouterProvider router={router} />
        </MessageNotificationsProvider>
      </ToastProvider>
    </GeneralSettingsProvider>
  );
}

export default App;