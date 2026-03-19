"use client";

import { useEffect, useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import DotExpandButton from "./DotExpandButton";

type FormData = {
  name: string;
  email: string;
  mobile: string;
  projectType: string;
  message: string;
};

type FormErrors = FormData;

type FormTouched = {
  [K in keyof FormData]: boolean;
};

type SubmitStatus = {
  type: "" | "info" | "success" | "error";
  message: string;
};

const initialFormData: FormData = {
  name: "",
  email: "",
  mobile: "",
  projectType: "",
  message: "",
};

const initialErrors: FormErrors = {
  name: "",
  email: "",
  mobile: "",
  projectType: "",
  message: "",
};

const initialTouched: FormTouched = {
  name: false,
  email: false,
  mobile: false,
  projectType: false,
  message: false,
};

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>(initialErrors);
  const [touched, setTouched] = useState<FormTouched>(initialTouched);
  const [focusedField, setFocusedField] = useState<keyof FormData | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>({
    type: "",
    message: "",
  });
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const projectOptions = [
    "Web Development",
    "Mobile Application",
    "E-commerce Website",
    "UX/UI Design",
    "Branding & Identity",
    "SEO Optimization",
    "Consultation",
    "Other",
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!submitStatus.message) return;

    const timer = setTimeout(() => {
      setSubmitStatus({ type: "", message: "" });
    }, 5000);

    return () => clearTimeout(timer);
  }, [submitStatus.message]);

  const validateField = (name: keyof FormData, value: string) => {
    if (!value.trim()) return "";

    switch (name) {
      case "name":
        return value.trim().length < 2 ? "Name must be at least 2 characters" : "";
      case "email": {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? "" : "Please enter a valid email address";
      }
      case "mobile": {
        const mobileRegex = /^[+]?[\d\s\-()]{10,}$/;
        return mobileRegex.test(value) ? "" : "Please enter a valid mobile number";
      }
      case "projectType":
        return "";
      case "message":
        return value.trim().length < 10 ? "Message must be at least 10 characters" : "";
      default:
        return "";
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    const fieldName = name as keyof FormData;

    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    if (touched[fieldName] && value.trim()) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: validateField(fieldName, value),
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    }
  };

  const handleFocus = (fieldName: keyof FormData) => {
    setFocusedField(fieldName);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const fieldName = name as keyof FormData;

    setFocusedField(null);
    setTouched((prev) => ({
      ...prev,
      [fieldName]: true,
    }));

    if (value.trim()) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: validateField(fieldName, value),
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    }
  };

  const handleOptionSelect = (option: string) => {
    setFormData((prev) => ({
      ...prev,
      projectType: option,
    }));

    setErrors((prev) => ({
      ...prev,
      projectType: "",
    }));

    setTouched((prev) => ({
      ...prev,
      projectType: true,
    }));

    setShowDropdown(false);
    setFocusedField(null);
  };

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);

    if (!touched.projectType) {
      setTouched((prev) => ({
        ...prev,
        projectType: true,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const allTouched: FormTouched = {
      name: true,
      email: true,
      mobile: true,
      projectType: true,
      message: true,
    };
    setTouched(allTouched);

    const newErrors: FormErrors = {
      name: "",
      email: "",
      mobile: "",
      projectType: "",
      message: "",
    };

    (Object.keys(formData) as Array<keyof FormData>).forEach((key) => {
      if (!formData[key].trim()) {
        newErrors[key] =
          key === "projectType" ? "Please select a project type" : "This field is required";
      } else {
        newErrors[key] = validateField(key, formData[key]);
      }
    });

    setErrors(newErrors);

    const isValid = !Object.values(newErrors).some((error) => error !== "");
    if (!isValid) {
      setSubmitStatus({
        type: "error",
        message: "Please fix the errors before submitting.",
      });
      return;
    }

    setSubmitStatus({
      type: "info",
      message: "Sending message...",
    });

    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      setSubmitStatus({
        type: "error",
        message: "Email service is not configured yet. Please try again later.",
      });
      return;
    }

    try {
      const templateParams = {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        projectType: formData.projectType,
        message: formData.message,
        to_name: "Alchemy Team",
      };

      await emailjs.send(serviceId, templateId, templateParams, publicKey);

      setSubmitStatus({
        type: "success",
        message: "Message sent successfully! We will get back to you soon.",
      });

      setFormData(initialFormData);
      setErrors(initialErrors);
      setTouched(initialTouched);
      setFocusedField(null);
    } catch {
      setSubmitStatus({
        type: "error",
        message: "Failed to send message. Please try again or contact us directly.",
      });
    }
  };

  const getInputClassName = (fieldName: keyof FormData) => {
    const baseClass =
      "w-full px-5 pt-9 pb-4 border-b-2 bg-transparent text-white focus:outline-none text-sm";

    if (errors[fieldName] && touched[fieldName]) {
      return `${baseClass} border-red-500 focus:border-red-500`;
    }

    return `${baseClass} border-brand focus:border-brand`;
  };

  const getDropdownClassName = () => {
    const baseClass =
      "w-full px-5 pt-9 pb-4 border-b-2 bg-transparent text-white cursor-pointer flex justify-between items-center text-sm";

    if (errors.projectType && touched.projectType) {
      return `${baseClass} border-red-500`;
    }

    return `${baseClass} border-brand focus:border-brand`;
  };

  const getLabelClassName = (fieldName: keyof FormData, hasValue: boolean) => {
    const baseClass = "absolute left-5 transition-all duration-300 pointer-events-none";

    if (hasValue || focusedField === fieldName) {
      return `${baseClass} top-2 text-xs text-brand font-medium`;
    }

    return `${baseClass} top-6 text-white text-sm`;
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center py-8 px-4 md:px-8 lg:px-12 bg-black relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute w-8 h-8 border border-brand top-10 left-10 rotate-45" />
        <div className="absolute w-6 h-6 border border-brand top-32 right-20 rotate-12" />
        <div className="absolute w-10 h-10 border border-brand bottom-40 left-20 -rotate-45" />
        <div className="absolute w-7 h-7 border border-brand top-60 right-40 rotate-90" />
        <div className="absolute w-9 h-9 border border-brand bottom-20 right-32 -rotate-12" />
        <div className="absolute w-5 h-5 border border-brand top-80 left-40 rotate-45" />

        <div className="absolute w-4 h-4 border border-brand top-16 left-1/4" />
        <div className="absolute w-3 h-3 border border-brand bottom-32 right-1/4 rotate-45" />
        <div className="absolute w-6 h-6 border border-brand top-1/2 left-16 -rotate-45" />
        <div className="absolute w-4 h-4 border border-brand bottom-16 right-16 rotate-90" />
        <div className="absolute w-5 h-5 border border-brand top-24 left-3/4" />
        <div className="absolute w-7 h-7 border border-brand bottom-48 left-3/4 rotate-45" />

        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-px bg-brand transform -rotate-45 origin-left" />
          <div className="absolute top-0 left-0 w-full h-px bg-brand transform rotate-45 origin-left" />
          <div className="absolute top-20 left-0 w-full h-px bg-brand transform -rotate-45 origin-left" />
          <div className="absolute top-20 left-0 w-full h-px bg-brand transform rotate-45 origin-left" />
        </div>

        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={`row-${i}`}
              className="flex justify-around absolute w-full"
              style={{ top: `${i * 10}%` }}
            >
              {Array.from({ length: 10 }).map((__, j) => (
                <div key={`dot-${i}-${j}`} className="w-1 h-1 bg-brand rounded-full" />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-400 mx-auto relative z-10">
        {submitStatus.message && (
          <div className="flex justify-center mb-8">
            <div
              className={`px-8 py-4 rounded-lg border-2 max-w-lg text-center ${
                submitStatus.type === "success"
                  ? "bg-green-900/30 border-green-500 text-green-300"
                  : submitStatus.type === "info"
                    ? "bg-blue-900/30 border-blue-500 text-blue-300"
                    : "bg-red-900/30 border-red-500 text-red-300"
              }`}
            >
              <div className="flex items-center justify-center space-x-3">
                {submitStatus.type === "success" ? (
                  <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <span className="text-sm font-medium">{submitStatus.message}</span>
                <button
                  type="button"
                  onClick={() => setSubmitStatus({ type: "", message: "" })}
                  className="text-current hover:opacity-70 transition-opacity ml-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-stretch">
          <div className="xl:col-span-2 bg-black/80 backdrop-blur-sm rounded-2xl p-10 md:p-12 border border-brand/20 min-h-175 flex flex-col w-full">
            <div className="mb-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Let&apos;s Start Your Project</h2>
              <p className="text-gray-300 text-lg">Share your ideas and we&apos;ll bring them to life</p>
            </div>

            <form autoComplete="off" onSubmit={handleSubmit} className="grow">
              <div className="w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
                  <div className="space-y-14">
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        onFocus={() => handleFocus("name")}
                        onBlur={handleBlur}
                        className={getInputClassName("name")}
                        autoComplete="off"
                      />
                      <label className={getLabelClassName("name", !!formData.name)}>Your Name</label>
                      {errors.name && touched.name && (
                        <p className="text-red-500 text-xs mt-3 absolute -bottom-7">{errors.name}</p>
                      )}
                    </div>

                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        onFocus={() => handleFocus("email")}
                        onBlur={handleBlur}
                        className={getInputClassName("email")}
                        autoComplete="off"
                      />
                      <label className={getLabelClassName("email", !!formData.email)}>Your Email</label>
                      {errors.email && touched.email && (
                        <p className="text-red-500 text-xs mt-3 absolute -bottom-7">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-14">
                    <div className="relative">
                      <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        onFocus={() => handleFocus("mobile")}
                        onBlur={handleBlur}
                        className={getInputClassName("mobile")}
                        autoComplete="off"
                      />
                      <label className={getLabelClassName("mobile", !!formData.mobile)}>
                        Your Mobile Number
                      </label>
                      {errors.mobile && touched.mobile && (
                        <p className="text-red-500 text-xs mt-3 absolute -bottom-7">{errors.mobile}</p>
                      )}
                    </div>

                    <div className="relative" ref={dropdownRef}>
                      <button
                        type="button"
                        className={getDropdownClassName()}
                        onClick={toggleDropdown}
                        onFocus={() => handleFocus("projectType")}
                        aria-haspopup="listbox"
                        aria-expanded={showDropdown}
                      >
                        <span className="text-white">{formData.projectType || ""}</span>
                        <svg
                          className={`h-6 w-6 text-white transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      <label
                        className={getLabelClassName(
                          "projectType",
                          !!formData.projectType || showDropdown,
                        )}
                      >
                        Project Type
                      </label>
                      {errors.projectType && touched.projectType && (
                        <p className="text-red-500 text-xs mt-3 absolute -bottom-7">{errors.projectType}</p>
                      )}

                      {showDropdown && (
                        <div className="absolute z-20 w-full mt-3 bg-black/95 border-2 border-brand rounded-lg shadow-xl max-h-72 overflow-y-auto backdrop-blur-sm">
                          {projectOptions.map((option) => (
                            <button
                              type="button"
                              key={option}
                              className={`w-full text-left px-6 py-5 cursor-pointer transition-all duration-200 hover:text-brand text-sm ${
                                formData.projectType === option
                                  ? "text-brand bg-brand/10"
                                  : "text-white"
                              }`}
                              onClick={() => handleOptionSelect(option)}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative mb-12 w-full">
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  onFocus={() => handleFocus("message")}
                  onBlur={handleBlur}
                  className="w-full px-7 py-7 border-2 border-brand bg-transparent text-white focus:outline-none rounded-xl placeholder-gray-500 h-64 focus:border-brand text-sm"
                  placeholder="Tell us about your project.."
                  style={{ resize: "none" }}
                  autoComplete="off"
                />
                {errors.message && touched.message && (
                  <p className="text-red-500 text-xs mt-3 absolute -bottom-8">{errors.message}</p>
                )}
              </div>

              <div className="flex justify-center mt-14">
                <DotExpandButton text="Submit" size="default" />
              </div>
            </form>
          </div>

          <div className="bg-transparent backdrop-blur-sm rounded-2xl p-8 md:p-10 border border-brand/20 shadow-xl flex flex-col">
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight">Get in touch</h1>
              <p className="text-lg text-gray-300">Do you have a project in your mind?</p>
            </div>

            <div className="space-y-8 grow">
              <div className="flex items-start space-x-4">
                <div className="w-5 h-5 shrink-0 mt-1">
                  <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-brand text-lg font-semibold mb-3 tracking-wide">Phone</h3>
                  <div className="space-y-2">
                    <p className="text-white text-base">+94 719 563 675</p>
                    <p className="text-white text-base">+61 404 713 766</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-5 h-5 shrink-0 mt-1">
                  <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-brand text-lg font-semibold mb-3 tracking-wide">Email</h3>
                  <p className="text-white text-base">hello@alchemy.lk</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-5 h-5 shrink-0 mt-1">
                    <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-brand text-lg font-semibold mb-2 tracking-wide">Sri Lanka</h3>
                    <p className="text-gray-300 text-base leading-relaxed">
                      43/5, Senanayake Mawatha,
                      <br />
                      Sri Jayawardenepura Kotte
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-5 h-5 shrink-0 mt-1">
                    <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-brand text-lg font-semibold mb-2 tracking-wide">Australia</h3>
                    <p className="text-gray-300 text-base leading-relaxed">
                      203, George Street
                      <br />
                      Queens Park, WA 6107
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
