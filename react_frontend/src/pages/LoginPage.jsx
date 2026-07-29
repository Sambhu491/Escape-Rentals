import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { IoEyeSharp } from "react-icons/io5";
import { FaEyeSlash } from "react-icons/fa";

import AuthLayout from "../components/auth/AuthLayout";
import Input from "../components/auth/Input"; 
import img from "../assets/img18.jpg";

import { loginUser, 
  clearAuthErrors, 
  selectIsLoggingIn, 
  selectLoginError, 
  selectLoginSucceeded } 
from "../redux/auth/authSlice";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const isLoading = useSelector(selectIsLoggingIn);
  const error = useSelector(selectLoginError);
  const isSuccess = useSelector(selectLoginSucceeded);

  useEffect(() => { dispatch(clearAuthErrors()); }, [dispatch]);

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: LoginSchema,
    onSubmit: (values) => { dispatch(loginUser(values)); },
  });

  useEffect(() => {
    if (isSuccess) navigate("/"); 
  }, [isSuccess, navigate]);

  return (
    <AuthLayout
      formTopLabel="Welcome Back"
      formHeading="Sign in to your"
      formHeadingHighlight="account."
      heroSubLabel="Welcome Back"
      img={img}
    >
      
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

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <Input label="Email Address" name="email" formik={formik} />
        <Input 
          label="Password" 
          name="password" 
          type={showPassword ? "text" : "password"}
          formik={formik}
          rightElement={
            <div className="flex items-center gap-3">
              {/* Show/Hide Toggle */}
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

              <span className="text-neutral-300">|</span>

              {/* Forgot Link */}
              <Link to="/forgot-password" 
                className="text-[11px] md:text-[12px]
                text-neutral-500 
                hover:text-black 
                underline underline-offset-2">
                Forgot?
              </Link>
            </div>
          }
        />

        <button
          disabled={isLoading}
          className="mt-4 w-full rounded-sm 
          bg-black py-2 md:py-3 
          text-sm text-white cursor-pointer
          hover:bg-neutral-800 
          transition disabled:opacity-70"
        >
          {isLoading ? "Logging In..." : "Login In"}
        </button>
      </form>

      <p className="mt-3 text-center 
      text-xs text-neutral-500">
        Don't have an account?
        <Link to="/register" className="ml-2 
        font-medium text-black underline">
          Create Account
        </Link>
      </p>
    </AuthLayout>
  );
}