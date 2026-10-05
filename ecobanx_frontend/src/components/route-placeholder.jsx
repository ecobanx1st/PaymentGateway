import PageTopBanner from "@/components/ui/PageTopBanner";

export default function RoutePlaceholder({
  eyebrow = "Coming soon",
  title,
  description,
}) {
  return (
    <PageTopBanner eyebrow={eyebrow} title={title} description={description} />
  );
}
