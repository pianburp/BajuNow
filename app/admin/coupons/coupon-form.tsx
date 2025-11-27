"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

interface CouponFormProps {
  initialData?: {
    id?: string;
    code: string;
    discount_type: 'percentage' | 'fixed' | 'shipping';
    discount_value: number;
    is_active: boolean;
    expires_at: string | null;
  };
  isEditing?: boolean;
}

export default function CouponForm({ initialData, isEditing = false }: CouponFormProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    code: initialData?.code || "",
    discount_type: initialData?.discount_type || "percentage",
    discount_value: initialData?.discount_value || "",
    is_active: initialData?.is_active ?? true,
    expires_at: initialData?.expires_at ? new Date(initialData.expires_at).toISOString().split('T')[0] : "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const couponData = {
        code: formData.code.toUpperCase(),
        discount_type: formData.discount_type,
        discount_value: formData.discount_type === 'shipping' ? 0 : parseFloat(formData.discount_value.toString()),
        is_active: formData.is_active,
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
      };

      if (isEditing && initialData?.id) {
        const { error } = await supabase
          .from('coupons')
          .update(couponData)
          .eq('id', initialData.id);
        
        if (error) throw error;
        toast({ title: "Success", description: "Coupon updated successfully", variant: "success" });
      } else {
        const { error } = await supabase
          .from('coupons')
          .insert([couponData]);
        
        if (error) throw error;
        toast({ title: "Success", description: "Coupon created successfully", variant: "success" });
      }

      router.push('/admin/products');
      router.refresh();
    } catch (error: any) {
      console.error('Error saving coupon:', error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to save coupon", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/products">
          <Button variant="ghost" className="pl-0 hover:pl-0 hover:bg-transparent">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mt-2">{isEditing ? 'Edit Coupon' : 'Create Coupon'}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coupon Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="code">Coupon Code</Label>
              <Input
                id="code"
                placeholder="e.g. SUMMER2025"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount_type">Discount Type</Label>
                <select
                  id="discount_type"
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.discount_type}
                  onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (RM)</option>
                  <option value="shipping">Free Shipping</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_value">Value</Label>
                <Input
                  id="discount_value"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                  required={formData.discount_type !== 'shipping'}
                  disabled={formData.discount_type === 'shipping'}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expires_at">Expiration Date (Optional)</Label>
              <Input
                id="expires_at"
                type="date"
                value={formData.expires_at}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked as boolean })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Coupon
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
