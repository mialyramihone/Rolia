import React, { useState } from "react";

export default function InputList({ onChange }) {
  const [text, setText] = useState("");

  const updateList = (value) => {
    setText(value);
    const list = value
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    onChange(list);
  };

  return (
    <div className="input-list">
      <textarea
        placeholder="Entrez la liste..."
        value={text}
        onChange={(e) => updateList(e.target.value)}
      />
    </div>
  );
}
