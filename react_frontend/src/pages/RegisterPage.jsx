import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { IoEyeSharp } from "react-icons/io5";
import { FaEyeSlash } from "react-icons/fa";

import img from "../assets/img1.jpg";
import AuthLayout from "../components/auth/AuthLayout";
import Input from "../components/auth/Input";

import {
  registerUser,
  clearAuthErrors,
  selectIsRegistering,
  selectRegisterError,
  resetRegisterStatus,
  selectRegisterSucceeded,
} from "../redux/auth/authSlice";

const RegisterSchema = Yup.object().shape({
  firstName: Yup.string()
    .max(50, "Maximum 50 characters")
    .required("First name is required"),
  lastName: Yup.string()
    .max(50, "Maximum 50 characters")
    .required("Last name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .max(300, "Maximum 300 characters")
    .required("Email is required"),
  phone: Yup.string()
    .trim()
    .matches(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")
    .required("Phone number is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .max(255, "Maximum 255 characters")
    .required("Password is required"),
  role: Yup.string()
    .oneOf(["ROLE_USER", "ROLE_HOST"], "Invalid role selection")
    .required("Role is required"),
});

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isLoading = useSelector(selectIsRegistering);
  const error = useSelector(selectRegisterError);
  const isSuccess = useSelector(selectRegisterSucceeded);

  useEffect(() => {
    dispatch(clearAuthErrors());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      role: "ROLE_USER",
    },
    validationSchema: RegisterSchema,
    onSubmit: (values) => {
      dispatch(registerUser(values));
    },
  });

  const pendingRegistration = useSelector(
    (state) => state.auth.pendingRegistration,
  );

  useEffect(() => {
    if (isSuccess && pendingRegistration?.email) {
      navigate("/verify-otp", {
        state: {
          email: pendingRegistration.email,
        },
      });
    }
  }, [isSuccess, pendingRegistration, navigate]);

useEffect(()=>{
 return ()=>{
    dispatch(resetRegisterStatus());
 };
},[dispatch]);


  return (
    <AuthLayout
      formTopLabel="Join Us"
      formHeading="Create your"
      formHeadingHighlight="account."
      img={img}
    >
      <div className="h-11 mb-3">
        {error && (
          <div
            className="rounded 
        bg-red-50 p-3 text-center 
        text-xs text-red-600"
          >
            {error}
          </div>
        )}
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="First Name" name="firstName" formik={formik} />
          <Input label="Last Name" name="lastName" formik={formik} />
        </div>

        <Input label="Email Address" name="email" formik={formik} />

        <Input label="Phone Number" name="phone" formik={formik} />

        <Input
          label="Password"
          name="password"
          type={showPassword ? "text" : "password"}
          formik={formik}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-xs text-neutral-500 
                hover:text-black flex items-center 
                gap-1 transition cursor-pointer"
            >
              {showPassword ? (
                <>
                  <FaEyeSlash size={18} />
                </>
              ) : (
                <>
                  <IoEyeSharp size={18} />
                </>
              )}
            </button>
          }
        />

        <div className="flex gap-3 items-start pt-1">
          <input
            type="checkbox"
            checked={formik.values.role === "ROLE_HOST"}
            onChange={(e) =>
              formik.setFieldValue(
                "role",
                e.target.checked ? "ROLE_HOST" : "ROLE_USER",
              )
            }
            className="mt-1 h-4 w-4 accent-black"
          />
          <div>
            <p className="text-sm font-medium">I want to host properties</p>
            <p className="text-xs text-neutral-500">
              List and manage your rental properties.
            </p>
          </div>
        </div>

        <button
          disabled={isLoading}
          type="submit"
          className="mt-2 w-full rounded-sm 
          bg-black py-2 md:py-3 cursor-pointer
          text-sm text-white hover:bg-neutral-800 
          transition disabled:opacity-70"
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <p
        className="mt-3 text-center text-xs 
      text-neutral-500"
      >
        Already have an account?
        <Link
          to="/login"
          className="ml-2 font-medium 
        text-black underline"
        >
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
