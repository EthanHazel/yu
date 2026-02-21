import { useState, useEffect, useRef } from "react";

import { loadConfig } from "../lib/api";
import FieldInput from "../components/field-input";
import SaveButton from "../components/save-button";

export default function Content() {
  const [content, setContent] = useState({});
  const [editingContentId, setEditingContentId] = useState(null);
  const [selectedType, setSelectedType] = useState("");
  const [formState, setFormState] = useState({
    name: "",
    type: "",
    id: "",
    pool: [],
  });
  const [isLoaded, setIsLoaded] = useState(false);

  const modalRef = useRef(null);

  useEffect(() => {
    loadConfig("content").then((data) => {
      setContent(data || {});
      setIsLoaded(true);
    });
  }, []);

  function openEditModal(contentId = null, data = null) {
    setEditingContentId(contentId);

    if (data) {
      setFormState({
        name: data.name || "",
        type: data.type || "",
        id: data.id || "",
        pool: data.pool || [],
      });
      setSelectedType(data.type);
    } else {
      setFormState({
        name: "",
        type: "",
        id: "",
        pool: [],
      });
      setSelectedType("");
    }

    modalRef.current?.showModal();
  }

  function closeModal() {
    modalRef.current?.close();
    setEditingContentId(null);
  }

  function handleFieldChange(field, value) {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "type") {
      setSelectedType(value);
    }
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

    if (!formState.name || !formState.type) return;

    const contentId = editingContentId || Date.now().toString();

    const updatedItem =
      formState.type === "random_pool"
        ? {
            name: formState.name,
            type: formState.type,
            pool: formState.pool,
          }
        : {
            name: formState.name,
            type: formState.type,
            id: formState.id,
          };

    setContent((prev) => ({
      ...prev,
      [contentId]: updatedItem,
    }));

    closeModal();
  }

  function ContentGroup({ contentId, data }) {
    return (
      <div>
        <h2>
          {data.name} : {contentId}
        </h2>
        <p>Type: {data.type}</p>
        {data.id && <p>Data ID: {data.id}</p>}
        {data.pool && <p>Pool: [ {data.pool.join(", ")} ]</p>}
        <button onClick={() => openEditModal(contentId, data)}>Edit</button>
      </div>
    );
  }

  if (!isLoaded) return <main>Loading...</main>;

  return (
    <main>
      <h1>Content</h1>

      {Object.entries(content).map(([contentId, data]) => (
        <ContentGroup key={contentId} contentId={contentId} data={data} />
      ))}

      <dialog ref={modalRef}>
        <form onSubmit={handleSubmit}>
          <FieldInput
            type="text"
            name="name"
            label="Name"
            required
            value={formState.name}
            onChange={handleFieldChange}
          />

          <FieldInput
            type="select"
            name="type"
            label="Content Type"
            required
            value={formState.type}
            onChange={handleFieldChange}
          >
            <option value="">Select Type</option>
            <option value="channel_latest">Channel Latest</option>
            <option value="channel_random">Channel Random</option>
            <option value="fixed_video">Fixed Video</option>
            <option value="playlist_latest">Playlist Latest</option>
            <option value="playlist_random">Playlist Random</option>
            <option value="random_pool">Random Pool</option>
          </FieldInput>

          {selectedType === "random_pool" ? (
            <fieldset>
              <legend>Pool</legend>
              {Object.entries(content)
                .filter(([id]) => id !== editingContentId)
                .map(([id, data]) => (
                  <FieldInput
                    key={id}
                    type="checkbox"
                    label={data.name}
                    name={`pool-${id}`}
                    value={formState.pool.includes(id)}
                    onChange={(field, checked) => {
                      const poolId = field.replace("pool-", "");

                      setFormState((prev) => ({
                        ...prev,
                        pool: checked
                          ? [...prev.pool, poolId]
                          : prev.pool.filter((p) => p !== poolId),
                      }));
                    }}
                  />
                ))}
            </fieldset>
          ) : selectedType ? (
            <FieldInput
              type="text"
              name="id"
              label="Content ID"
              required
              value={formState.id}
              onChange={handleFieldChange}
            />
          ) : null}

          <div className="form-actions">
            <input type="submit" value="Cancel" formNoValidate />
            <input type="submit" value="Save" />
          </div>
        </form>
      </dialog>

      <button onClick={() => openEditModal()}>New content</button>

      <SaveButton data={content} configName="content" />
    </main>
  );
}
