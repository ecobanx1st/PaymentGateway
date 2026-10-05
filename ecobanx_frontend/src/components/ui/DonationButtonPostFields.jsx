"use client";

import MerchantPostFieldsExamples from "@/components/ui/MerchantPostFieldsExamples";

const minimalButtonCode = `<form action="https://pgdemo1.hashcodexperts.com/makepayment" method="post">
    <input type="hidden" name="cmd" value="_donate">
    <input type="hidden" name="reset" value="1">
    <input type="hidden" name="merchant" value="dd3a13c8b7ca47f5434ab0776a5b5b67">
    <input type="hidden" name="currency" value="ETH">
    <input type="hidden" name="amount" value="10.00000000">
    <input type="hidden" name="item_name" value="Test Item">
    <input type="hidden" name="want_shipping" value="0">
    <input type="image" src="https://pgdemo1.hashcodexperts.com/img/paymentlogos.svg" alt="Donate with Hashcodex">
</form>`;

const descriptionButtonCode = `<form action="https://pgdemo1.hashcodexperts.com/makepayment" method="post">
    <input type="hidden" name="cmd" value="_donate">
    <input type="hidden" name="reset" value="1">
    <input type="hidden" name="merchant" value="dd3a13c8b7ca47f5434ab0776a5b5b67">
    <input type="hidden" name="item_name" value="">
    <input type="hidden" name="item_desc" value="">
    <input type="hidden" name="item_number" value="">
    <input type="hidden" name="invoice" value="">
    <input type="hidden" name="currency" value="USD">
    <input type="hidden" name="want_shipping" value="0">
    <input type="hidden" name="amount" value="10.00000000">
    <input type="hidden" name="want_shipping" value="0">
    <input type="hidden" name="success_url" value="">
    <input type="hidden" name="cancel_url" value="">
    <input type="hidden" name="ipn_url" value="">
    <input type="image" src="https://pgdemo1.hashcodexperts.com/img/paymentlogos.svg" alt="Donate with Hashcodex">
</form>`;

const examples = [
  { title: "Minimal Button", code: minimalButtonCode },
  {
    title: "Button with Item Description",
    code: descriptionButtonCode,
    textareaClassName: "min-h-[315px]",
  },
];

export default function DonationButtonPostFields() {
  return (
    <MerchantPostFieldsExamples
      title="Donation Button Maker Example"
      description="Donation checkout examples for a minimal donation button and a richer donation button with item metadata."
      examples={examples}
      previewVariant="primaryButton"
    />
  );
}