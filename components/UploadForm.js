import { useState } from "react";
import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

export default function UploadForm({ onUpload }) {
  const [file, setFile] = useState(null);
  const [entity, setEntity] = useState("");
  const [ocrText, setOcrText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setOcrText("");
  };

  const handleUpload = async () => {
    if (!file || !entity) {
      alert("Kies een bestand en entiteit");
      return;
    }
    setLoading(true);

    let imageData = null;

    if (file.type === "application/pdf") {
      const pdfData = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      await page.render({ canvasContext: ctx, viewport }).promise;
      imageData = canvas;
    } else if (file.type.startsWith("image/")) {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      await new Promise((resolve) => (img.onload = resolve));
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      imageData = canvas;
    } else {
      alert("Bestandstype niet ondersteund");
      setLoading(false);
      return;
    }

    const { data: { text } } = await Tesseract.recognize(imageData, "eng");
    setOcrText(text);

    onUpload({
      fileName: file.name,
      entity,
      text,
    });

    setLoading(false);
    setFile(null);
    setEntity("");
  };

  return (
    <div className="upload-section">
      <input type="file" onChange={handleFileChange} />
      <select value={entity} onChange={(e) => setEntity(e.target.value)}>
        <option value="">Selecteer entiteit</option>
        <option value="Entiteit A">Entiteit A</option>
        <option value="Entiteit B">Entiteit B</option>
      </select>
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "OCR bezig..." : "Upload & OCR"}
      </button>
      {ocrText && (
        <div style={{ marginTop: "10px" }}>
          <strong>Herkenning resultaat:</strong>
          <pre>{ocrText}</pre>
        </div>
      )}
    </div>
  );
}