import { Suspense } from "react";
import ResetPasswordContent from "../../components/ResetPasswordContent";

export default function Page() {
  return (
    <Suspense fallback={<p className="text-white">Loading...</p>}>
      <ResetPasswordContent />
    </Suspense>
  );
}