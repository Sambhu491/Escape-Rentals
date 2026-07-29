import { useState, useEffect } from "react";
import { FiMail, FiPhone, FiMapPin, FiSend, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import Navbar from "../components/landing/Navbar";
import BackButton from "../components/property/BackButton";
import { companyConfig, contactItems } from "../dataFile/footerData";
import { submitContact } from "../api/notificationApi";

const ContactPage = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState({ type: null, message: "" });

  // Update field parameters and dynamically strip away validation errors as user keypresses fire
  const update = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    
    if (errors[key]) {
      setErrors((prev) => {
        const remainingErrors = { ...prev };
        delete remainingErrors[key];
        return remainingErrors;
      });
    }

    if (submitStatus.type) {
      setSubmitStatus({ type: null, message: "" });
    }
  };

  const mailtoHref = `mailto:${contactItems.find((c) => c.id === "email")?.text}?subject=${encodeURIComponent(
    `Message from ${form.name || "the Escape Rentals site"}`,
  )}&body=${encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`)}`;

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Name is required.";
    if (!form.email.trim()) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Please enter a valid email address.";

    if (!form.message.trim()) newErrors.message = "Message is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAnonymousMessage = async () => {
    setSubmitStatus({ type: null, message: "" });
    
    if (!validateForm()) return;

    try {
      setSending(true);
      await submitContact(form);

      setSubmitStatus({
        type: "success",
        message: "Your message has been delivered to the Escape Rentals team."
      });

      setForm({ name: "", email: "", message: "" });
      setErrors({});
    } catch (err) {
      setSubmitStatus({
        type: "error",
        message: err.response?.data?.message ?? "Failed to send your message. Please try again later."
      });
    } finally {
      setSending(false);
    }
  };

  const handleEmail = () => {
    setSubmitStatus({ type: null, message: "" });
    
    if (!validateForm()) return;

    setErrors({});
    window.location.href = mailtoHref;
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white text-neutral-900">
        <header className="max-w-5xl mx-auto px-4 py-4">
          <BackButton />
        </header>

        <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-12 text-center space-y-3">
          <span className="text-[11px] uppercase tracking-[0.25em] text-neutral-400 font-semibold">
            Get in touch
          </span>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight">
            We'd love to <span className="font-semibold">hear from you.</span>
          </h1>
          <p className="text-sm text-neutral-500 max-w-lg mx-auto leading-relaxed">
            Questions about a booking, hosting, or anything in between —
            reach out and a real person on our team will get back to you.
          </p>
        </section>

        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
            
            {/* Contact Details Information Panel */}
            <div className="space-y-6">
              {contactItems.map((item) => (
                <div key={item.id} className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 border border-neutral-200/40 text-neutral-700">
                    <item.icon size={15} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">
                      {item.id === "email" ? "Email" : item.id === "phone" ? "Phone" : "Location"}
                    </p>
                    {item.href ? (
                      <a href={item.href} className="text-sm font-medium text-neutral-900 hover:text-neutral-600 transition-colors">
                        {item.text}
                      </a>
                    ) : (
                      <p className="text-sm font-medium text-neutral-900">{item.text}</p>
                    )}
                  </div>
                </div>
              ))}

              <div className="pt-5 border-t border-neutral-100">
                <p className="text-sm text-neutral-500 leading-relaxed">
                  {companyConfig.description}
                </p>
              </div>
            </div>

            {/* Structured Communications Terminal Input Form */}
            <form
              className="space-y-5 rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-6 shadow-xs"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="space-y-4">
                
                {/* Visual Alert Notification Canvas Layer */}
                <div className="min-h-[44px] transition-all duration-200">
                  {submitStatus.type ? (
                    <div className={`p-3 border rounded-lg text-xs flex items-start gap-2 animate-in fade-in duration-200 ${
                      submitStatus.type === "success" 
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                        : "bg-red-50 border-red-200 text-red-800"
                    }`}>
                      {submitStatus.type === "success" ? (
                        <FiCheckCircle size={14} className="shrink-0 mt-0.5 text-emerald-600" />
                      ) : (
                        <FiAlertCircle size={14} className="shrink-0 mt-0.5 text-red-600" />
                      )}
                      <span className="break-words font-medium">{submitStatus.message}</span>
                    </div>
                  ) : (
                    <div className="p-3 border border-transparent rounded-lg text-xs flex items-start gap-2 invisible select-none">
                      <FiCheckCircle size={14} className="shrink-0 mt-0.5 opacity-0" />
                      <span>&nbsp;</span>
                    </div>
                  )}
                </div>

                {/* Input Fields Content Stack */}
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.15em] text-neutral-400 font-bold mb-1">
                    Name
                  </label>
                  <input
                    value={form.name}
                    onChange={update("name")}
                    placeholder="Your name"
                    className={`w-full border-b bg-transparent py-2 text-sm outline-none transition-colors ${
                      errors.name ? 'border-red-400 focus:border-red-600' : 'border-neutral-200 focus:border-neutral-900'
                    }`}
                  />
                  <p className="text-[11px] text-red-600 mt-1 font-medium min-h-[16px]">
                    {errors.name || "\u00A0"}
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.15em] text-neutral-400 font-bold mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={update("email")}
                    placeholder="you@example.com"
                    className={`w-full border-b bg-transparent py-2 text-sm outline-none transition-colors ${
                      errors.email ? 'border-red-400 focus:border-red-600' : 'border-neutral-200 focus:border-neutral-900'
                    }`}
                  />
                  <p className="text-[11px] text-red-600 mt-1 font-medium min-h-[16px]">
                    {errors.email || "\u00A0"}
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.15em] text-neutral-400 font-bold mb-1">
                    Message
                  </label>
                  <textarea
                    rows={3}
                    value={form.message}
                    onChange={update("message")}
                    placeholder="How can we help?"
                    className={`w-full border-b bg-transparent text-sm outline-none transition-colors resize-none ${
                      errors.message ? 'border-red-400 focus:border-red-600' : 'border-neutral-200 focus:border-neutral-900'
                    }`}
                  />
                  <p className="text-[11px] text-red-600 mt-1 font-medium min-h-[16px]">
                    {errors.message || "\u00A0"}
                  </p>
                </div>
              </div>

              {/* Execution Actions Component Interface Blocks */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleEmail}
                  className="inline-flex items-center justify-center gap-2 w-full rounded-lg bg-neutral-900 px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-white hover:bg-neutral-800 transition-colors cursor-pointer shadow-sm active:scale-[0.99]"
                >
                  <FiSend size={13} />
                  Send Email
                </button>

                <p className="text-[11px] pb-3 border-b border-neutral-200/60 text-neutral-400 font-medium text-center leading-normal">
                  Opens your local email client with this message pre-filled.
                </p>
                
                <button
                  type="button"
                  onClick={handleAnonymousMessage}
                  disabled={sending}
                  className="inline-flex items-center justify-center gap-2 w-full rounded-lg border border-neutral-900 px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99]"
                >
                  <FiMail size={13} />
                  {sending ? "Sending..." : "Send Anonymously"}
                </button>

                <p className="text-[11px] text-neutral-400 font-medium text-center leading-normal">
                  Transmits the data package securely directly to our backend administration team.
                </p>
              </div>
            </form>
          </div>
        </section>
      </div>
    </>
  );
};

export default ContactPage;