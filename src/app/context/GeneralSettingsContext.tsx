import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { fetchPublicGeneralSettings } from "../services/settingsGeneral";
import { env } from "../../env";

export type GeneralSettings = {
  siteName: string;
  siteDescription: string;
  siteLogoUrl: string;
  siteSidebarLogoUrl: string;
};

type GeneralSettingsContextValue = {
  settings: GeneralSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
};

const defaultSettings: GeneralSettings = {
  siteName: "Dashboard",
  siteDescription: "",
  siteLogoUrl: "",
  siteSidebarLogoUrl: "",
};

const GeneralSettingsContext = createContext<GeneralSettingsContextValue>({
  settings: defaultSettings,
  loading: true,
  refreshSettings: async () => {},
});

function resolveAssetUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${env.apiBaseUrl}${url}`;
}

function applySeo(settings: GeneralSettings) {
  document.title = settings.siteName || "Dashboard";

  let metaDescription = document.querySelector(
    'meta[name="description"]'
  ) as HTMLMetaElement | null;

  if (!metaDescription) {
    metaDescription = document.createElement("meta");
    metaDescription.name = "description";
    document.head.appendChild(metaDescription);
  }

  metaDescription.content = settings.siteDescription || "";

  const faviconUrl = resolveAssetUrl(settings.siteLogoUrl);

  let favicon = document.querySelector(
    'link[rel="icon"]'
  ) as HTMLLinkElement | null;

  if (!favicon) {
    favicon = document.createElement("link");
    favicon.rel = "icon";
    document.head.appendChild(favicon);
  }

  if (faviconUrl) {
    favicon.href = faviconUrl;
  }
}

export function GeneralSettingsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [settings, setSettings] = useState<GeneralSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  async function refreshSettings() {
    try {
      const data = await fetchPublicGeneralSettings();

      const nextSettings: GeneralSettings = {
        siteName: data.settings.siteName ?? "Dashboard",
        siteDescription: data.settings.siteDescription ?? "",
        siteLogoUrl: data.settings.siteLogoUrl ?? "",
        siteSidebarLogoUrl: data.settings.siteSidebarLogoUrl ?? "",
      };

      setSettings(nextSettings);
      applySeo(nextSettings);
    } catch (error) {
      console.error("Erreur chargement settings généraux :", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshSettings();
  }, []);

  const value = useMemo(
    () => ({
      settings,
      loading,
      refreshSettings,
    }),
    [settings, loading]
  );

  return (
    <GeneralSettingsContext.Provider value={value}>
      {children}
    </GeneralSettingsContext.Provider>
  );
}

export function useGeneralSettings() {
  return useContext(GeneralSettingsContext);
}