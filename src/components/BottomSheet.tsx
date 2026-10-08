import type { ReactNode } from "react";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description: string;
  children: ReactNode;
}

/**
 * Details panel that slides up from the bottom like in a native app: swipe it
 * down or tap outside to close it. It keeps to the app's width and its content
 * scrolls vertically only, so nothing can stick out or wobble sideways.
 */
const BottomSheet = ({ open, onOpenChange, title, description, children }: BottomSheetProps) => (
  <Drawer open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}>
    <DrawerContent className="mx-auto max-h-[92dvh] w-full max-w-md rounded-t-3xl">
      <DrawerHeader className="px-5 pb-3 text-left">
        <DrawerTitle className="flex items-center gap-2 font-serif text-xl">{title}</DrawerTitle>
        <DrawerDescription>{description}</DrawerDescription>
      </DrawerHeader>
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {children}
      </div>
    </DrawerContent>
  </Drawer>
);

export default BottomSheet;
