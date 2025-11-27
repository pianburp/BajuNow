"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  CreditCard, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Gift,
  Receipt,
  ShirtIcon
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createOrder } from "./actions";

interface CartItem {
  id: string;
  variantId: string;
  name: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
  image: string;
}

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed' | 'shipping';
  discount_value: number;
  description?: string;
}

interface PaymentClientProps {
  cartItems: CartItem[];
  userEmail: string;
  initialCoupons: Coupon[];
}

export default function PaymentClient({ cartItems, userEmail, initialCoupons }: PaymentClientProps) {
  const [selectedCoupon, setSelectedCoupon] = useState("");
  const [customCoupon, setCustomCoupon] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<"success" | "failed" | null>(null);
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: ""
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [cardType, setCardType] = useState<string | null>(null);
  const router = useRouter();

  const detectCardType = (number: string) => {
    const cleanNum = number.replace(/\s/g, "");
    if (/^4/.test(cleanNum)) return "visa";
    if (/^5[1-5]/.test(cleanNum)) return "mastercard";
    if (/^3[47]/.test(cleanNum)) return "amex";
    return null;
  };

  const validateCardNumber = (number: string) => {
    const cleanNum = number.replace(/\s/g, "");
    
    // Strict patterns for validation
    const patterns = {
      visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
      mastercard: /^5[1-5][0-9]{14}$/,
      amex: /^3[47][0-9]{13}$/
    };

    if (patterns.visa.test(cleanNum)) return "visa";
    if (patterns.mastercard.test(cleanNum)) return "mastercard";
    if (patterns.amex.test(cleanNum)) return "amex";
    
    return null;
  };

  const validateDate = (date: string) => {
    if (!/^\d{2}\/\d{2}$/.test(date)) return false;
    const [month, year] = date.split('/').map(Number);
    if (month < 1 || month > 12) return false;
    
    const now = new Date();
    const currentYear = parseInt(now.getFullYear().toString().slice(-2));
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;
    
    return true;
  };

  const validateCVV = (cvv: string, type: string | null) => {
    const cleanCVV = cvv.replace(/\s/g, "");
    if (type === "amex") {
      return /^\d{4}$/.test(cleanCVV);
    }
    return /^\d{3}$/.test(cleanCVV);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove all non-digits
    let value = e.target.value.replace(/\D/g, "");
    
    // Detect type for formatting limits
    const type = detectCardType(value);
    
    // Limit length based on type
    const maxLength = type === "amex" ? 15 : 16;
    value = value.slice(0, maxLength);

    // Format with spaces
    let formatted = "";
    if (type === "amex") {
      // 4-6-5 format
      if (value.length > 0) formatted += value.slice(0, 4);
      if (value.length > 4) formatted += " " + value.slice(4, 10);
      if (value.length > 10) formatted += " " + value.slice(10);
    } else {
      // 4-4-4-4 format
      for (let i = 0; i < value.length; i += 4) {
        if (i > 0) formatted += " ";
        formatted += value.slice(i, i + 4);
      }
    }

    setCardDetails({ ...cardDetails, number: formatted });
    setCardType(type); // Update type state immediately
  };

  useEffect(() => {
    const type = detectCardType(cardDetails.number);
    setCardType(type);
  }, [cardDetails.number]);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const baseShipping = subtotal > 50 ? 0 : 9.99;

  // Apply coupon discount
  let discount = 0;
  let shipping = baseShipping;
  const appliedCoupon = initialCoupons.find(c => c.code === selectedCoupon || c.code === customCoupon);
  
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === "percentage") {
      discount = subtotal * (appliedCoupon.discount_value / 100);
    } else if (appliedCoupon.discount_type === "fixed") {
      discount = appliedCoupon.discount_value;
    } else if (appliedCoupon.discount_type === "shipping") {
      shipping = 0;
    }
  }

  const total = subtotal - discount + tax + shipping;

  const handlePayment = async () => {
    setErrors({});
    setIsProcessing(true);
    
    // Simulate payment processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (paymentMethod === "paypal") {
      // Positive case flow for PayPal
      await processOrder();
      return;
    }

    // Card validation
    const newErrors: { [key: string]: string } = {};
    
    if (!cardType) {
      newErrors.number = "Invalid card number or unsupported card type (Visa, Mastercard, Amex)";
    }
    
    if (!validateDate(cardDetails.expiry)) {
      newErrors.expiry = "Invalid expiry date (MM/YY) or expired";
    }
    
    if (!validateCVV(cardDetails.cvc, cardType)) {
      newErrors.cvc = "Invalid CVV";
    }
    
    if (!cardDetails.name.trim()) {
      newErrors.name = "Cardholder name is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsProcessing(false);
      return;
    }

    await processOrder();
  };

  const processOrder = async () => {
    const result = await createOrder(
      cartItems,
      total,
      discount,
      { address: "123 Mock St, City, Country" }, // Mock address for simulation
      paymentMethod
    );

    if (result.success) {
      setPaymentResult("success");
      // Redirect to success page after 2 seconds
      setTimeout(() => {
        router.push("/user/orders");
      }, 2000);
    } else {
      console.error("Payment failed:", result.error);
      setPaymentResult("failed");
    }
    setIsProcessing(false);
  };

  if (paymentResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        {paymentResult === "success" ? (
          <>
            <div className="text-green-600">
              <CheckCircle className="w-16 h-16 mx-auto mb-4" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2 text-green-600">Payment Successful!</h1>
              <p className="text-muted-foreground mb-4">
                Your order has been confirmed. You will be redirected to your orders page.
              </p>
              <p className="text-sm text-muted-foreground">
                Order Total: RM{total.toFixed(2)}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="text-red-600">
              <XCircle className="w-16 h-16 mx-auto mb-4" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2 text-red-600">Payment Failed</h1>
              <p className="text-muted-foreground mb-6">
                There was an issue processing your payment. Please try again.
              </p>
              <div className="flex gap-4">
                <Button onClick={() => setPaymentResult(null)}>
                  Try Again
                </Button>
                <Link href="/user/cart">
                  <Button variant="outline">Back to Cart</Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/user/cart">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold mb-2">Checkout</h1>
          <p className="text-muted-foreground">
            Complete your purchase securely
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Form */}
        <div className="space-y-6">
          {/* Coupon Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                Apply Coupon
              </CardTitle>
              <CardDescription>Choose a coupon or enter a custom code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Available Coupons */}
              <div className="space-y-2">
                <Label>Available Coupons</Label>
                {initialCoupons.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2">
                    {initialCoupons.map((coupon) => (
                      <label key={coupon.code} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                        <input
                          type="radio"
                          name="coupon"
                          value={coupon.code}
                          checked={selectedCoupon === coupon.code}
                          onChange={(e) => {
                            setSelectedCoupon(e.target.value);
                            setCustomCoupon("");
                          }}
                          className="rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm">{coupon.code}</span>
                            <span className="text-sm text-green-600 font-medium">
                              {coupon.discount_type === "percentage" ? `${coupon.discount_value}% OFF` :
                               coupon.discount_type === "fixed" ? `RM${coupon.discount_value} OFF` :
                               "FREE SHIPPING"}
                            </span>
                          </div>
                          {coupon.description && (
                            <p className="text-xs text-muted-foreground">{coupon.description}</p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No active coupons available at the moment.</p>
                )}
              </div>

              {/* Custom Coupon */}
              <div className="space-y-2">
                <Label htmlFor="customCoupon">Or enter a custom code</Label>
                <div className="flex gap-2">
                  <Input
                    id="customCoupon"
                    placeholder="Enter coupon code"
                    value={customCoupon}
                    onChange={(e) => {
                      setCustomCoupon(e.target.value);
                      setSelectedCoupon("");
                    }}
                  />
                  <Button variant="outline" size="sm" onClick={() => {
                     // Logic to validate custom coupon if needed, currently it just selects it
                     if(customCoupon) {
                       // Could trigger a check here if we wanted to validate non-listed coupons
                     }
                  }}>Apply</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <label className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <CreditCard className="w-5 h-5" />
                  <span>Credit/Debit Card</span>
                </label>
                <label className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'paypal' ? 'border-blue-500 bg-blue-50' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="paypal"
                    checked={paymentMethod === "paypal"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                   {/* Updated PayPal Icon/Logo */}
                   <img 
                     src="https://cdn.brandfetch.io/paypal.com" 
                     alt="PayPal" 
                     className="h-6 w-auto object-contain"
                   />
                </label>
              </div>

              {paymentMethod === "card" && (
                <div className="space-y-4 pt-4 border-t animate-in fade-in slide-in-from-top-2">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <div className="relative">
                        <Input 
                          id="cardNumber" 
                          placeholder="0000 0000 0000 0000" 
                          value={cardDetails.number}
                          onChange={handleCardNumberChange}
                          inputMode="numeric"
                          className={errors.number ? "border-red-500" : ""}
                        />
                         <div className="absolute right-3 top-2.5 flex gap-1">
                          {cardType === "visa" && (
                            <div className="flex items-center justify-center h-5 w-8 bg-white border rounded shadow-sm overflow-hidden">
                              <img src="https://cdn.brandfetch.io/visa.com" alt="Visa" className="w-full h-full object-contain" />
                            </div>
                          )}
                          {cardType === "mastercard" && (
                            <div className="flex items-center justify-center h-5 w-8 bg-white border rounded shadow-sm overflow-hidden">
                              <img src="https://cdn.brandfetch.io/mastercard.com" alt="Mastercard" className="w-full h-full object-contain" />
                            </div>
                          )}
                          {cardType === "amex" && (
                            <div className="flex items-center justify-center h-5 w-8 bg-white border rounded shadow-sm overflow-hidden">
                              <img src="https://cdn.brandfetch.io/americanexpress.com" alt="Amex" className="w-full h-full object-contain" />
                            </div>
                          )}
                        </div>
                      </div>
                      {errors.number && <p className="text-xs text-red-500">{errors.number}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input 
                          id="expiry" 
                          placeholder="MM/YY" 
                          value={cardDetails.expiry}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, '');
                            if (val.length >= 2) {
                                val = val.slice(0, 2) + '/' + val.slice(2, 4);
                            }
                            setCardDetails({...cardDetails, expiry: val});
                          }}
                          maxLength={5}
                          className={errors.expiry ? "border-red-500" : ""}
                        />
                         {errors.expiry && <p className="text-xs text-red-500">{errors.expiry}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input 
                          id="cvv" 
                          placeholder="123" 
                          value={cardDetails.cvc}
                          onChange={(e) => setCardDetails({...cardDetails, cvc: e.target.value})}
                          maxLength={4}
                          className={errors.cvc ? "border-red-500" : ""}
                        />
                        {errors.cvc && <p className="text-xs text-red-500">{errors.cvc}</p>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardName">Name on Card</Label>
                      <Input 
                        id="cardName" 
                        placeholder="John Doe" 
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                        className={errors.name ? "border-red-500" : ""}
                      />
                      {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary & Invoice */}
        <div className="space-y-6">
          {/* Invoice Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Invoice Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Items ({cartItems.length})</h4>
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-2 border-b last:border-b-0">
                    <div className="w-12 h-12 bg-muted rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ShirtIcon className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.size} • {item.color} • Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-sm">RM{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>RM{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span>-RM{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>RM{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `RM${shipping.toFixed(2)}`}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>RM{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Button */}
              <div className="pt-4">
                <Button 
                  onClick={handlePayment} 
                  disabled={isProcessing}
                  className="w-full" 
                  size="lg"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing Payment...
                    </div>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Pay RM{total.toFixed(2)}
                    </>
                  )}
                </Button>
              </div>

              <div className="text-xs text-muted-foreground text-center">
                <p>🔒 Your payment information is secure and encrypted</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
