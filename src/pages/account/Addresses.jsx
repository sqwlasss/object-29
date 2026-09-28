import { useState } from "react";
import { MapPin, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useAccount } from "@/lib/AccountContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import CountrySelect from "@/components/ui/country-select";
import AddressAutocomplete from "@/components/ui/address-autocomplete";

const emptyAddress = {
  address1: "",
  address2: "",
  city: "",
  province: "",
  zip: "",
  country: "",
  phone: "",
  firstName: "",
  lastName: "",
};

export default function Addresses() {
  const { customer, addAddress, editAddress, removeAddress, setDefaultAddress, loading } = useAccount();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyAddress);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const addressList = customer?.addresses || [];

  const handlePlaceSelect = (details) => {
    setForm((prev) => ({
      ...prev,
      address1: details.address1 || prev.address1,
      address2: details.address2 || prev.address2,
      city: details.city || prev.city,
      province: details.province || prev.province,
      zip: details.zip || prev.zip,
      country: details.country || prev.country,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await editAddress(editingId, form);
        toast({ title: "Address updated" });
      } else {
        await addAddress(form);
        toast({ title: "Address added" });
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyAddress);
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (addr) => {
    setForm({
      address1: addr.address1 || "",
      address2: addr.address2 || "",
      city: addr.city || "",
      province: addr.province || "",
      zip: addr.zip || "",
      country: addr.country || "",
      phone: addr.phone || "",
      firstName: addr.firstName || "",
      lastName: addr.lastName || "",
    });
    setEditingId(addr.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await removeAddress(id);
      toast({ title: "Address removed" });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultAddress(id);
      toast({ title: "Default address updated" });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-o29-ink">Addresses</h2>
        {!showForm && (
          <Button
            onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyAddress); }}
            variant="outline"
            size="sm"
          >
            <Plus size={14} className="mr-1" />
            Add address
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border border-o29-rule p-5 mb-6 space-y-4 max-w-lg">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="addr-first">First name</Label>
              <Input
                id="addr-first"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                placeholder="First name"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="addr-last">Last name</Label>
              <Input
                id="addr-last"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                placeholder="Last name"
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="addr-line1">Address line 1</Label>
            <AddressAutocomplete
              id="addr-line1"
              value={form.address1}
              onChange={(value) => setForm({ ...form, address1: value })}
              onPlaceSelect={handlePlaceSelect}
              placeholder="Street address"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="addr-line2">Address line 2 (optional)</Label>
            <Input
              id="addr-line2"
              value={form.address2}
              onChange={(e) => setForm({ ...form, address2: e.target.value })}
              placeholder="Apartment, suite, etc."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="addr-city">City</Label>
              <Input
                id="addr-city"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="City"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="addr-province">Province / State</Label>
              <Input
                id="addr-province"
                value={form.province}
                onChange={(e) => setForm({ ...form, province: e.target.value })}
                placeholder="Province"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="addr-zip">Postal code</Label>
              <Input
                id="addr-zip"
                value={form.zip}
                onChange={(e) => setForm({ ...form, zip: e.target.value })}
                placeholder="ZIP / Postal code"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="addr-country">Country</Label>
              <CountrySelect
                id="addr-country"
                value={form.country}
                onChange={(value) => setForm({ ...form, country: value })}
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="addr-phone">Phone (optional)</Label>
            <Input
              id="addr-phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+373 123 456 789"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
              ) : editingId ? (
                "Update address"
              ) : (
                "Add address"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyAddress); }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-o29-slate" />
        </div>
      ) : addressList.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-o29-rule">
          <MapPin size={32} className="mx-auto text-o29-rule mb-3" />
          <p className="text-sm text-o29-slate">No addresses saved yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addressList.map((addr) => {
            const isDefault = customer?.defaultAddress?.id === addr.id;
            return (
              <div
                key={addr.id}
                className={`border p-5 relative ${isDefault ? "border-o29-ink" : "border-o29-rule"}`}
              >
                {isDefault && (
                  <span className="absolute top-3 right-3 text-xs uppercase tracking-[0.1em] bg-o29-ink text-o29-bone px-2 py-0.5">
                    Default
                  </span>
                )}
                <p className="text-sm font-medium text-o29-ink mb-1">
                  {addr.fullName || "No name"}
                </p>
                <p className="text-sm text-o29-slate leading-relaxed">
                  {addr.fullAddress}
                </p>
                {addr.phone && (
                  <p className="text-xs text-o29-slate mt-1">{addr.phone}</p>
                )}
                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-o29-rule">
                  <button
                    onClick={() => startEdit(addr)}
                    className="flex items-center gap-1 text-[11px] uppercase tracking-[0.1em] text-o29-slate hover:text-o29-ink transition-colors"
                  >
                    <Pencil size={12} />
                    Edit
                  </button>
                  {!isDefault && (
                    <>
                      <button
                        onClick={() => handleSetDefault(addr.id)}
                        className="text-[11px] uppercase tracking-[0.1em] text-o29-slate hover:text-o29-ink transition-colors"
                      >
                        Set as default
                      </button>
                      <button
                        onClick={() => handleDelete(addr.id)}
                        disabled={deleting === addr.id}
                        className="flex items-center gap-1 text-[11px] uppercase tracking-[0.1em] text-red-600 hover:text-red-800 transition-colors"
                      >
                        {deleting === addr.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Trash2 size={12} />
                        )}
                        Remove
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
