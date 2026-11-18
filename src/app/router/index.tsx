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
import { AboutPage } from "../pages/AboutPage";
import { PortfolioConfigurationPage } from "../pages/PortfolioConfigurationPage";
import { PageAccess } from "../components/PageAccess";
import { RolesSettingsPage } from "../pages/RolesSettingsPage";

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
        element: <PageAccess path="/messages"><MessagesPage /></PageAccess>,
      },
      {
        path: "messages/:id",
        element: <PageAccess path="/messages"><MessageDetailPage /></PageAccess>,
      },
      {
        path: "/settings/rgpd",
        element: <PageAccess path="/settings/rgpd"><RGPDPage /></PageAccess>,
      },
      {
        path: "/legal",
        element: <PageAccess path="/legal"><LegalDocumentsPage /></PageAccess>,
      },
      {
        path: "/settings/users",
        element: <PageAccess path="/settings/users"><UsersSettingsPage /></PageAccess>,
      },
      {
        path: "/settings/roles",
        element: <PageAccess path="/settings/roles"><RolesSettingsPage /></PageAccess>,
      },
      {
        path: "/portfolio-images",
        element: <PageAccess path="/portfolio-images"><PortfolioImagesPage /></PageAccess>,
      },
      {
        path: "/prestations",
        element: <PageAccess path="/prestations"><ServicesContentPage /></PageAccess>,
      },
      {
        path: "/settings/general",
        element: <PageAccess path="/settings/general"><SettingsGeneralPage /></PageAccess>,
      },
      {
        path: "/about",
        element: <PageAccess path="/about"><AboutPage /></PageAccess>,
      },
      {
        path: "/portfolio/settings",
        element: <PageAccess path="/portfolio/settings"><PortfolioConfigurationPage /></PageAccess>,
      }
    ],
  },
]);
