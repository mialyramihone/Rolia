import React from "react";

export default function ResultsDisplay({ results }) {
  return (
    <div className="results">
      {results.map((res, index) => (
        <p
          key={index}
          className={res.winner ? "winner" : ""}
        >
          {res.text}
        </p>
      ))}
    </div>
  );
}
