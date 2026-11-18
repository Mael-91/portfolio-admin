import type { RoleOption } from "../../services/roles";

export function RolePicker({ roles, selected, onChange }: {
  roles: RoleOption[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const labels = roles.filter((role) => selected.includes(role.id)).map((role) => role.code);
  return (
    <details className="rounded-xl border border-white/10 bg-white/[0.03]">
      <summary className="cursor-pointer break-words px-3 py-2 text-sm text-admin-text-soft">
        Rôles · {labels.length ? labels.join(", ") : "Aucun rôle"}
      </summary>
      <fieldset className="max-h-52 space-y-2 overflow-y-auto border-t border-white/10 px-3 py-2">
        <legend className="sr-only">Rôles attribués</legend>
        {roles.map(({ id, code }) => (
          <label key={id} className="flex items-start gap-2 break-all text-sm">
            <input
              className="mt-0.5 accent-admin-accent"
              type="checkbox"
              checked={selected.includes(id)}
              onChange={(event) => onChange(event.target.checked
                ? [...selected, id]
                : selected.filter((value) => value !== id))}
            />
            {code}
          </label>
        ))}
      </fieldset>
    </details>
  );
}
