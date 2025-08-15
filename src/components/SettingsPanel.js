import React from "react";

export default function SettingsPanel({ mode, setMode, param, setParam }) {
  return (
    <div className="settings-panel">
      <label>Mode de tirage :</label>
      <select value={mode} onChange={(e) => setMode(e.target.value)}>
        <option value="single">Tirer 1 gagnant</option>
        <option value="duel">Tirer 2 (1 vs 1)</option>
        <option value="categories">Catégoriser en N classes</option>
      </select>

      {mode === "categories" && (
        <div>
          <label>Nombre de catégories :</label>
          <input
            type="number"
            value={param}
            min="2"
            onChange={(e) => setParam(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
