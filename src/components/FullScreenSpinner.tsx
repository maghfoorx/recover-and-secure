import { Loader2 } from "lucide-react";
export default function FullScreenSpinner({ size = 60 }: { size?: number }) {
  return <Loader2 className="animate-spin" size={size} />;
}
