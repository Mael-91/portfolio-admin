import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";
import { ToastProvider } from "./app/components/ToastProvider";
import { GeneralSettingsProvider } from "./app/context/GeneralSettingsContext";

function App() {
  return (
    <GeneralSettingsProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </GeneralSettingsProvider>
  );
}

export default App;