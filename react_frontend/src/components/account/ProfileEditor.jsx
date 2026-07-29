import { useState, useEffect, useRef } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FiSave, FiEye, FiEyeOff } from "react-icons/fi";

const ProfileEditor = ({ user, onSubmit, isSubmitting }) => {
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const wasSubmitting = useRef(isSubmitting);

  // Separate password state (outside Formik)
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Monitors the submission transition to trigger feedback notification
  useEffect(() => {
    if (wasSubmitting.current && !isSubmitting) {
      setShowSavedMessage(true);

      const timer = setTimeout(() => {
        setShowSavedMessage(false);
      }, 3000);

      return () => clearTimeout(timer);
    }

    wasSubmitting.current = isSubmitting;
  }, [isSubmitting]);

  const profileSchema = Yup.object().shape({
    firstName: Yup.string()
      .required("First name is required")
      .min(2, "Too short"),

    lastName: Yup.string()
      .required("Last name is required")
      .min(2, "Too short"),

    email: Yup.string().email("Invalid email").required("Email is required"),

    phone: Yup.string()
      .matches(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")
      .required("Phone is required"),
  });

  const inputClasses = `
    w-full border border-neutral-200 rounded-sm px-3.5 py-2.5 
    text-sm text-neutral-900 placeholder:text-neutral-500 
    bg-white outline-none 
    focus:border-neutral-400
    transition-all duration-150 ease-out
  `;

  const labelClasses =
    "block text-xs mb-1 font-medium text-neutral-600 tracking-wide";

  const errorClasses = "mt-1 text-xs text-red-500 tracking-wide";

  const handleSubmit = (values) => {
    // Validate password only when user enters something
    if (newPassword && newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }

    setPasswordError("");
    onSubmit({
      ...values,
      newPassword: newPassword || null,
    });

    setNewPassword("");

    onSubmit({
      ...values,
      newPassword: newPassword || null,
    });

    // clear password after sending
    setNewPassword("");
  };

  return (
    <Formik
      initialValues={{
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
        phone: user?.phone || "",
      }}
      validationSchema={profileSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ isValid, dirty }) => (
        <Form className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className={labelClasses}>
                First Name
              </label>

              <Field
                name="firstName"
                id="firstName"
                className={inputClasses}
                placeholder="John"
              />

              <ErrorMessage
                name="firstName"
                component="p"
                className={errorClasses}
              />
            </div>

            <div>
              <label htmlFor="lastName" className={labelClasses}>
                Last Name
              </label>

              <Field
                name="lastName"
                id="lastName"
                className={inputClasses}
                placeholder="Doe"
              />

              <ErrorMessage
                name="lastName"
                component="p"
                className={errorClasses}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className={labelClasses}>
              Email Address
            </label>

            <Field
              name="email"
              id="email"
              type="email"
              className={inputClasses}
              placeholder="john@example.com"
            />

            <ErrorMessage name="email" component="p" className={errorClasses} />
          </div>

          <div>
            <label htmlFor="phone" className={labelClasses}>
              Phone Number
            </label>

            <Field
              name="phone"
              id="phone"
              type="tel"
              className={inputClasses}
              placeholder="9876543210"
            />

            <ErrorMessage name="phone" component="p" className={errorClasses} />
          </div>

          {/* Password Update Field - Outside Formik */}
          <div>
            <label htmlFor="newPassword" className={labelClasses}>
              New Password
            </label>

            <div className="relative">
              <input
                id="newPassword"
                type={showPassword ? "password" : "text"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (passwordError) setPasswordError("");
                }}
                className={inputClasses}
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="
      absolute right-3 top-1/2 -translate-y-1/2
      text-neutral-900
      transition-colors duration-150
      cursor-pointer
    "
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
              </button>
            </div>

            {passwordError ? (
              <p className={errorClasses}>{passwordError}</p>
            ) : (
              <p
                className="mt-1 text-[11px] md:text-[12px] 
    text-zinc-700 tracking-wide"
              >
                Minimum 8 characters. Leave blank to keep current password.
              </p>
            )}
          </div>

          {/* Action Button */}

          <div className="flex items-center justify-end gap-4 pt-2 h-9">
            {showSavedMessage && (
              <span
                className="
                text-xs font-light 
                text-emerald-600 
                tracking-wide 
                transition-all 
                duration-200 
                animate-in fade-in 
                slide-in-from-right-1
              "
              >
                Changes saved
              </span>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !isValid || (!dirty && !newPassword)}
              className="
                inline-flex items-center gap-2 
                bg-neutral-900 text-white 
                hover:bg-neutral-800 active:bg-neutral-950
                disabled:opacity-20 disabled:cursor-not-allowed 
                rounded-sm px-5 py-2 
                text-xs font-light tracking-wide 
                transition-all duration-150 ease-out 
                cursor-pointer select-none
              "
            >
              <FiSave size={13} className="opacity-90" />

              {isSubmitting ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ProfileEditor;
