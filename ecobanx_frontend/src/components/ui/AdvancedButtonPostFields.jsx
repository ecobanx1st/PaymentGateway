"use client";

import MerchantPostFieldsExamples from "@/components/ui/MerchantPostFieldsExamples";

const advancedButtonCode = `<form action="#" method="post">
    <input type="hidden" name="cmd" value="_pay_simple">
    <input type="hidden" name="reset" value="1">
    <input type="hidden" name="merchant" value="xxxxxxxxxxxxx">
    <input type="hidden" name="item_name" value="xxxxxxxxxxxxx">
    <input type="hidden" name="item_desc" value="xxxxxxxxxxxxx">
    <input type="hidden" name="item_number" value="123456789">
    <input type="hidden" name="invoice" value="123456789">
    <input type="hidden" name="quantity" value="1">
    <input type="hidden" name="update_quantity" value="0">
    <input type="hidden" name="currency" value="BTC">
    <input type="hidden" name="amount" value="10.00000000">
    <input type="hidden" name="want_shipping" value="0">
    <input type="hidden" name="shipping_cost" value="0.00000000">
    <input type="hidden" name="shipping_cost_additional" value="0.00000000">
    <input type="hidden" name="success_url" value="https://...">
    <input type="hidden" name="cancel_url" value="https://...">
    <input type="hidden" name="ipn_url" value="https://...">
    <input type="hidden" name="buyer_leave_msg" value="0">
    <input type="image" src="" alt="">
</form>`;

const examples = [
  {
    title: "Advanced Button",
    code: advancedButtonCode,
    textareaClassName: "min-h-[360px]",
  },
];

export default function AdvancedButtonPostFields() {
  return (
    <MerchantPostFieldsExamples
      title="Advanced Button Maker Example"
      description="A complete advanced checkout button example with quantity, shipping, redirect, IPN, and buyer note fields."
      examples={examples}
      previewVariant="primaryButton"
    />
  );
}