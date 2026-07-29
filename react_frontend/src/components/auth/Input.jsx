

export default function Input({ 
  label, 
  name, 
  type = "text", 
  formik, 
  rightElement }) {
  const error = formik.touched[name] && formik.errors[name];

  return (
    <div className="h-12 md:h-15">
      <div className="flex items-center justify-between">
        <label className="block text-[10px] md:text-[12px] 
        uppercase tracking-[0.2em] 
        text-neutral-600">
          {label}
        </label>
        {rightElement && rightElement}
      </div>

      <input
        type={type}
        {...formik.getFieldProps(name)}
        className={`w-full border-b bg-transparent 
          text-sm outline-none transition-colors 
          focus:border-black ${
          error ? "border-red-500" : "border-neutral-300"
        }`}
      />

      {error && (
        <p className="text-[10px] text-red-500 mt-1">
          {formik.errors[name]}
        </p>
      )}
    </div>
  );
}