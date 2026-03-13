export function MessagesPage() {
  return (
    <div className="p-8">

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          Demandes de contact
        </h1>

        <button className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800">
          Export RGPD
        </button>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow">
        <table className="w-full text-left text-sm">

          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Téléphone</th>
              <th className="px-4 py-3">Consentement</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>

          <tbody>

            <tr className="border-t">
              <td className="px-4 py-3">Particulier</td>

              <td className="px-4 py-3">
                contact@email.com
              </td>

              <td className="px-4 py-3 text-slate-600">
                Bonjour je souhaiterais obtenir un devis...
              </td>

              <td className="px-4 py-3">
                <span className="inline-block h-3 w-3 rounded-full bg-green-500"></span>
              </td>

              <td className="px-4 py-3">
                <span className="inline-block h-3 w-3 rounded-full bg-green-500"></span>
              </td>

              <td className="px-4 py-3">
                Non traité
              </td>

              <td className="px-4 py-3">
                <button className="text-red-600 hover:text-red-800">
                  Supprimer
                </button>
              </td>
            </tr>

          </tbody>

        </table>
      </div>

      <div className="mt-6 flex justify-end gap-2">

        <button className="rounded-lg border px-4 py-2">
          Précédent
        </button>

        <button className="rounded-lg border px-4 py-2">
          Suivant
        </button>

      </div>

    </div>
  );
}