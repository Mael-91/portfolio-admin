import { useId, useState, type ReactNode } from "react";
import type { PermissionCategory as Category, PermissionRight } from "../../services/roles";
import { Button } from "../ui/Button";
import { togglePermissions } from "./permission-selection";

function codesOf(rights: PermissionRight[], assignableOnly = false) {
  return rights.flatMap(({ permissions }) => permissions
    .filter(({ systemOnly }) => !assignableOnly || !systemOnly).map(({ code }) => code));
}

function selection(codes: string[], selected: string[]) {
  const count = codes.filter((code) => selected.includes(code)).length;
  return { checked: codes.length > 0 && count === codes.length, partial: count > 0 && count < codes.length };
}

function PermissionBranch({ name, codes, selected, onToggle, initiallyOpen = false, partialNote, children }: {
  name: string;
  codes: string[];
  selected: string[];
  onToggle: (codes: string[], checked: boolean) => void;
  initiallyOpen?: boolean;
  partialNote?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(initiallyOpen);
  const id = useId();
  const { checked, partial } = selection(codes, selected);

  return (
    <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <label className="flex min-w-0 items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            className="shrink-0 accent-admin-accent"
            checked={checked}
            disabled={codes.length === 0}
            ref={(input) => { if (input) input.indeterminate = partial; }}
            onChange={(event) => onToggle(codes, event.target.checked)}
          />
          {name}
        </label>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          aria-expanded={open}
          aria-controls={id}
          aria-label={`${open ? "Replier" : "Déplier"} ${name}`}
          onClick={() => setOpen(!open)}
        >
          <span aria-hidden="true">{open ? "−" : "+"}</span>
        </Button>
      </div>
      {partial && partialNote && <p className="ml-5 text-xs text-admin-text-soft">{partialNote}</p>}
      <div id={id} hidden={!open} className="mt-2">
        {children}
      </div>
    </div>
  );
}

export function PermissionCategory({ category, selected, onChange }: {
  category: Category;
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  function toggle(codes: string[], checked: boolean, groupReadCodes?: string[]) {
    onChange(togglePermissions(selected, codes, checked, groupReadCodes));
  }

  return (
    <PermissionBranch name={category.label} codes={codesOf(category.groups.flatMap(({ rights }) => rights), true)}
      selected={selected} onToggle={toggle} initiallyOpen>
      <div className="grid gap-2 md:grid-cols-2">
        {category.groups.map((group) => {
          const readCodes = codesOf(group.rights.filter(({ id }) => id === "read"), true);

          return (
            <PermissionBranch key={group.id} name={group.label} codes={codesOf(group.rights, true)}
              selected={selected} onToggle={toggle} initiallyOpen>
              <div className="space-y-2">
                {group.rights.map((right) => {
                  const codes = codesOf([right], true);
                  const requiredRead = right.id === "read" ? undefined : readCodes;
                  const toggleRight = (values: string[], checked: boolean) => toggle(values, checked, requiredRead);

                  return (
                    <PermissionBranch key={right.id} name={codes.length ? right.label : `${right.label} · Admin système`}
                      codes={codes} selected={selected} onToggle={toggleRight} partialNote="Droits historiques partiels">
                      <ul className="space-y-1 pl-5 text-xs text-admin-text-soft">
                        {right.permissions.map(({ code, label, systemOnly }) => (
                          <li key={code}>
                            {codes.length > 1 && !systemOnly ? (
                              <label className="flex items-start gap-2">
                                <input type="checkbox" className="mt-0.5 accent-admin-accent"
                                  checked={selected.includes(code)}
                                  onChange={(event) => toggleRight([code], event.target.checked)} />
                                {label}
                              </label>
                            ) : (
                              <>{label} : {systemOnly ? "réservé à l’admin système" : selected.includes(code) ? "autorisé" : "non autorisé"}</>
                            )}
                          </li>
                        ))}
                      </ul>
                    </PermissionBranch>
                  );
                })}
              </div>
            </PermissionBranch>
          );
        })}
      </div>
    </PermissionBranch>
  );
}

export function RolePermissionSummary({ categories, selected }: { categories: Category[]; selected: string[] }) {
  if (selected.length === 0) return <p className="text-sm text-admin-text-soft">Aucune permission</p>;

  return (
    <div className="space-y-2 text-sm text-admin-text-soft">
      {categories.map((category) => {
        if (selection(codesOf(category.groups.flatMap(({ rights }) => rights)), selected).checked) {
          return <p key={category.id}>{category.label}</p>;
        }

        return category.groups.map((group) => {
          const { checked, partial } = selection(codesOf(group.rights), selected);
          if (checked) return <p key={group.id}>{group.label}</p>;
          if (!partial) return null;

          return (
            <details key={group.id} className="rounded-lg border border-white/10 p-2">
              <summary className="cursor-pointer">{group.label} · Partiel</summary>
              <ul className="mt-2 space-y-1 pl-4 text-xs">
                {group.rights.map((right) => {
                  const allowed = right.permissions.filter(({ code }) => selected.includes(code));
                  if (allowed.length === 0) return null;
                  if (allowed.length === right.permissions.length) return <li key={right.id}>{right.label}</li>;
                  return (
                    <li key={right.id}>
                      {right.label} · Droits historiques partiels
                      <ul className="ml-4 list-disc">
                        {allowed.map(({ code, label }) => <li key={code}>{label}</li>)}
                      </ul>
                    </li>
                  );
                })}
              </ul>
            </details>
          );
        });
      })}
    </div>
  );
}
