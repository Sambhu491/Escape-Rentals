import { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiX, FiShield, FiLoader, FiCreditCard } from "react-icons/fi";
import {
  createOrder,
  verifyPayment,
  clearOrderData,
  clearPaymentErrors,
  selectOrderData,
  selectIsCreatingOrder,
  selectIsVerifyingPayment,
  selectPaymentMutationError,
} from "../../redux/payment/paymentSlice";
import { formatCurrency } from "../../dataFile/currency";

// Loads the Razorpay Checkout.js SDK once and caches the promise
let razorpayScriptPromise = null;
const loadRazorpayScript = () => {
  if (window.Razorpay) return Promise.resolve(true);
  if (razorpayScriptPromise) return razorpayScriptPromise;

  razorpayScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Failed to initialize secure payment engine."));
    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
};

const PaymentCheckoutModal = ({ open, onClose, booking, onPaid }) => {
  const dispatch = useDispatch();

  const orderData = useSelector(selectOrderData);
  const isCreatingOrder = useSelector(selectIsCreatingOrder);
  const isVerifying = useSelector(selectIsVerifyingPayment);
  const mutationError = useSelector(selectPaymentMutationError);

  const [scriptError, setScriptError] = useState(null);
  const [checkoutActive, setCheckoutActive] = useState(false);
  
  // Tracks the live third-party modal window reference safely across frames
  const razorpayInstanceRef = useRef(null);

  // [Fix 1]: Consolidated close handler clearing local states, DOM frames, and Redux artifacts
  const handleClose = useCallback(() => {
    if (razorpayInstanceRef.current) {
      try {
        razorpayInstanceRef.current.close();
      } catch (err) {
        console.warn("Razorpay instance cleanup bypassed:", err);
      }
      razorpayInstanceRef.current = null;
    }
    
    setCheckoutActive(false);
    setScriptError(null);
    dispatch(clearOrderData());
    dispatch(clearPaymentErrors());
    onClose?.();
  }, [dispatch, onClose]);

  // Global component unmount cleanup shield
  useEffect(() => {
    return () => {
      if (razorpayInstanceRef.current) {
        try {
          razorpayInstanceRef.current.close();
        } catch (e) {
          // Dynamic fail-safe drop
        }
      }
    };
  }, []);

  // Synchronize modal state lifecycle and trigger order pipeline generation
  useEffect(() => {
    if (open && booking?.id) {
      dispatch(clearPaymentErrors());
      dispatch(clearOrderData());
      setScriptError(null);
      setCheckoutActive(false);
      
      loadRazorpayScript().catch((err) => setScriptError(err.message));
      dispatch(createOrder(booking.id));
    }
  }, [open, booking?.id, dispatch]);

  // Handle document scroll lock mechanics cleanly
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // [Fix 3]: Added checkoutActive guard constraint preventing duplicated gateway creation loops
  const launchRazorpay = useCallback(async () => {
    if (!orderData || checkoutActive) return;

    try {
      await loadRazorpayScript();
    } catch (err) {
      setScriptError(err.message);
      return;
    }

    setCheckoutActive(true);

    const razorpay = new window.Razorpay({
      key: orderData.key,
      amount: orderData.amount,
      currency: orderData.currency,
      order_id: orderData.orderId,
      name: "Escape Rentals",
      description: booking?.propertyTitle || "Secure Accommodation Booking",
      theme: { color: "#171717" },
      handler: (response) => {
        setCheckoutActive(false);
        dispatch(
          verifyPayment({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          }),
        ).then((result) => {
          if (verifyPayment.fulfilled.match(result)) {
            onPaid?.();
            handleClose();
          }
        });
      },
      modal: {
        ondismiss: () => {
          setCheckoutActive(false);
          razorpayInstanceRef.current = null;
        },
      },
    });

    razorpay.on("payment.failed", () => {
      setCheckoutActive(false);
      razorpayInstanceRef.current = null;
    });

    try {
      razorpayInstanceRef.current = razorpay;
      razorpay.open();
    } catch (error) {
      setCheckoutActive(false);
      razorpayInstanceRef.current = null;
      setScriptError("Payment window blocked. Please click the button below to pay.");
    }
  }, [orderData, checkoutActive, booking, dispatch, onPaid, handleClose]);

  // [Fix 2]: The dangerous auto-launch useEffect block has been completely purged. 
  // Custom manual click events below now drive the payment gateway execution reliably.

  if (!open) return null;

  const errorMessage = scriptError || mutationError?.createOrder || mutationError?.verify;
  const isBusy = isCreatingOrder || isVerifying;

  return (
    <div className="fixed inset-0 z-[110] flex items-end md:items-center justify-center p-0 md:p-4 animate-fade-in">
      {/* Background overlay bound to uniform cleanup operations */}
      <div className="absolute inset-0 bg-neutral-950/40 backdrop-blur-[2px]" onClick={handleClose} />

      <div className="relative w-full md:max-w-[400px] bg-white shadow-2xl rounded-t-2xl md:rounded-xl overflow-hidden border border-neutral-200/40">
        <header className="flex items-center justify-between px-6 py-4 bg-gradient-to-b from-neutral-50/50 to-neutral-50 border-b border-neutral-200/60">
          <div>
            <h2 className="text-[14px] font-semibold text-neutral-900 tracking-tight">
              Complete Booking Payment
            </h2>
            <p className="text-[11px] text-neutral-400 font-medium mt-0.5 truncate max-w-[240px]">
              {booking?.propertyTitle}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors duration-150 cursor-pointer"
            aria-label="Close panel"
          >
            <FiX size={16} />
          </button>
        </header>

        <div className="px-6 py-6 space-y-4">
          <div className="rounded-xl bg-neutral-50 border border-neutral-200/60 p-4 flex items-center justify-between">
            <span className="text-[12px] text-neutral-500 font-medium">Aggregate collection due</span>
            <span className="text-[16px] font-bold text-neutral-900 tracking-tight">
              {formatCurrency(booking?.totalPrice)}
            </span>
          </div>

          {errorMessage && (
            <p className="text-[12px] font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 leading-relaxed">
              {errorMessage}
            </p>
          )}

          {isBusy && (
            <div className="flex items-center justify-center gap-2 text-[12px] text-neutral-500 font-medium py-3 border border-dashed border-neutral-200 rounded-xl bg-neutral-50/30">
              <FiLoader size={13} className="animate-spin text-neutral-900" />
              <span>{isCreatingOrder ? "Constructing secure tunnel..." : "Verifying transactional signature..."}</span>
            </div>
          )}

          {!isBusy && orderData && (
            <button
              onClick={launchRazorpay}
              disabled={checkoutActive}
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-neutral-900 text-white text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-neutral-800 shadow-xs active:scale-[0.99] transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <FiCreditCard size={13} />
              {checkoutActive ? "Gateway Window Open..." : "Proceed to Secure Payment"}
            </button>
          )}

          {/* [Fix 4]: Resets both state trees concurrently before attempting order re-generation handshakes */}
          {errorMessage && !isBusy && (
            <button
              onClick={() => {
                setCheckoutActive(false);
                dispatch(clearOrderData());
                dispatch(clearPaymentErrors());
                if (booking?.id) {
                  dispatch(createOrder(booking.id));
                }
              }}
              className="w-full py-3 rounded-lg border border-neutral-300 bg-white text-neutral-700 text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-neutral-50 shadow-xs active:scale-[0.99] transition-all cursor-pointer"
            >
              Retry Pipeline Handshake
            </button>
          )}

          <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 justify-center font-medium tracking-wide pt-1">
            <FiShield size={12} className="text-neutral-400" />
            End-to-End Encryption · Razorpay Secure
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCheckoutModal;