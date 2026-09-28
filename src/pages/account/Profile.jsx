import { useState, useEffect } from "react";
import { useAccount } from "@/lib/AccountContext";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, User, Phone, Loader2, Save } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function Profile() {
  const { customer, updateProfile, loading } = useAccount();
  const { user: firebaseUser } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (customer) {
      setFirstName(customer.firstName || "");
      setLastName(customer.lastName || "");
      setPhone(customer.phone || "");
    }
  }, [customer]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ firstName, lastName, phone });
      toast({ title: "Profile updated", description: "Your changes have been saved." });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-medium text-o29-ink mb-6">Profile</h2>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-o29-slate" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6 max-w-lg">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-o29-slate" />
              <Input
                id="email"
                value={customer?.email || firebaseUser?.email || ""}
                disabled
                className="pl-10 h-11 bg-o29-bone-2"
              />
            </div>
            <p className="text-[11px] text-o29-slate">Email cannot be changed.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-o29-slate" />
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="pl-10 h-11"
                  placeholder="First name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="h-11"
                placeholder="Last name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-o29-slate" />
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10 h-11"
                placeholder="+373 123 456 789"
              />
            </div>
          </div>

          <Button type="submit" disabled={saving || loading} className="h-11 px-6">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                Save changes
              </>
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
