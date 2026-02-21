import { useState, useEffect, useRef } from "react";
import {
  BedDouble,
  Sofa,
  Bath,
  Laptop,
  Warehouse,
  CircleQuestionMark,
} from "lucide-react";

import { loadConfig } from "../lib/api";
import FieldInput from "../components/field-input";
import SaveButton from "../components/save-button";

import "../styles/tv.css";

export default function Tvs() {
  const [settings, setSettings] = useState({});
  const [alarms, setAlarms] = useState({});
  const [content, setContent] = useState({});
  const [editingTvId, setEditingTvId] = useState(null);

  const [formState, setFormState] = useState({
    name: "",
    ip: "",
    powerOnTimeout: 3000,
    icon: "unknown",
  });

  const [isLoaded, setIsLoaded] = useState(false);

  const modalRef = useRef(null);

  useEffect(() => {
    loadConfig().then((data) => {
      setSettings(data.settings);
      setAlarms(data.alarms);
      setContent(data.content);
      setIsLoaded(true);
    });
  }, []);

  function openEditModal(id = null, data = null) {
    setEditingTvId(id);

    if (data) {
      setFormState({
        name: data.name || "",
        ip: data.ip || "",
        powerOnTimeout: data.powerOnTimeout || 3000,
        icon: data.icon || "unknown",
      });
    } else {
      setFormState({
        name: "",
        ip: "",
        powerOnTimeout: 3000,
        icon: "unknown",
      });
    }

    modalRef.current?.showModal();
  }

  function closeModal() {
    modalRef.current?.close();
    setEditingTvId(null);
  }

  function handleFieldChange(field, value) {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const buttonValue = e.nativeEvent.submitter.value;
    if (buttonValue === "Cancel") {
      const areYouSure = confirm("Are you sure you want to cancel?");
      if (!areYouSure) return;
      closeModal();
      return;
    }

    if (!formState.name || !formState.ip) return;

    const tvId = editingTvId || Date.now().toString();

    setSettings((prev) => ({
      ...prev,
      tvs: {
        ...prev.tvs,
        [tvId]: {
          ...formState,
        },
      },
    }));

    closeModal();
  }

  function Tv({ id, data }) {
    function getIcon(tv) {
      switch (tv.icon) {
        case "bed":
          return <BedDouble />;
        case "sofa":
          return <Sofa />;
        case "bath":
          return <Bath />;
        case "laptop":
          return <Laptop />;
        case "warehouse":
          return <Warehouse />;
        default:
          return <CircleQuestionMark />;
      }
    }

    const tvAlarms = Object.values(alarms.enabled || {}).filter(
      (alarm) => alarm.tvId === id,
    );

    return (
      <div className="tv-item">
        <span className="tv-icon">{getIcon(data)}</span>
        <span>Name: {data.name}</span>
        <span>IP: {data.ip}</span>
        <span>Power On Timeout: {data.powerOnTimeout}</span>
        <span>ID: {id}</span>

        <div>
          <h3>Alarms: {tvAlarms.length}</h3>
          {tvAlarms.map((alarm) => (
            <div key={alarm.id + "-" + alarm.time}>
              <span>Time: {alarm.time}</span>
              <span>Repeat: {alarm.repeat ? "yes" : "no"}</span>
              <span>
                Content: {content[alarm.contentId]?.name || "Unknown"}
              </span>
              <span>Days: {alarm.days.join(", ")}</span>
            </div>
          ))}
        </div>

        <button onClick={() => openEditModal(id, data)}>Edit</button>
      </div>
    );
  }

  if (!isLoaded) return <main>Loading...</main>;

  return (
    <main>
      <h1>TVs</h1>

      <dialog ref={modalRef}>
        <form onSubmit={handleSubmit}>
          <div className="form-header">
            <h2>{editingTvId ? "Edit TV" : "New TV"}</h2>
            {editingTvId && <h3> ID: {editingTvId}</h3>}
          </div>
          <div className="tv-icons">
            {[
              { value: "unknown", icon: <CircleQuestionMark /> },
              { value: "bed", icon: <BedDouble /> },
              { value: "sofa", icon: <Sofa /> },
              { value: "bath", icon: <Bath /> },
              { value: "laptop", icon: <Laptop /> },
              { value: "warehouse", icon: <Warehouse /> },
            ].map(({ value, icon }) => (
              <label key={value}>
                <input
                  type="radio"
                  name="icon"
                  value={value}
                  checked={formState.icon === value}
                  onChange={(e) => handleFieldChange("icon", e.target.value)}
                />
                {icon}
              </label>
            ))}
          </div>

          <FieldInput
            label="Name"
            description="Name of the TV"
            placeholder="My TV"
            name="name"
            type="text"
            required
            value={formState.name}
            onChange={handleFieldChange}
          />

          <FieldInput
            label="IP"
            description="IP address of the TV"
            placeholder="192.168.#.#"
            pattern="(\b25[0-5]|\b2[0-4][0-9]|\b[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}"
            name="ip"
            type="text"
            required
            value={formState.ip}
            onChange={handleFieldChange}
          />

          <FieldInput
            label="Power on timeout"
            description="How long to wait for the TV to power on (in milliseconds) before launching the video. Should be increased if the TV is slow to power on. 1000 milliseconds = 1 second"
            factoryDefault="3000"
            placeholder="3000"
            name="powerOnTimeout"
            type="number"
            min="0"
            max="60000"
            required
            value={formState.powerOnTimeout}
            onChange={handleFieldChange}
          />

          <div className="form-actions">
            <input type="submit" value="Cancel" formNoValidate />
            <input type="submit" value="Save" />
          </div>
        </form>
      </dialog>

      <button onClick={() => openEditModal()}>Add TV</button>

      <div className="tv-list">
        {Object.entries(settings.tvs || {}).map(([id, tv]) => (
          <Tv key={id} id={id} data={tv} />
        ))}
      </div>

      <SaveButton data={settings} configName="settings" />
    </main>
  );
}
