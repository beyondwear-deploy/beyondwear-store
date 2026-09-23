"use client";
import { Modal } from "@/components/ui/Modal";
import { useUI } from "@/store";
import { SizeGuideContent } from "./SizeGuideContent";

export function SizeGuideModal() {
  const open = useUI((s) => s.sizeGuideOpen);
  const set = useUI((s) => s.setSizeGuideOpen);
  return (
    <Modal open={open} onClose={() => set(false)} title="Size guide" wide>
      <div className="overflow-y-auto p-5 sm:p-7"><SizeGuideContent /></div>
    </Modal>
  );
}
