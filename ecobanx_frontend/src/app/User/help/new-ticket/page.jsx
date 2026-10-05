"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/button";
import Dropdown from "@/components/ui/dropdown";
import Input from "@/components/ui/input";
import PageTopBanner from "@/components/ui/PageTopBanner";
import Snackbar from "@/components/ui/Snackbar";
import Upload from "@/components/ui/Upload";
import { HELP_PRIORITIES } from "../_data";
import Skeleton from "@/components/ui/skeleton";
import apiClient from "@/lib/axiosInterceptor";
import { useRouter } from "next/navigation";
import { getAccountBaseRoute }  from '@/utils/accountRoutes'



const INITIAL_FORM = {
  category: null,

  description: "",
  customCategory: "",
  attachment: null,
};

const OTHER_CATEGORY = { value: "other", label: "Other" };

function getErrorMessage(error, fallbackMessage) {
  return error?.response?.data?.message || error?.message || fallbackMessage;
}

export default function Page() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([OTHER_CATEGORY]);
  const [categorySearching, setCategorySearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fetchedRef = useRef(false);
  const searchTimeoutRef = useRef(null);
const baseRoute = getAccountBaseRoute();

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: "", tone: "success" });

  const loadCategories = async (search = "") => {
    try {
      const response = await apiClient.get(`${baseRoute}/support-category/`, {
        params: search ? { search } : {},
      });
      const list = response?.data?.data ?? response?.data?.result ?? [];
      const options = Array.isArray(list)
        ? list.map((category) => ({ value: category._id, label: category.name }))
        : [];

      const hasOther = options.some(
        (option) => option.label.toLowerCase() === "other",
      );

      setCategories(
        search
          ? options
          : hasOther
            ? options
            : [...options, OTHER_CATEGORY],
      );
    } catch (error) {
      setSnackbar({
        open: true,
        message: getErrorMessage(error, "Unable to load categories."),
        tone: "error",
      });
    } finally {
      setCategorySearching(false);
    }
  };

  const handleCategorySearch = (term) => {
    const trimmed = String(term || "").trim();

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    setCategorySearching(true);

    searchTimeoutRef.current = setTimeout(() => {
      loadCategories(trimmed);
    }, 400);
  };

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    (async () => {
      try {
        await loadCategories();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (form.category && errors.category) {
      setErrors((prev) => ({ ...prev, category: "" }));
    }
  }, [form.category, errors.category]);

  useEffect(() => {
    const custom = String(form.customCategory || "").trim();
    if (custom && errors.customCategory) {
      if (errors.customCategory === "Custom category is required.") {
        setErrors((prev) => ({ ...prev, customCategory: "" }));
      }
    }
  }, [form.customCategory, errors.customCategory]);

  const validate = () => {
    const nextErrors = {};
    const isOther = form.category?.label?.toLowerCase() === "other";
    const desc = String(form.description || "").trim();

    if (!form.category) nextErrors.category = "Category is required.";

    if (!desc) {
      nextErrors.description = "Description is required.";
    } else if (desc.length < 10) {
      nextErrors.description = "Description must be at least 10 characters";
    } else if (desc.length > 200) {
      nextErrors.description = "Description cannot exceed 200 characters";
    }

    if (isOther) {
      const customCategory = String(form.customCategory || "").trim();

      if (!customCategory) {
        nextErrors.customCategory = "Custom category is required.";
      } else if (customCategory.length < 10) {
        nextErrors.customCategory = "Custom category must be at least 10 characters";
      } else if (customCategory.length > 25) {
        nextErrors.customCategory = "Custom category cannot exceed 25 characters";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setErrors({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;
    if (submitting) return;

    const selectedCategory = form.category?.value;
    const isOther = form.category?.label?.toLowerCase() === "other";
    const trimmedCustomCategory = String(form.customCategory || "").trim();
    const payload = {
      description: form.description.trim(),

      ...(isOther
        ? {
            ...(selectedCategory !== OTHER_CATEGORY.value
              ? { category: selectedCategory }
              : {}),
            customCategory: trimmedCustomCategory,
          }
        : { category: selectedCategory }),
    };

    setSubmitting(true);

    try {
      const response = await apiClient.post(`${baseRoute}/support-ticket`, payload);
      const message =
        response?.data?.message ||
        `Ticket has been queued for review.`;

      setSnackbar({ open: true, message, tone: "success" });
      resetForm();
  
    setTimeout(() => {
    router.push("/User/help");
  }, 1000);

    } catch (error) {
      setSnackbar({
        open: true,
        message: getErrorMessage(error, "Unable to create the ticket. Please try again."),
        tone: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };


  if (loading) {
    return <Skeleton pageName="support" />;
  }
  return (
    <div className="mx-auto w-full max-w-[920px] space-y-6 pb-8">
      <PageTopBanner
        title="New Support Ticket"
        description="Share the issue details and attachments with our support team."
        actions={
          <Link
            href="/User/help"
            className="inline-flex h-10 w-full items-center justify-center rounded-full border border-input-border bg-input-bg px-4 text-sm font-semibold text-secondary-text transition hover:border-primary hover:text-primary sm:w-auto"
          >
            Back to Help
          </Link>
        }
      />

      <section className="border border-input-border rounded-[18px] bg-primary-bg p-4 shadow-[0_18px_42px_rgba(8,19,12,0.08)] sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <p className="text-lg font-semibold tracking-tight text-theme-text">
              Submit a new ticket
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">

            <div className="flex flex-col gap-2">
              <Dropdown
                label="Category"
                placeholder="Choose a category"
                options={categories}
                value={form.category}
                onChange={(nextValue) => setForm((current) => ({ ...current, category: nextValue }))}
                searchable={true}
                onSearch={handleCategorySearch}
                searching={categorySearching}
                error={errors.category || ""}
                className="w-full rounded-full"
              />

              {form.category?.label?.toLowerCase() === "other" ? (
                <div className="flex flex-col gap-1">
                  <Input
                    label="Custom Category"
                    value={form.customCategory}
                    onChange={(event) => {
                      setForm((current) => ({
                        ...current,
                        customCategory: event.target.value,
                      }));
                      if (errors.customCategory) setErrors((prev) => ({ ...prev, customCategory: "" }));
                    }}
                    placeholder="Enter your support category"
                    error=""
                    rounded="rounded-full"
                    inputClassName={`h-11 ${errors.customCategory ? "!border-red-500 focus:!border-red-500" : ""}`}
                    maxLength={25}
                  />
                  <div className="flex justify-between">
                    {errors.customCategory ? <span className="text-xs font-medium text-red-500">{errors.customCategory}</span> : <span />}
                    <span className="text-xs text-secondary-text">{form.customCategory.length}/25</span>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
{/* 
          <Dropdown
            label="Priority"
            placeholder="Choose a priority"
            options={HELP_PRIORITIES}
            value={form.priority}
            onChange={(nextValue) => setForm((current) => ({ ...current, priority: nextValue }))}
            searchable={true}
            error={errors.priority || ""}
            className="w-full rounded-full"
          /> */}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-secondary-text">Description</label>
            <textarea
              value={form.description}
              onChange={(event) => {
                setForm((current) => ({ ...current, description: event.target.value }));
                if (errors.description) setErrors((prev) => ({ ...prev, description: "" }));
              }}
              placeholder="Tell us more about the issue, expected behavior, and any steps to reproduce."
              rows={5}
              maxLength={200}
              className={`w-full rounded-[18px] border bg-input-bg px-4 py-3 text-theme-text placeholder:text-secondary-text transition-all duration-300 focus:outline-none hover:bg-secondary-bg ${errors.description ? "border-red-500 focus:border-red-500" : "border-input-border focus:border-theme-text"}`}
            />
            <div className="flex justify-between">
              {errors.description ? <span className="text-xs font-medium text-red-500">{errors.description}</span> : <span />}
              <span className="text-xs text-secondary-text">{form.description.length}/200</span>
            </div>
          </div>
{/* 
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-medium text-secondary-text">Attachment</label>
            </div>
            <Upload
              label="Upload attachment"
              value={form.attachment}
              onChange={(nextFile) => setForm((current) => ({ ...current, attachment: nextFile }))}
              onRemove={() => setForm((current) => ({ ...current, attachment: null }))}
            />
          </div> */}

          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              value={submitting ? "Submitting..." : "Submit Ticket"}
              variant="primary"
              disabled={submitting}
              className="h-10 border-0 px-5 text-sm font-semibold text-white shadow-none"
            />
          </div>
        </form>
      </section>

      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        tone={snackbar.tone}
        onClose={() => setSnackbar({ open: false, message: "", tone: "success" })}
      />
    </div>
  );
}
