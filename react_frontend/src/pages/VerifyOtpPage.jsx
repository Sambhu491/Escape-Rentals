import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";

import AuthLayout from "../components/auth/AuthLayout";
import Input from "../components/auth/Input";
import img from "../assets/img21.jpg"; 

import {
  verifyOtp,
  resendOtp,
  OTP_PURPOSE,
  clearOtpErrors,
  resetOtpState,
  clearSuccessMessage,
  selectIsVerifyingOtp,
  selectIsResendingOtp,
  selectVerifyOtpError,
  selectResendOtpError,
  selectVerifyOtpSucceeded,
  selectOtpSuccessMessage,
  selectOtpAuthData,
} from "../redux/otp/otpSlice";

import { setAuthFromOtp } from "../redux/auth/authSlice";

const VerifyOtpSchema = Yup.object().shape({
  otpCode: Yup.string()
    .matches(/^\d+$/, "OTP must contain only numbers")
    .length(6, "OTP must be exactly 6 digits")
    .required("OTP is required"),
});

export default function VerifyOtpPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const email =
location.state?.email ||
JSON.parse(
 localStorage.getItem("pendingRegistration")
)?.email;


  const isVerifying = useSelector(selectIsVerifyingOtp);
  const isResending = useSelector(selectIsResendingOtp);
  const verifyError = useSelector(selectVerifyOtpError);
  const resendError = useSelector(selectResendOtpError);
  const isVerifySuccess = useSelector(selectVerifyOtpSucceeded);
  const successMessage = useSelector(selectOtpSuccessMessage);
  const authData = useSelector(selectOtpAuthData);

  useEffect(() => {
    if (!email) {
      // Fallback if navigated without state
      navigate("/register"); 
    }
    dispatch(clearOtpErrors());
    dispatch(clearSuccessMessage());
  }, [dispatch, email, navigate]);

  const formik = useFormik({
    initialValues: { otpCode: "" },
    validationSchema: VerifyOtpSchema,
    onSubmit: (values) => {
      dispatch(verifyOtp({ email, otpCode: values.otpCode }));
    },
  });

  useEffect(() => {
    if (isVerifySuccess && authData) {
      // Sync OTP auth data to Auth slice and redirect to home
      dispatch(setAuthFromOtp(authData));
      navigate("/");
    }
  }, [isVerifySuccess, authData, dispatch, navigate]);

  useEffect(()=>{
 return ()=>{
    dispatch(resetOtpState());
 };
},[dispatch]);


  const handleResend = () => {
    dispatch(resendOtp({ email, purpose: OTP_PURPOSE.REGISTRATION }));
  };

  const error = verifyError || resendError;

  return (
    <AuthLayout
      formTopLabel="Verification"
      formHeading="Confirm your"
      formHeadingHighlight="email."
      heroSubLabel="Secure access"
      img={img}
    >
      <div className="mb-6 text-center text-sm text-neutral-500">
        We've sent a 6-digit code to <span className="font-medium text-black">{email}</span>
      </div>


     <div
      className="h-11 mb-3"
      >
        {error && (
        <div className="rounded 
        bg-red-50 p-3 text-center 
        text-xs text-red-600">
          {error}
        </div>
      )}
      </div>


      {successMessage && (
        <div className="mb-6 rounded bg-green-50 p-3 
        text-center text-xs text-green-700">
          {successMessage}
        </div>
      )}

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <Input label="6-Digit OTP Code" name="otpCode" type="text" formik={formik} />

        <button
          disabled={isVerifying}
          className="mt-4 w-full rounded-sm 
          bg-black py-2 md:py-3 text-sm 
          text-white hover:bg-neutral-800 
          cursor-pointer
          transition disabled:opacity-70"
        >
          {isVerifying ? "Verifying..." : "Verify Account"}
        </button>
      </form>

      <div className="mt-5 text-center">
        <p className="text-xs text-neutral-500">
          Didn't receive the code?
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="ml-2 font-medium text-black 
            cursor-pointer
            underline disabled:opacity-50"
          >
            {isResending ? "Sending..." : "Resend OTP"}
          </button>
        </p>

        <p
        className="text-xs mt-2
        bg-amber-200/80 border border-amber-500
        shadow-sm rounded-xl"
        >
          Didn't Recieved OTP yet? Please check spam folder.
        </p>

      </div>
    </AuthLayout>
  );
}