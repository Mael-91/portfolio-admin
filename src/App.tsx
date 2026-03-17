import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";
import { ToastProvider } from "./app/components/ToastProvider";
import { MessageNotificationsProvider } from "./app/providers/MessageNotificationsProvider";

function App() {
  return (
    <ToastProvider>
      <MessageNotificationsProvider>
        <RouterProvider router={router} />
      </MessageNotificationsProvider>
    </ToastProvider>
  );
}

export default App;