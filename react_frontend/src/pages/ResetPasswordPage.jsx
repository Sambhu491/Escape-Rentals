import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { IoEyeSharp } from "react-icons/io5";
import { FaEyeSlash } from "react-icons/fa";

import AuthLayout from "../components/auth/AuthLayout";
import Input from "../components/auth/Input";
import img from "../assets/img14.jpg";

import {
  resetPassword,
  resendOtp,
  OTP_PURPOSE,
  clearOtpState,
  resetOtpState,
  selectIsResettingPassword,
  selectIsResendingOtp,
  selectResetPasswordError,
  selectResendOtpError,
  selectResetPasswordSucceeded,
  selectOtpSuccessMessage,
  selectPasswordResetEmail,
} from "../redux/otp/otpSlice";

const ResetPasswordSchema = Yup.object().shape({
  otpCode: Yup.string()
    .matches(/^\d+$/, "OTP must contain only numbers")
    .length(6, "OTP must be exactly 6 digits")
    .required("OTP is required"),
  newPassword: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .max(255, "Maximum 255 characters")
    .required("New password is required"),
});

export default function ResetPasswordPage() {

  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const email = useSelector(selectPasswordResetEmail);

  

  const isResetting = useSelector(selectIsResettingPassword);
  const isResending = useSelector(selectIsResendingOtp);
  const resetError = useSelector(selectResetPasswordError);
  const resendError = useSelector(selectResendOtpError);
  const isResetSuccess = useSelector(selectResetPasswordSucceeded);
  const successMessage = useSelector(selectOtpSuccessMessage);

  useEffect(() => {
    if (!email) {
      // Prevent direct access without email context
      navigate("/login",{ replace: true }); 
    }
    dispatch(resetOtpState());
  }, [dispatch, email, navigate]);

  const formik = useFormik({
    initialValues: { otpCode: "", newPassword: "" },
    validationSchema: ResetPasswordSchema,
    onSubmit: (values) => {
      dispatch(resetPassword({ email, ...values }));
    },
  });

 useEffect(() => {
    if (!isResetSuccess) return;

    const timer = setTimeout(() => {
      dispatch(clearOtpState());   
        navigate("/login", { replace: true });
    }, 2000);

    return () => clearTimeout(timer);
}, [dispatch,isResetSuccess, navigate]);


  const handleResend = () => {
    dispatch(resendOtp({ email, purpose: OTP_PURPOSE.PASSWORD_RESET }));
  };

  const error = resetError || resendError;
  const displaySuccessMessage = isResetSuccess ? "Password reset successfully. Redirecting to login..." : successMessage;

  return (
    <AuthLayout
      formTopLabel="Security"
      formHeading="Create new"
      formHeadingHighlight="password."
      heroSubLabel="Stay secure"
      img={img}
    >
      <div className="mb-6 text-center text-sm text-neutral-500">
        Enter the 6-digit code sent to <span className="font-medium text-black">{email}</span> and your new password.
      </div>

<div className="mb-6 min-h-[48px]">
  {error && (
    <div className="rounded bg-red-50 p-3 text-center text-xs text-red-600">
      {error}
    </div>
  )}

  {!error && displaySuccessMessage && (
    <div className="rounded bg-green-50 p-3 text-center text-xs text-green-700">
      {displaySuccessMessage}
    </div>
  )}
</div>

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <Input label="6-Digit OTP Code" name="otpCode" type="text" formik={formik} />
        
        <Input 
        label="New Password" 
        name="newPassword" 
         type={showPassword ? "text" : "password"}
        formik={formik} 
        rightElement={
              <button
                type="button"
                onClick={() => 
                  setShowPassword((prev) => !prev)}
                className="text-xs text-neutral-500 
                hover:text-black flex items-center 
                gap-1 transition cursor-pointer"
              >
                {showPassword ? (
                  <>
                    <FaEyeSlash size={18}/>
                  </>
                ) : (
                  <>
                    <IoEyeSharp size={18}/>
                  </>
                )}
              </button>
            } 
        />

        <button
          disabled={isResetting || isResetSuccess}
          className="mt-4 w-full rounded-sm 
          bg-black py-2 md:py-3 text-sm 
          text-white hover:bg-neutral-800 
          transition disabled:opacity-70
          cursor-pointer
          "
        >
          {isResetting ? "Updating Password..." : "Reset Password"}
        </button>
      </form>

      <div className="mt-5 text-center">
        <p className="text-xs text-neutral-500">
          Didn't receive the code?
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || isResetSuccess}
            className="ml-2 font-medium cursor-pointer 
            text-black underline disabled:opacity-50"
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