import { useEffect } from "react";

export default function DocuSignPage() {
  useEffect(() => {
    window.location.href = "https://account.docusign.com/";
  }, []);

  return null;
}
