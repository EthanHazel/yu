import { useState, useEffect } from "react";
import {
  Clock,
  CalendarSync,
  BedDouble,
  Sofa,
  Bath,
  Laptop,
  Warehouse,
  CircleQuestionMark,
  Clapperboard,
} from "lucide-react";

import { loadConfig, launchContent } from "../lib/api";
import FieldInput from "../components/field-input";
import SaveButton from "../components/save-button";

import "../styles/alarms.css";

export default function Alarms() {
  const DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const FORMAL_DAYS = {
    sun: "Sunday",
    mon: "Monday",
    tue: "Tuesday",
    wed: "Wednesday",
    thu: "Thursday",
    fri: "Friday",
    sat: "Saturday",
  };

  const [data, setData] = useState({
    alarms: {
      enabled: {},
      disabled: {},
    },
    settings: {
      tvs: {},
    },
    content: {},
  });
  const [isLoaded, setIsLoaded] = useState(false);

  const [editingAlarmId, setEditingAlarmId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    time: "",
    repeat: false,
    contentId: "",
    tvId: "",
    days: [],
  });

  useEffect(() => {
    loadConfig().then((newData) => {
      setData(newData || {});
      setIsLoaded(true);
    });
  }, []);

  function closeModal() {
    document.getElementById("edit-alarm-modal").close();
    setEditingAlarmId(null);
  }

  function toggleAlarm(alarmId) {
    setData((prev) => {
      const isEnabled = !!prev.alarms.enabled[alarmId];
      const from = isEnabled ? "enabled" : "disabled";
      const to = isEnabled ? "disabled" : "enabled";

      const alarm = prev.alarms[from][alarmId];

      const newFrom = { ...prev.alarms[from] };
      delete newFrom[alarmId];

      return {
        ...prev,
        alarms: {
          ...prev.alarms,
          [from]: newFrom,
          [to]: {
            ...prev.alarms[to],
            [alarmId]: alarm,
          },
        },
      };
    });
  }

  function openEditModal(alarmId = new Date().getTime(), alarm) {
    setEditingAlarmId(alarmId);
    if (alarm) {
      setEditFormData({
        name: alarm.name,
        time: alarm.time,
        repeat: alarm.repeat,
        tvId: alarm.tvId,
        contentId: alarm.contentId,
        days: alarm.days,
      });
    } else {
      setEditFormData({
        name: "",
        time: "",
        repeat: false,
        tvId: Object.keys(data.settings.tvs)[0],
        contentId: Object.keys(data.content)[0],
        days: [],
      });
    }

    document.getElementById("edit-alarm-modal").showModal();
  }

  function handleAlarmFormSubmit(e) {
    e.preventDefault();

    const buttonValue = e.nativeEvent.submitter.value;
    if (buttonValue === "Cancel") {
      const areYouSure = confirm("Are you sure you want to cancel?");
      if (!areYouSure) return;
      closeModal();
      return;
    }

    setData((prev) => {
      const exists =
        prev.alarms.enabled[editingAlarmId] ||
        prev.alarms.disabled[editingAlarmId];

      // If alarm already exists, update normally
      if (exists) {
        const isEnabled = !!prev.alarms.enabled[editingAlarmId];
        const bucket = isEnabled ? "enabled" : "disabled";

        return {
          ...prev,
          alarms: {
            ...prev.alarms,
            [bucket]: {
              ...prev.alarms[bucket],
              [editingAlarmId]: {
                ...prev.alarms[bucket][editingAlarmId],
                ...editFormData,
              },
            },
          },
        };
      }

      // If it's a new alarm, add to enabled
      return {
        ...prev,
        alarms: {
          ...prev.alarms,
          enabled: {
            ...prev.alarms.enabled,
            [editingAlarmId]: {
              ...editFormData,
            },
          },
        },
      };
    });

    closeModal();
  }

  function handleFieldChange(fieldName, value) {
    setEditFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  }

  function handleDayChange(day) {
    setEditFormData((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day],
    }));
  }

  function TvIcon({ icon }) {
    switch (icon) {
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

  const allAlarms = {
    ...data.alarms.enabled,
    ...data.alarms.disabled,
  };

  const sortedAlarmEntries = Object.entries(allAlarms).sort(([, a], [, b]) =>
    a.time.localeCompare(b.time),
  );

  if (!isLoaded) {
    return <main>Loading...</main>;
  }

  return (
    <main>
      {/* SECTION 1 — ALL ALARMS */}

      <section className="alarm-section">
        <h2>All Alarms</h2>

        {sortedAlarmEntries.map(([alarmId, alarm]) => {
          const isEnabled = !!data.alarms.enabled[alarmId];

          return (
            <div className="alarm" key={alarmId}>
              <h3>{alarm.name}</h3>

              <p>
                <Clapperboard />
                {data.content[alarm.contentId].name}
              </p>

              <p>
                <Clock />
                {alarm.time}
              </p>

              <p>
                <CalendarSync />
                {alarm.repeat ? "Repeats every week" : "One time"}
              </p>

              <p>
                <TvIcon icon={data.settings.tvs[alarm.tvId].icon} />
                {data.settings.tvs[alarm.tvId].name}
              </p>

              <p>Status: {isEnabled ? "Enabled" : "Disabled"}</p>

              <input
                type="button"
                value="Edit"
                onClick={() => openEditModal(alarmId, alarm)}
              />

              <input
                type="checkbox"
                checked={isEnabled}
                onChange={() => toggleAlarm(alarmId)}
              />

              <input
                type="button"
                value="Test Launch"
                onClick={() => launchContent(alarm.contentId, alarm.tvId)}
              />
            </div>
          );
        })}
        <button onClick={() => openEditModal()}>New Alarm</button>
      </section>

      {/* SECTION 2 — WEEKLY CALENDAR */}

      <section className="calendar-section">
        <h2>This Weeks Schedule</h2>

        <div className="calendar-grid">
          {/* Sort by the data.settings.weekStartDay first (sun or mon) */}
          {DAYS.slice(DAYS.indexOf(data.settings.weekStartDay))
            .concat(DAYS.slice(0, DAYS.indexOf(data.settings.weekStartDay)))
            .map((day) => (
              <div
                key={day}
                className={
                  "calendar-day" +
                  (day === DAYS[new Date().getDay()] ? " today" : "")
                }
              >
                <h3>{FORMAL_DAYS[day]}</h3>

                {sortedAlarmEntries
                  .filter(
                    ([alarmId, alarm]) =>
                      alarm.days.includes(day) &&
                      !!data.alarms.enabled[alarmId],
                  )
                  .map(([alarmId, alarm]) => (
                    <div key={alarmId} className="calendar-alarm">
                      {alarm.name} — {alarm.time}
                    </div>
                  ))}
              </div>
            ))}
        </div>
      </section>

      {/* Modal */}
      <dialog id="edit-alarm-modal">
        <form onSubmit={handleAlarmFormSubmit}>
          <FieldInput
            label="Name"
            name="name"
            type="text"
            value={editFormData.name}
            onChange={handleFieldChange}
            description="Name of the alarm"
            required
          />
          <FieldInput
            label="TV"
            name="tvId"
            type="select"
            description="TV to show the content on"
            required
            value={editFormData.tvId}
            onChange={handleFieldChange}
          >
            {Object.entries(data.settings.tvs).map(([tvId, tv]) => (
              <option key={tvId} value={tvId}>
                {tv.name}
              </option>
            ))}
          </FieldInput>

          <FieldInput
            label="Content"
            name="contentId"
            type="select"
            description="Content to show on the TV"
            required
            value={editFormData.contentId}
            onChange={handleFieldChange}
          >
            {Object.entries(data.content).map(([contentId, content]) => (
              <option key={contentId} value={contentId}>
                {content.name}
              </option>
            ))}
          </FieldInput>

          <FieldInput
            label="Time"
            name="time"
            type="time"
            description="Time to show the content"
            value={editFormData.time}
            onChange={handleFieldChange}
            required
          />

          <FieldInput
            label="Repeat"
            name="repeat"
            type="checkbox"
            description="Repeat the alarm every week"
            value={editFormData.repeat}
            onChange={handleFieldChange}
          />

          <fieldset>
            <legend>Days of the week</legend>

            {DAYS.map((day) => (
              <FieldInput
                key={day}
                label={FORMAL_DAYS[day]}
                name={day}
                type="checkbox"
                value={editFormData.days.includes(day)}
                onChange={() => handleDayChange(day)}
              />
            ))}
          </fieldset>

          <div className="form-actions">
            <input type="submit" value="Save" />
            <input type="submit" value="Cancel" formNoValidate />
          </div>
        </form>
      </dialog>

      <SaveButton data={data.alarms} configName="alarms" />
    </main>
  );
}
