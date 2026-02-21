import { useState, useEffect } from "react";
import { saveConfig } from "../lib/api";
import { useBlocker } from "react-router";

function useUnsavedChangesWarning(when) {
  const blocker = useBlocker(when);

  useEffect(() => {
    if (!when) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue =
        "You have unsaved changes. If you leave, they will be lost.";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [when]);

  // Block React Router navigation
  useEffect(() => {
    if (blocker.state === "blocked") {
      const confirmLeave = window.confirm(
        "You have unsaved changes. Leave anyway?",
      );

      if (confirmLeave) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker]);
}

export default function SaveButton({ data, configName }) {
  const [savedData, setSavedData] = useState(data);

  const unsavedChanges = JSON.stringify(data) !== JSON.stringify(savedData);

  useUnsavedChangesWarning(unsavedChanges);

  function saveData() {
    saveConfig(configName, data).then(() => {
      setSavedData(data);
    });
  }

  return unsavedChanges ? (
    <div className="save-container">
      <span className="unsaved-changes">Unsaved changes</span>
      <button onClick={saveData} className="save-button">
        Save changes
      </button>
    </div>
  ) : null;
}
