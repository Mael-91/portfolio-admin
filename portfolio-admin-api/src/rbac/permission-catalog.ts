export const USER_PERMISSIONS = {
  read: "users.read",
  create: "users.create",
  update: "users.update",
  resetPassword: "users.reset_password",
  setActive: "users.set_active",
  delete: "users.delete",
} as const;

export const PERMISSION_CATALOG = [{
  id: "administration",
  label: "Administration",
  groups: [
    { id: "rgpd", label: "Gestion RGPD", rights: [
      { id: "read", label: "Lecture", permissions: [{ code: "rgpd.read", label: "Consulter les réglages et les statistiques" }] },
      { id: "write", label: "Écriture", permissions: [{ code: "rgpd.write", label: "Enregistrer les réglages RGPD" }] },
    ] },
    { id: "users", label: "Gestion des utilisateurs", rights: [
      { id: "read", label: "Lecture", permissions: [{ code: USER_PERMISSIONS.read, label: "Consulter les utilisateurs" }] },
      { id: "write", label: "Écriture", permissions: [{ code: USER_PERMISSIONS.create, label: "Créer des utilisateurs" }] },
      { id: "update", label: "Modification", permissions: [
        { code: USER_PERMISSIONS.update, label: "Modifier les utilisateurs" },
        { code: USER_PERMISSIONS.resetPassword, label: "Réinitialiser les mots de passe" },
        { code: USER_PERMISSIONS.setActive, label: "Activer ou désactiver les comptes" },
      ] },
      { id: "delete", label: "Suppression", permissions: [{ code: USER_PERMISSIONS.delete, label: "Supprimer des utilisateurs" }] },
    ] },
    { id: "general", label: "Paramètres généraux", rights: [
      { id: "read", label: "Lecture", permissions: [{ code: "general.read", label: "Consulter les paramètres privés" }] },
      { id: "write", label: "Écriture", permissions: [{ code: "general.write", label: "Enregistrer les paramètres et téléverser les logos" }] },
    ] },
  ],
}, {
  id: "relation_client", label: "Relation client",
  groups: [
    { id: "messages", label: "Demandes de contact", rights: [
      { id: "read", label: "Lecture", permissions: [{ code: "messages.read", label: "Consulter les demandes et les compteurs" }] },
      { id: "process", label: "Traitement", permissions: [{ code: "messages.process", label: "Changer le statut de traitement" }] },
      { id: "export_rgpd", label: "Export RGPD", permissions: [{ code: "messages.export_rgpd", label: "Exporter les données par email", systemOnly: true }] },
    ] },
  ],
}, {
  id: "portfolio", label: "Portfolio",
  groups: [
    { id: "images", label: "Images", rights: [
      { id: "read", label: "Lecture", permissions: [{ code: "images.read", label: "Consulter les images" }] },
      { id: "add", label: "Ajout", permissions: [{ code: "images.add", label: "Ajouter une image" }] },
      { id: "update", label: "Modification", permissions: [{ code: "images.update", label: "Modifier les métadonnées" }] },
      { id: "publish", label: "Publication", permissions: [{ code: "images.publish", label: "Activer ou désactiver une image" }] },
      { id: "reorder", label: "Réorganisation", permissions: [{ code: "images.reorder", label: "Modifier l’ordre des images" }] },
      { id: "delete", label: "Suppression", permissions: [{ code: "images.delete", label: "Supprimer une image" }] },
    ] },
    { id: "portfolio_settings", label: "Configuration", rights: [
      { id: "read", label: "Lecture", permissions: [{ code: "portfolio_settings.read", label: "Consulter la configuration" }] },
      { id: "write", label: "Écriture", permissions: [{ code: "portfolio_settings.write", label: "Enregistrer la configuration" }] },
      { id: "upload", label: "Téléversement", permissions: [{ code: "portfolio_settings.upload", label: "Téléverser le favicon ou l’arrière-plan" }] },
    ] },
    { id: "services", label: "Prestations", rights: [
      { id: "read", label: "Lecture", permissions: [{ code: "services.read", label: "Consulter les prestations" }] },
      { id: "write", label: "Écriture", permissions: [{ code: "services.write", label: "Modifier les textes, listes et tarifs" }] },
      { id: "visibility", label: "Visibilité", permissions: [{ code: "services.visibility", label: "Modifier les réglages de visibilité" }] },
    ] },
    { id: "about", label: "À propos", rights: [
      { id: "read", label: "Lecture", permissions: [{ code: "about.read", label: "Consulter le contenu" }] },
      { id: "write", label: "Écriture", permissions: [{ code: "about.write", label: "Enregistrer le contenu" }] },
      { id: "upload", label: "Téléversement", permissions: [{ code: "about.upload", label: "Téléverser l’image" }] },
      { id: "cleanup", label: "Nettoyage", permissions: [{ code: "about.cleanup", label: "Supprimer les images orphelines" }] },
    ] },
  ],
}, {
  id: "documents", label: "Documents légaux",
  groups: [
    { id: "legal", label: "Documents légaux", rights: [
      { id: "read", label: "Lecture", permissions: [{ code: "legal.read", label: "Consulter toutes les versions" }] },
      { id: "draft", label: "Écriture du brouillon", permissions: [{ code: "legal.draft", label: "Enregistrer un brouillon" }] },
      { id: "publish", label: "Publication", permissions: [{ code: "legal.publish", label: "Publier un document" }] },
      { id: "download", label: "Téléchargement", permissions: [{ code: "legal.download", label: "Télécharger les documents HTML" }] },
    ] },
  ],
}] as const;

type CatalogRight = (typeof PERMISSION_CATALOG)[number]["groups"][number]["rights"][number];
type CatalogPermission = CatalogRight["permissions"][number];
export type PermissionCode = CatalogPermission["code"];

const rights: readonly CatalogRight[] = PERMISSION_CATALOG.flatMap(({ groups }) =>
  groups.flatMap(({ rights }): readonly CatalogRight[] => rights)
);
export const PERMISSION_CODES: readonly PermissionCode[] = rights
  .flatMap(({ permissions }): readonly CatalogPermission[] => permissions)
  .map(({ code }) => code);
export const SYSTEM_PERMISSION_CODES: readonly PermissionCode[] = rights
  .flatMap(({ permissions }): readonly CatalogPermission[] => permissions)
  .filter((permission) => "systemOnly" in permission)
  .map(({ code }) => code);
export const ASSIGNABLE_PERMISSION_CODES = PERMISSION_CODES.filter((code) => !SYSTEM_PERMISSION_CODES.includes(code));
