"use client";

import { Suspense } from "react";
import ResetPasswordContent from "../../components/auth/ResetPasswordContent";
import useTranslate from "@/app/hooks/useTranslate";

export default function Page() {
  const { t } = useTranslate();

  return (
    <Suspense fallback={<p className="text-white">{t("Loading...")}</p>}>
      <ResetPasswordContent />
    </Suspense>
  );
}