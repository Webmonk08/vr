"use client";

import { useEffect } from "react";
import { ErrorPage } from "@/component/error-page";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorPage 
      errorType="general" 
      message={error.message || "Something went wrong!"} 
      onNavigate={(page) => {
        if (page === 'home') window.location.href = '/';
        else window.location.href = `/${page}`;
      }}
    />
  );
}