import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui";
import { ChevronRightIcon } from "@/components/ui/icons";

export interface CodecActionsProps {
  onEncode: () => void;
  onDecode: () => void;
}

export function CodecActions({ onEncode, onDecode }: CodecActionsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-row items-center justify-center gap-2 lg:flex-col lg:py-8">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={onEncode}
        className="min-w-[7.5rem]"
      >
        <span>{t("tools.codec.encode")}</span>
        <ChevronRightIcon size={16} />
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={onDecode}
        className="min-w-[7.5rem]"
      >
        <span>{t("tools.codec.decode")}</span>
        <ChevronRightIcon size={16} />
      </Button>
    </div>
  );
}
