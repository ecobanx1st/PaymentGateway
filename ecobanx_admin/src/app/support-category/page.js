"use client";

import { Button, Modal, Table, Toast, Toggle } from "@/components/ReusableUi";
import {
  getWithTokenApi,
  postWithTokenApi,
  putWithTokenApi,
} from "@/lib/apiHelper";
import { getAuthToken } from "@/lib/axiosInterceptor";
import { formatApiDate } from "@/lib/dateFormat";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const CATEGORY_ENDPOINT = "/support-ticket-category";

const initialCategories = [
  {
    id: "category-deposit",
    name: "Deposit",
    description: "-",
    active: true,
    createdAt: "Jul 31, 2026",
  },
  {
    id: "category-withdraw",
    name: "Withdraw",
    description: "-",
    active: true,
    createdAt: "Jul 31, 2026",
  },
  {
    id: "category-2fa",
    name: "2FA",
    description: "-",
    active: true,
    createdAt: "Jul 31, 2026",
  },
  {
    id: "category-profile",
    name: "Profile",
    description: "-",
    active: false,
    createdAt: "Jul 31, 2026",
  },
];

const createFields = [
  {
    key: "name",
    label: "Category Name",
    placeholder: "Wallet issue",
  },
];

function getApiErrorMessage(
  error,
  fallbackMessage = "Unable to create category.",
) {
  const data = error.response?.data;

  return (
    data?.message ||
    data?.msg ||
    data?.error ||
    data?.errors?.msg ||
    error.message ||
    fallbackMessage
  );
}

function normalizeCategory(category) {
  const active = category?.isActive ?? category?.active ?? true;

  return {
    id: category?._id || category?.id || `category-${Date.now()}`,
    name: category?.name || "-",
    description: category?.description || "-",
    active: Boolean(active),
    createdAt: formatApiDate(category?.createdAt),
    raw: category,
  };
}

function assertApiSuccess(response, fallbackMessage) {
  if (response?.success === false) {
    throw new Error(response.message || fallbackMessage);
  }
}

export default function SupportCategoryPage() {
  const [categories, setCategories] = useState(initialCategories);
  const [search, setSearch] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  function showToast(content, color = "success") {
    setToast({ id: Date.now(), content, color });
  }

  const fetchCategories = useCallback(async () => {
    const token = getAuthToken();

    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const trimmedSearch = search.trim();
      const response = await getWithTokenApi(token, CATEGORY_ENDPOINT, {
        page: "1",
        limit: "50",
        ...(trimmedSearch ? { search: trimmedSearch } : {}),
      });
      const result = response?.result ?? {};
      const list = Array.isArray(result.categories) ? result.categories : [];

      setCategories(list.map(normalizeCategory));
    } catch (error) {
      showToast(
        getApiErrorMessage(error, "Unable to load categories."),
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchCategories();
    }, 500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [fetchCategories]);

  function handleStatusChange(rowId, active) {
    const token = getAuthToken();

    setCategories((currentCategories) =>
      currentCategories.map((category) =>
        category.id === rowId ? { ...category, active } : category,
      ),
    );

    if (!token) {
      setCategories((currentCategories) =>
        currentCategories.map((category) =>
          category.id === rowId ? { ...category, active: !active } : category,
        ),
      );
      showToast("Session token not found", "error");
      return;
    }

    putWithTokenApi(token, `${CATEGORY_ENDPOINT}/${rowId}`, {
      isActive: active,
    })
      .then((response) => {
        if (response?.success === false) {
          throw new Error(response.message || "Unable to update category.");
        }

        if (response?.result) {
          setCategories((currentCategories) =>
            currentCategories.map((category) =>
              category.id === rowId
                ? normalizeCategory(response.result)
                : category,
            ),
          );
        }

        showToast(response?.message || "Category status updated");
      })
      .catch((error) => {
        setCategories((currentCategories) =>
          currentCategories.map((category) =>
            category.id === rowId ? { ...category, active: !active } : category,
          ),
        );
        showToast(
          getApiErrorMessage(error, "Unable to update category status."),
          "error",
        );
      });
  }

  async function handleCreateCategory(formValues) {
    if (submitting) {
      return;
    }

    const name = String(formValues.name || "").trim();

    if (!name) {
      showToast("Category name is required", "error");
      return;
    }

    const token = getAuthToken();

    if (!token) {
      showToast("Session token not found", "error");
      return;
    }

    setSubmitting(true);

    try {
      const response = await postWithTokenApi(token, CATEGORY_ENDPOINT, {
        name,
      });

      assertApiSuccess(response, "Unable to create category.");

      const createdCategory = normalizeCategory(
        response?.result || {
          id: `category-${Date.now()}`,
          name,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      );

      setCategories((currentCategories) => [
        createdCategory,
        ...currentCategories,
      ]);
      setCreateModalOpen(false);
      showToast(response?.message || "Category created successfully");
    } catch (error) {
      showToast(getApiErrorMessage(error), "error");
    } finally {
      setSubmitting(false);
    }
  }

  const categoryColumns = [
    { key: "name", header: "Category", cellClassName: "min-w-48" },
    { key: "description", header: "Description", cellClassName: "min-w-56" },
    {
      key: "statusLabel",
      header: "Status",
      cellClassName: "min-w-44",
      render: (_value, row) => (
        <div className="flex items-center gap-3">
          <Toggle
            checked={row.active}
            label={`${row.name} status`}
            onChange={(checked) => handleStatusChange(row.id, checked)}
          />
          <span
            className={row.active ? "text-emerald-400" : "text-text-secondary"}
          >
            {row.active ? "Active" : "Inactive"}
          </span>
        </div>
      ),
    },
    { key: "createdAt", header: "Created At", cellClassName: "min-w-40" },
  ];

  return (
    <div className="space-y-8">
      {toast && (
        <div className="fixed right-4 top-4 z-[80] w-[calc(100vw-2rem)] max-w-md sm:right-6 sm:top-6">
          <Toast
            key={toast.id}
            content={toast.content}
            color={toast.color}
            duration={2500}
          />
        </div>
      )}

      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-large font-semibold text-theme-text">
            Support Category
          </h1>
          <p className="text-small text-text-secondary">
            Manage categories used for support ticket routing.
          </p>
        </div>

        <Button
          variant="primary"
          beforeIcon={<Plus className="h-4 w-4" />}
          className="w-full sm:w-auto"
          disabled={submitting}
          onClick={() => setCreateModalOpen(true)}
        >
          Create Category
        </Button>
      </section>

      <Table
        title="Category List"
        description={`${categories.length} support ${
          categories.length === 1 ? "category" : "categories"
        }`}
        columns={categoryColumns}
        data={categories.map((category) => ({
          ...category,
          statusLabel: category.active ? "Active" : "Inactive",
        }))}
        loading={loading}
        rowKey="id"
        searchValue={search}
        searchPlaceholder="Search by category"
        onSearchChange={setSearch}
        showViewAll={false}
        pagination={{
          page: 1,
          pageSize: categories.length,
          total: categories.length,
          totalPages: 1,
        }}
        tableClassName="min-w-[820px]"
      />

      <Modal
        open={createModalOpen}
        mode="edit"
        title="Create Category"
        description="Add a support ticket category."
        data={{ name: "" }}
        fields={createFields}
        saveLabel={submitting ? "Creating..." : "Create Category"}
        cancelLabel="Cancel"
        onClose={() => setCreateModalOpen(false)}
        onSave={handleCreateCategory}
      />
    </div>
  );
}
