import { useState, useEffect } from "react";

import { loadConfig, saveConfig } from "../lib/api";
import FieldInput from "../components/field-input";
import SaveButton from "../components/save-button";

export default function Settings() {
  const [settings, setSettings] = useState({
    defaultMaxResults: "",
    defaultMinVideoLength: "",
    weekStartDay: "",
  });

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadConfig("settings").then((data) => {
      setSettings((prev) => ({
        ...prev,
        ...data,
      }));
      setIsLoaded(true);
    });
  }, []);

  function handleFieldChange(field, value) {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function saveSettings(e) {
    e.preventDefault();
    saveConfig("settings", settings);
    alert("Settings saved");
  }

  if (!isLoaded)
    return (
      <main>
        <p>Loading...</p>
      </main>
    );

  return (
    <main>
      <h1>Settings</h1>

      <section className="settings-section">
        <form onSubmit={saveSettings}>
          <FieldInput
            name="defaultMaxResults"
            label="Default max results"
            description="Number of videos fetched when selecting a random video (API max 50)"
            factoryDefault="50"
            type="number"
            min="1"
            max="50"
            required
            value={settings.defaultMaxResults}
            onChange={handleFieldChange}
          />

          <FieldInput
            name="defaultMinVideoLength"
            label="Default min video length (milliseconds)"
            description="Minimum video length when selecting random videos. Keep above 180 to avoid Shorts."
            factoryDefault="180"
            type="number"
            min="0"
            max="43200"
            required
            value={settings.defaultMinVideoLength}
            onChange={handleFieldChange}
          />

          <FieldInput
            name="weekStartDay"
            label="Week start day"
            description="Defines the first day of the week (Sunday or Monday)."
            factoryDefault="sun"
            value={settings.weekStartDay}
            onChange={handleFieldChange}
            type="select"
          >
            <option value="sun">Sunday</option>
            <option value="mon">Monday</option>
          </FieldInput>

          <SaveButton data={settings} configName="settings" />
        </form>
      </section>
    </main>
  );
}
