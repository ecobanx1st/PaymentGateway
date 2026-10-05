"use client";

import { ImagePlus, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Button from "./Button";
import Dropdown from "./Dropdown";
import Input from "./Input";
import Toggle from "./Toggle";

function joinClasses(...classes) {
  return classes.filter(Boolean).join(" ");
}

function humanizeKey(key) {
  return String(key)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getFieldValue(data, key) {
  const value = data?.[key];

  if (value === null || value === undefined || value === "") {
    return "";
  }

  return String(value);
}

function buildFields(data, fields) {
  if (fields?.length) {
    return fields;
  }

  return Object.keys(data ?? {})
    .filter((key) => key !== "actions")
    .map((key) => ({ key, label: humanizeKey(key) }));
}

function getBooleanFieldValue(value) {
  if (typeof value === "boolean") {
    return value;
  }

  return ["true", "enabled", "active", "yes", "1"].includes(
    String(value || "")
      .trim()
      .toLowerCase(),
  );
}

function ToggleField({ field, label, value }) {
  const [checked, setChecked] = useState(getBooleanFieldValue(value));

  return (
    <div className="flex gap-7 items-center">
      <p className=" text-mid font-medium text-text-secondary">{label}</p>
      <Toggle checked={checked} onChange={setChecked} label={label} />
      <input
        type="hidden"
        name={field.key}
        value={checked ? "true" : "false"}
      />
    </div>
  );
}

function normalizeStringArray(value) {
  if (Array.isArray(value) && value.length) {
    return value.map((item) => String(item || ""));
  }

  if (value) {
    return String(value)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [""];
}

function normalizeMultiSelectValue(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item : item?._id || item?.id))
      .map((item) => String(item || "").trim())
      .filter(Boolean);
  }

  if (value) {
    return String(value)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function MultiSelectField({ field, label, value }) {
  const [selected, setSelected] = useState(() =>
    normalizeMultiSelectValue(value),
  );

  return (
    <div className="sm:col-span-2">
      <Dropdown
        label={label}
        options={field.options || []}
        value={selected}
        onChange={setSelected}
        multiple
        disabled={field.disabled}
        placeholder={field.placeholder || "Select options"}
        triggerClassName="rounded-[8px]"
      />
      {selected.map((item) => (
        <input key={item} type="hidden" name={field.key} value={item} />
      ))}
    </div>
  );
}
function SelectField({ field, label, value }) {
  const [selected, setSelected] = useState(() =>
    value === null || value === undefined ? "" : String(value),
  );

  return (
    <div>
      <Dropdown
        label={label}
        options={field.options || []}
        value={selected}
        onChange={setSelected}
        disabled={field.disabled}
        placeholder={field.placeholder || "Select option"}
        triggerClassName="rounded-[8px]"
      />
      <input type="hidden" name={field.key} value={selected} />
    </div>
  );
}
function ImageUploadField({ field, label, value }) {
  const inputRef = useRef(null);
  const initialPreview = Array.isArray(value) ? value[0] : value;
  const [preview, setPreview] = useState(() =>
    typeof initialPreview === "string" ? initialPreview : "",
  );
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    if (!preview?.startsWith("blob:")) {
      return undefined;
    }

    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setFileName(file.name);
    setPreview((currentPreview) => {
      if (currentPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(currentPreview);
      }

      return URL.createObjectURL(file);
    });
  }

  function clearImage() {
    if (inputRef.current) {
      inputRef.current.value = "";
    }

    setFileName("");
    setPreview((currentPreview) => {
      if (currentPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(currentPreview);
      }

      return "";
    });
  }

  return (
    <div className="sm:col-span-2">
      <p className="mb-2 text-mid font-medium text-text-secondary">{label}</p>
      <input
        ref={inputRef}
        id={`${field.key}-upload`}
        type="file"
        name={field.key}
        accept={field.accept || "image/*"}
        className="sr-only"
        onChange={handleFileChange}
      />
      <input
        type="hidden"
        name={`${field.key}.__existing`}
        value={preview && !fileName ? preview : ""}
      />
      <input
        type="hidden"
        name={`${field.key}.__removed`}
        value={preview ? "false" : "true"}
      />

      {preview ? (
        <div className="flex items-center gap-3 rounded-[8px] border border-input-border/50 bg-input-bg/40 p-3">
          <div
            role="img"
            aria-label={`${label} preview`}
            className="h-16 w-16 shrink-0 rounded-[8px] border border-input-border/40 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${preview})` }}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-mid font-medium text-theme-text">
              {fileName || field.previewLabel || "Selected image"}
            </p>
            <p className="mt-1 text-small text-input-text">Image ready</p>
          </div>
          <button
            type="button"
            onClick={clearImage}
            aria-label={`Remove ${label}`}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-input-border bg-bg-primary text-text-secondary transition hover:border-red-400 hover:text-red-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label
          htmlFor={`${field.key}-upload`}
          className="group flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-[8px] border border-dashed border-input-border bg-input-bg/30 px-4 py-5 text-center transition hover:border-text-primary hover:bg-input-bg/60"
        >
          <span className="grid h-11 w-11 place-items-center rounded-full border border-input-border bg-bg-primary text-text-secondary transition group-hover:border-text-primary group-hover:text-text-primary">
            <ImagePlus className="h-5 w-5" />
          </span>
          <span className="mt-3 text-mid font-medium text-theme-text">
            {field.placeholder || "Upload image"}
          </span>
          <span className="mt-1 text-small text-input-text">
            {field.hint || "PNG, JPG, or WEBP"}
          </span>
        </label>
      )}
    </div>
  );
}

function StringArrayField({ field, label, value }) {
  const [items, setItems] = useState(() => normalizeStringArray(value));

  function addItem() {
    setItems((current) => [...current, ""]);
  }

  function removeItem(index) {
    setItems((current) =>
      current.filter((_, currentIndex) => currentIndex !== index),
    );
  }

  function updateItem(index, nextValue) {
    setItems((current) =>
      current.map((item, currentIndex) =>
        currentIndex === index ? nextValue : item,
      ),
    );
  }

  return (
    <div className="space-y-3 rounded-[8px] border border-input-border/40 bg-input-bg/30 p-3 sm:col-span-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-mid font-medium text-text-secondary">{label}</p>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-input-border bg-input-bg text-text-secondary transition hover:border-text-primary hover:text-text-primary"
          aria-label={`Add ${label}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <input type="hidden" name={`${field.key}.__count`} value={items.length} />
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-end gap-2">
            <Input
              label={`${field.itemLabel || "Item"} ${index + 1}`}
              name={`${field.key}.${index}`}
              value={item}
              onChange={(event) => updateItem(index, event.target.value)}
              inputClassName="rounded-[8px]"
            />
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="mb-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-red-500/40 text-red-400 transition hover:border-red-400 hover:text-red-300"
                aria-label={`Remove ${field.itemLabel || "item"} ${index + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function normalizeNetworkObjects(value) {
  if (Array.isArray(value) && value.length) {
    return value.map((network) => ({
      _id: network?._id || network?.id || "",
      networkName: network?.networkName || "",
      networkSymbol: network?.networkSymbol || "",
      chainId: network?.chainId || "",
      type: network?.type || "",
    }));
  }

  return [
    { _id: "", networkName: "", networkSymbol: "", chainId: "", type: "" },
  ];
}

function NetworkObjectsField({ field, label, value }) {
  const objectFields = field.objectFields || [
    { key: "_id", label: "Network ID" },
    { key: "networkName", label: "Network Name" },
    { key: "networkSymbol", label: "Network Symbol" },
    { key: "chainId", label: "Chain ID" },
    { key: "type", label: "Type" },
  ];
  const [networks, setNetworks] = useState(() =>
    normalizeNetworkObjects(value),
  );

  function addNetwork() {
    setNetworks((current) => [
      ...current,
      { _id: "", networkName: "", networkSymbol: "", chainId: "", type: "" },
    ]);
  }

  function removeNetwork(index) {
    setNetworks((current) =>
      current.filter((_, currentIndex) => currentIndex !== index),
    );
  }

  function updateNetwork(index, key, nextValue) {
    setNetworks((current) =>
      current.map((network, currentIndex) =>
        currentIndex === index ? { ...network, [key]: nextValue } : network,
      ),
    );
  }

  return (
    <div className="space-y-3 rounded-[8px] border border-input-border/40 bg-input-bg/30 p-3 sm:col-span-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-mid font-medium text-text-secondary">{label}</p>
        <button
          type="button"
          onClick={addNetwork}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-input-border bg-input-bg text-text-secondary transition hover:border-text-primary hover:text-text-primary"
          aria-label={`Add ${label}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <input
        type="hidden"
        name={`${field.key}.__count`}
        value={networks.length}
      />
      <div className="space-y-3">
        {networks.map((network, index) => (
          <div
            key={index}
            className="rounded-[8px] border border-input-border/40 bg-bg-primary p-3"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-small font-medium text-text-secondary">
                Network {index + 1}
              </p>
              {networks.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeNetwork(index)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-red-500/40 text-red-400 transition hover:border-red-400 hover:text-red-300"
                  aria-label={`Remove network ${index + 1}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {objectFields.map((objectField) => (
                <Input
                  key={objectField.key}
                  label={objectField.label}
                  name={`${field.key}.${index}.${objectField.key}`}
                  value={network[objectField.key] || ""}
                  onChange={(event) =>
                    updateNetwork(index, objectField.key, event.target.value)
                  }
                  inputClassName="rounded-[8px]"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getNetworkOptionValue(option) {
  return typeof option === "string" ? option : option?.value;
}

function getNetworkOptionLabel(option) {
  return typeof option === "string" ? option : option?.label;
}

function getNetworkConfigValue(value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  return String(value);
}

function normalizeNetworkConfigs(field, value) {
  const configFields = field.configFields || [];
  const configs = Array.isArray(value) && value.length ? value : [];

  return configs
    .map((config) => {
      const next = {
        networkId: String(
          config?.networkId || config?._id || config?.id || "",
        ).trim(),
        networkName: config?.networkName || "",
        networkSymbol: config?.networkSymbol || "",
      };

      configFields.forEach((configField) => {
        next[configField.key] = getNetworkConfigValue(
          config?.[configField.key],
        );
      });

      return next;
    })
    .filter((config) => config.networkId);
}

function NetworkConfigField({ field, label, value }) {
  const options = field.options || [];
  const configFields = field.configFields || [];
  const [configs, setConfigs] = useState(() =>
    normalizeNetworkConfigs(field, value),
  );
  const selectedIds = configs.map((config) => config.networkId);

  function getOptionByValue(networkId) {
    return options.find(
      (option) => String(getNetworkOptionValue(option)) === String(networkId),
    );
  }

  function createBlankConfig(networkId) {
    const option = getOptionByValue(networkId);
    const config = {
      networkId,
      networkName: option?.networkName || getNetworkOptionLabel(option) || "",
      networkSymbol: option?.networkSymbol || "",
    };

    configFields.forEach((configField) => {
      config[configField.key] = "";
    });

    return config;
  }

  function handleSelectionChange(nextIds) {
    setConfigs((current) =>
      nextIds.map((networkId) => {
        const normalizedId = String(networkId);

        return (
          current.find((config) => config.networkId === normalizedId) ||
          createBlankConfig(normalizedId)
        );
      }),
    );
  }

  function updateConfig(networkId, configFieldKey, nextValue) {
    setConfigs((current) =>
      current.map((config) =>
        config.networkId === networkId
          ? { ...config, [configFieldKey]: nextValue }
          : config,
      ),
    );
  }

  return (
    <div className="sm:col-span-2">
      <Dropdown
        label={label}
        options={options}
        value={selectedIds}
        onChange={handleSelectionChange}
        multiple
        disabled={field.disabled}
        placeholder={field.placeholder || "Select networks"}
        triggerClassName="rounded-[8px]"
      />

      {selectedIds.map((networkId) => (
        <input
          key={networkId}
          type="hidden"
          name={field.key}
          value={networkId}
        />
      ))}
      <input
        type="hidden"
        name={`${field.key}.__count`}
        value={configs.length}
      />

      {configs.length > 0 && (
        <div className="mt-4 space-y-4">
          {configs.map((config, index) => {
            const option = getOptionByValue(config.networkId);
            const networkName =
              option?.networkName || config.networkName || "Network";
            const networkSymbol =
              option?.networkSymbol || config.networkSymbol || "";

            return (
              <div
                key={config.networkId}
                className="rounded-[8px] border border-input-border/60 bg-bg-primary p-4"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-mid font-medium text-theme-text">
                      {networkName}
                    </p>
                    {networkSymbol && (
                      <p className="mt-0.5 truncate text-small text-text-secondary">
                        {networkSymbol}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-full border border-input-border/60 bg-input-bg px-3 py-1 text-small font-medium text-text-secondary">
                    Network Config
                  </span>
                </div>

                <div className="grid grid-cols-[repeat(auto-fit,minmax(10.75rem,1fr))] gap-4">
                  {configFields.map((configField) => (
                    <Input
                      key={configField.key}
                      label={configField.label}
                      name={`${field.key}.${index}.${configField.key}`}
                      value={config[configField.key] ?? ""}
                      type={configField.type ?? "text"}
                      placeholder={configField.placeholder}
                      onChange={(event) =>
                        updateConfig(
                          config.networkId,
                          configField.key,
                          event.target.value,
                        )
                      }
                      inputClassName="rounded-[8px]"
                    />
                  ))}
                </div>

                <input
                  type="hidden"
                  name={`${field.key}.${index}.networkId`}
                  value={config.networkId}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ReadOnlyField({ label, value }) {
  return (
    <div className="rounded-[8px] border border-input-border/40 bg-input-bg/50 p-3">
      <p className="text-small font-medium text-text-secondary">{label}</p>
      <p className="mt-1 break-words text-mid font-medium text-theme-text">
        {value || "-"}
      </p>
    </div>
  );
}

export default function Modal({
  open = false,
  mode = "view",
  title,
  description,
  data,
  fields,
  onClose,
  onSave,
  saveLabel = "Save changes",
  cancelLabel = "Cancel",
  closeLabel = "Close",
  className = "",
}) {
  const isEditMode = mode === "edit";
  const visibleFields = useMemo(
    () => buildFields(data, fields),
    [data, fields],
  );

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  function handleSubmit(event) {
    event.preventDefault();

    const formValues = new FormData(event.currentTarget);
    const updatedData = visibleFields.reduce(
      (values, field) => {
        if (field.editable === false) {
          return values;
        }

        if (field.type === "toggle") {
          return {
            ...values,
            [field.key]: formValues.get(field.key) === "true",
          };
        }

        if (field.type === "imageUpload") {
          const file = formValues.get(field.key);
          const existingImage = String(
            formValues.get(`${field.key}.__existing`) || "",
          );
          const removed = formValues.get(`${field.key}.__removed`) === "true";

          if (file && typeof file === "object" && file.size > 0) {
            return { ...values, [field.key]: file };
          }

          return { ...values, [field.key]: removed ? "" : existingImage };
        }

        if (field.type === "select") {
          return {
            ...values,
            [field.key]: String(formValues.get(field.key) || "").trim(),
          };
        }

        if (field.type === "multiSelect") {
          const nextItems = formValues
            .getAll(field.key)
            .map((item) => String(item || "").trim())
            .filter(Boolean);

          return { ...values, [field.key]: nextItems };
        }

        if (field.type === "stringArray") {
          const count = Number(formValues.get(`${field.key}.__count`) || 0);
          const nextItems = Array.from({ length: count })
            .map((_, index) =>
              String(formValues.get(`${field.key}.${index}`) || "").trim(),
            )
            .filter(Boolean);

          return { ...values, [field.key]: nextItems };
        }

        if (field.type === "networkObjects") {
          const count = Number(formValues.get(`${field.key}.__count`) || 0);
          const objectFields = field.objectFields || [];
          const nextNetworks = Array.from({ length: count })
            .map((_, index) =>
              Object.fromEntries(
                objectFields.map((objectField) => [
                  objectField.key,
                  String(
                    formValues.get(
                      `${field.key}.${index}.${objectField.key}`,
                    ) || "",
                  ).trim(),
                ]),
              ),
            )
            .filter((network) => Object.values(network).some(Boolean));

          return { ...values, [field.key]: nextNetworks };
        }

        if (field.type === "networkConfig") {
          const count = Number(formValues.get(`${field.key}.__count`) || 0);
          const configFields = field.configFields || [];
          const nextConfigs = Array.from({ length: count })
            .map((_, index) => {
              const config = {
                networkId: String(
                  formValues.get(`${field.key}.${index}.networkId`) || "",
                ).trim(),
              };

              configFields.forEach((configField) => {
                config[configField.key] = String(
                  formValues.get(`${field.key}.${index}.${configField.key}`) ||
                    "",
                ).trim();
              });

              return config;
            })
            .filter((config) => config.networkId);

          return { ...values, [field.key]: nextConfigs };
        }

        return {
          ...values,
          [field.key]:
            formValues.get(field.key) ?? getFieldValue(data, field.key),
        };
      },
      { ...data },
    );

    onSave?.(updatedData);
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 px-4 py-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={joinClasses(
          "flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-rounded border border-input-border/60 bg-bg-primary shadow-2xl",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-input-border/40 px-5 py-4">
          <div className="space-y-1">
            {title && (
              <h2 className="text-large font-semibold text-theme-text">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-small text-text-secondary">{description}</p>
            )}
          </div>
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-input-border bg-input-bg text-text-secondary transition hover:border-text-secondary hover:text-theme-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="grid gap-4 overflow-y-auto px-5 py-5 sm:grid-cols-2">
            {visibleFields.map((field, fieldIndex) => {
              const rawValue = data?.[field.key];
              const value = getFieldValue(data, field.key);
              const fieldLabel = field.label ?? humanizeKey(field.key);
              const isEditable = isEditMode && field.editable !== false;
              const fieldRenderKey = `${field.key}-${fieldIndex}`;

              if (!isEditable) {
                return (
                  <ReadOnlyField
                    key={fieldRenderKey}
                    label={fieldLabel}
                    value={value}
                  />
                );
              }

              if (field.type === "toggle") {
                return (
                  <ToggleField
                    key={fieldRenderKey}
                    field={field}
                    label={fieldLabel}
                    value={rawValue}
                  />
                );
              }

              if (field.type === "imageUpload") {
                return (
                  <ImageUploadField
                    key={fieldRenderKey}
                    field={field}
                    label={fieldLabel}
                    value={rawValue}
                  />
                );
              }

              if (field.type === "select") {
                return (
                  <SelectField
                    key={fieldRenderKey}
                    field={field}
                    label={fieldLabel}
                    value={rawValue}
                  />
                );
              }

              if (field.type === "multiSelect") {
                return (
                  <MultiSelectField
                    key={fieldRenderKey}
                    field={field}
                    label={fieldLabel}
                    value={rawValue}
                  />
                );
              }

              if (field.type === "stringArray") {
                return (
                  <StringArrayField
                    key={fieldRenderKey}
                    field={field}
                    label={fieldLabel}
                    value={rawValue}
                  />
                );
              }

              if (field.type === "networkObjects") {
                return (
                  <NetworkObjectsField
                    key={fieldRenderKey}
                    field={field}
                    label={fieldLabel}
                    value={rawValue}
                  />
                );
              }

              if (field.type === "networkConfig") {
                return (
                  <NetworkConfigField
                    key={fieldRenderKey}
                    field={field}
                    label={fieldLabel}
                    value={rawValue}
                  />
                );
              }

              return (
                <Input
                  key={fieldRenderKey}
                  label={fieldLabel}
                  name={field.key}
                  defaultValue={value}
                  type={field.type ?? "text"}
                  inputClassName="rounded-[8px]"
                />
              );
            })}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-input-border/40 px-5 py-4 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              {isEditMode ? cancelLabel : closeLabel}
            </Button>
            {isEditMode && (
              <Button type="submit" className="w-full sm:w-auto">
                {saveLabel}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
