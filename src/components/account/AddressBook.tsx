"use client";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { clean, SelectField, TextField } from "@/components/ui/Form";
import { Modal } from "@/components/ui/Modal";
import { isPhone } from "@/lib/adapters/auth";
import { persistUserPatch } from "@/lib/adapters/auth";
import { PROVINCES } from "@/lib/config";
import type { Address } from "@/lib/types";
import { useAuth, useUI } from "@/store";

const blank = (name = "", phone = ""): Address => ({ id: "", label: "Home", fullName: name, phone, address: "", city: "", province: "", postalCode: "" });

export function AddressBook() {
  const user = useAuth((s) => s.user)!;
  const save = useAuth((s) => s.saveAddress);
  const remove = useAuth((s) => s.removeAddress);
  const toast = useUI((s) => s.toast);
  const [editing, setEditing] = useState<Address | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sync = () => { const u = useAuth.getState().user; if (u) persistUserPatch(u); };
  const set = <K extends keyof Address>(k: K, v: Address[K]) => { setEditing((a) => (a ? { ...a, [k]: v } : a)); setErrors((e) => ({ ...e, [k]: "" })); };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const er: Record<string, string> = {};
    if (clean(editing.fullName).length < 2) er.fullName = "Enter the recipient's name.";
    if (!isPhone(editing.phone)) er.phone = "Enter a valid phone number.";
    if (clean(editing.address).length < 8) er.address = "Enter the full street address.";
    if (clean(editing.city).length < 2) er.city = "Enter the city.";
    if (!editing.province) er.province = "Select a province.";
    if (!/^\d{4,6}$/.test(editing.postalCode)) er.postalCode = "Enter a valid postal code.";
    setErrors(er);
    if (Object.keys(er).length) return;
    const a: Address = { ...editing, id: editing.id || crypto.randomUUID(), fullName: clean(editing.fullName, 80), phone: clean(editing.phone, 20), address: clean(editing.address, 250), city: clean(editing.city, 80), label: clean(editing.label, 24) || "Address" };
    save(a); sync();
    toast({ kind: "success", title: editing.id ? "Address updated" : "Address saved" });
    setEditing(null);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl">Saved addresses</h2>
        <Button size="sm" icon={<Plus className="size-4" />} onClick={() => { setErrors({}); setEditing(blank(user.fullName, user.phone)); }}>Add address</Button>
      </div>
      {user.addresses.length === 0 ? (
        <EmptyState icon={MapPin} title="No saved addresses" message="Add an address to check out faster next time." className="py-10" />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {user.addresses.map((a) => (
            <li key={a.id} className="rounded-2xl border border-line bg-elev p-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">{a.label}</p>
              <address className="mt-2 text-sm not-italic leading-relaxed text-muted">
                <span className="font-semibold text-fg">{a.fullName}</span><br />{a.address}<br />{a.city}, {a.province} {a.postalCode}<br />{a.phone}
              </address>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" icon={<Pencil className="size-3.5" />} onClick={() => { setErrors({}); setEditing(a); }}>Edit</Button>
                <Button variant="ghost" size="sm" icon={<Trash2 className="size-3.5" />} onClick={() => { remove(a.id); sync(); toast({ kind: "info", title: "Address removed" }); }} aria-label={`Delete ${a.label} address`}>Delete</Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit address" : "New address"}>
        {editing && (
          <form onSubmit={submit} noValidate className="space-y-4 p-1">
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField label="Label" value={["Home", "Work"].includes(editing.label) ? editing.label : "Other"} onChange={(e) => set("label", e.target.value)}><option>Home</option><option>Work</option><option>Other</option></SelectField>
              <TextField label="Full name" required value={editing.fullName} maxLength={80} onChange={(e) => set("fullName", e.target.value)} error={errors.fullName} autoComplete="name" data-autofocus />
            </div>
            <TextField label="Phone" required type="tel" value={editing.phone} maxLength={20} onChange={(e) => set("phone", e.target.value)} error={errors.phone} autoComplete="tel" />
            <TextField label="Address" required value={editing.address} maxLength={250} onChange={(e) => set("address", e.target.value)} error={errors.address} autoComplete="street-address" />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="City" required value={editing.city} maxLength={80} onChange={(e) => set("city", e.target.value)} error={errors.city} autoComplete="address-level2" />
              <SelectField label="Province" required value={editing.province} onChange={(e) => set("province", e.target.value)} error={errors.province}>
                <option value="">Select…</option>{PROVINCES.map((p) => <option key={p}>{p}</option>)}
              </SelectField>
            </div>
            <TextField label="Postal code" required inputMode="numeric" value={editing.postalCode} maxLength={6} onChange={(e) => set("postalCode", e.target.value.replace(/\D/g, ""))} error={errors.postalCode} className="sm:max-w-[50%]" autoComplete="postal-code" />
            <div className="flex gap-3 pt-2"><Button type="submit">Save address</Button><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button></div>
          </form>
        )}
      </Modal>
    </div>
  );
}
