import { createBrowserRouter } from "react-router-dom";
import { AdminLayout } from "../layouts/AdminLayout";
import { DashboardPage } from "../pages/DashboardPage";
import { LoginPage } from "../pages/LoginPage";
import { MessagesPage } from "../pages/MessagesPage";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { MessageDetailPage } from "../pages/MessageDetailPage";
import { RGPDPage } from "../pages/RGPDPage";
import { LegalDocumentsPage } from "../pages/LegalDocumentsPage";
import { UsersSettingsPage } from "../pages/UsersSettingsPage";
import { PortfolioImagesPage } from "../pages/PortfolioImagesPage";
import { ServicesContentPage } from "../pages/ServicesContentPage";
import { SettingsGeneralPage } from "../pages/SettingsGeneralPage";

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
        path: "/settings/rgpd",
        element: <RGPDPage />,
      },
      {
        path: "/legal",
        element: <LegalDocumentsPage />,
      },
      {
        path: "/settings/users",
        element: <UsersSettingsPage />,
      },
      {
        path: "/portfolio-images",
        element: <PortfolioImagesPage />,
      },
      {
        path: "/prestations",
        element: <ServicesContentPage />,
      },
      {
        path: "/settings/general",
        element: <SettingsGeneralPage />,
      }
    ],
  },
]);