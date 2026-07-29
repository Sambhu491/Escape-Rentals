import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";

import AuthLayout from "../components/auth/AuthLayout";
import Input from "../components/auth/Input";
import img from "../assets/img17.jpg";

import {
  forgotPassword,
  resetOtpState,
  selectIsSendingForgotPassword,
  selectForgotPasswordError,
} from "../redux/otp/otpSlice";

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email address").required("Email is required"),
});

export default function ForgotPasswordPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isLoading = useSelector(selectIsSendingForgotPassword);
  const error = useSelector(selectForgotPasswordError);

  useEffect(() => {
    dispatch(resetOtpState());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema: ForgotPasswordSchema,
    onSubmit: (values) => {
      dispatch(forgotPassword(values))
        .unwrap()
        .then(() => {
          navigate("/reset-password", { state: { email: values.email } });
        })
        .catch(() => {});
    },
  });

  return (
    <AuthLayout
      formTopLabel="Recovery"
      formHeading="Reset your"
      formHeadingHighlight="password."
      heroSubLabel="Account recovery"
      img={img}
    >
      <div className="mb-6 text-center text-sm text-neutral-500">
        Enter the email address associated with your account and we'll send you a code to reset your password.
      </div>

      <div className="mb-6 min-h-[48px]">
        {error && (
          <div className="rounded bg-red-50 p-3 text-center text-xs text-red-600">
            {error}
          </div>
        )}
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <Input label="Email Address" name="email" formik={formik} />

        <button
          disabled={isLoading}
          className="mt-4 w-full rounded-sm bg-black 
          py-2 md:py-3 text-sm text-white 
          hover:bg-neutral-800 
          transition disabled:opacity-70
          cursor-pointer"
        >
          {isLoading ? "Sending Code..." : "Send Reset Code"}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-neutral-500">
        Remember your password?
        <Link to="/login" className="ml-2 font-medium text-black underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}