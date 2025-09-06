import { useState } from "react";
import UploadForm from "../components/UploadForm";

export default function Home() {
  const [uploads, setUploads] = useState([]);

  const handleUpload = (data) => {
    setUploads((prev) => [data, ...prev]);
  };

  return (
    <div className="container">
      <h1>Invoice & Receipt OCR Demo</h1>
      <UploadForm onUpload={handleUpload} />
      <hr />
      <h2>Uploads</h2>
      {uploads.length === 0 && <p>Geen uploads</p>}
      <ul>
        {uploads.map((u, idx) => (
          <li key={idx}>
            <strong>{u.fileName}</strong> ({u.entity})
            <pre>{u.text}</pre>
          </li>
        ))}
      </ul>
    </div>
  );
}