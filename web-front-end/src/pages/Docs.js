import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

const Docs = () => {
  const GeneralKnowledgeUrl =
    "https://sitruong-tr7.gitbook.io/crypto-investment-1/crypto-investment/general-knowledge";
  const openInNewTab = (url) => {
    const newWindow = window.open(url, "_blank", "noopener,noreferrer");
    if (newWindow) newWindow.opener = null;
  };
  const [markdown, setMarkdown] = useState("");

  useEffect(() => {
    fetch("/docs.md")
      .then((response) => response.text())
      .then((text) => setMarkdown(text));
  }, []);

  return (
    <>
      <div
        className="custom-xlink"
        onClick={() => openInNewTab(GeneralKnowledgeUrl)}
      >
        General Knowledge
      </div>
      {/* <ReactMarkdown children={markdown}></ReactMarkdown> */}
    </>
  );
};

export default Docs;
