"use client";

import MerchantPostFieldsExamples from "@/components/ui/MerchantPostFieldsExamples";

const minimalButtonCode = `<form action="https://hallamoney.io/makepayment" method="post">
    <input type="hidden" name="cmd" value="_pay_simple">
    <input type="hidden" name="reset" value="1">
    <input type="hidden" name="merchant" value="xxxxxxxxxxxxx">
    <input type="hidden" name="item_name" value="Item Name">
    <input type="hidden" name="item_desc" value="">
    <input type="hidden" name="item_number" value="678">
    <input type="hidden" name="invoice" value="4688">
    <input type="hidden" name="currency" value="USD">
    <input type="hidden" name="amountf" value="10">
    <input type="hidden" name="want_shipping" value="0">
    <input type="hidden" name="success_url" value="https://...">
    <input type="hidden" name="cancel_url" value="https://...">
    <input type="hidden" name="ipn_url" value="https://...">
    <input type="image" src="https://hallamoney.io/img/paymentlogos.svg" alt="Pay with halla">
</form>`;

const descriptionButtonCode = `<form action="https://hallamoney.io/makepayment" method="post">
    <input type="hidden" name="cmd" value="_pay_simple">
    <input type="hidden" name="reset" value="1">
    <input type="hidden" name="merchant" value="xxxxxxxxxxxxx">
    <input type="hidden" name="item_name" value="Item Name">
    <input type="hidden" name="item_desc" value="Annual access plan">
    <input type="hidden" name="item_number" value="678">
    <input type="hidden" name="invoice" value="4688">
    <input type="hidden" name="currency" value="USD">
    <input type="hidden" name="amountf" value="10.00">
    <input type="hidden" name="want_shipping" value="0">
    <input type="hidden" name="success_url" value="https://...">
    <input type="hidden" name="cancel_url" value="https://...">
    <input type="hidden" name="ipn_url" value="https://...">
    <input type="image" src="https://hallamoney.io/img/paymentlogos.svg" alt="Pay with halla">
</form>`;

const examples = [
  { title: "Minimal Button", code: minimalButtonCode },
  { title: "Button with Item Description", code: descriptionButtonCode },
];

export default function SimpleButtonPostFields() {
  return (
    <MerchantPostFieldsExamples
      title="Simple Button Maker Example"
      description="Two simple checkout button examples using the current themed payment button."
      examples={examples}
      previewVariant="primaryButton"
    />
  );
}