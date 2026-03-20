import { createBrowserRouter } from "react-router-dom";
import { AdminLayout } from "../layouts/AdminLayout";
import { DashboardPage } from "../pages/DashboardPage";
import { LoginPage } from "../pages/LoginPage";
import { MessagesPage } from "../pages/MessagesPage";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { MessageDetailPage } from "../pages/MessageDetailPage";
import { SettingsPage } from "../pages/SettingsPage";
import { LegalDocumentsPage } from "../pages/LegalDocumentsPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "messages",
        element: <MessagesPage />,
      },
      {
        path: "messages/:id",
        element: <MessageDetailPage />,
      },
      {
        path: "/settings",
        element: <SettingsPage />,
      },
      {
        path: "/settings/legal",
        element: <LegalDocumentsPage />,
      },
    ],
  },
]);