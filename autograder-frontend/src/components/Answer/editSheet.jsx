import React, { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { PDFDocument } from "pdf-lib"; // PDF-lib pour manipuler les PDF
import Swal from "sweetalert2";
import { FaTimes, FaChevronLeft, FaChevronRight, FaEraser, FaPencilAlt, FaSave } from "react-icons/fa";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

const EditablePdfViewer = ({ fileUrl, onClose, onSave }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.5);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [workerError, setWorkerError] = useState(null);
  const [note, setNote] = useState("");
  const [explanation, setExplanation] = useState("");

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  // Fonction pour dessiner sur le canevas
  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;

    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.strokeStyle = isErasing ? "#ffffff" : "#000000"; // Couleur blanche si gomme, noir sinon
    contextRef.current.lineWidth = isErasing ? 15 : 2;
    contextRef.current.stroke();
  };

  const endDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  // Fonction pour redimensionner et redraw le canevas lorsque la page PDF est chargée
  const redrawCanvas = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const page = document.querySelector(".react-pdf__Page");

      if (page) {
        canvas.width = page.offsetWidth;
        canvas.height = page.offsetHeight;
        const context = canvas.getContext("2d");
        contextRef.current = context;
      }
    }
  };

  useEffect(() => {
    redrawCanvas();
  }, [pageNumber, scale]);

  const handlePageChange = (pageNum) => {
    setPageNumber(pageNum);
  };

  const toggleEraser = () => {
    setIsErasing(!isErasing);
  };

  // Fonction pour sauvegarder les annotations/dessins dans le fichier PDF
  const handleSave = async () => {
    const { value: Data } = await Swal.fire({
      title: 'Veuillez entrer les informations',
      html: `
        <div>
          <label for="note" class="block text-gray-700 text-sm font-bold mb-2">Note finale:</label>
          <input id="note" class="swal2-input" type="number" />
        </div>
        <div>
          <label for="explanation" class="block text-gray-700 text-sm font-bold mb-2">Explication du changement:</label>
          <textarea id="explanation" class="swal2-input" placeholder="Entrez l'explication ici" rows="4"></textarea>
        </div>
      `,
      showCancelButton: true,
      buttonsStyling: false,
      customClass: {
        confirmButton: 'bg-[#1f81a9] text-white px-4 py-2 rounded-full hover:bg-[#145c73] focus:outline-none focus:ring-2 focus:ring-[#145c73]',
        cancelButton: 'bg-gray-600 text-white px-4 py-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300',
      },
      preConfirm: () => {
        const userNote = Swal.getPopup().querySelector('#note').value;
        const explanation = Swal.getPopup().querySelector('#explanation').value;
        if (!userNote) {
          Swal.showValidationMessage('Vous devez entrer une note !');
          return false;
        }
        if (!explanation) {
          Swal.showValidationMessage('Vous devez entrer une explication !');
          return false;
        }
        return { userNote, explanation };
      }
    });

    if (!Data) return;

    const { userNote, explanation } = Data;

    setNote(userNote); // Sauvegarder la note
    setExplanation(explanation); // Sauvegarder l'explication

    try {
      const pdfBytes = await fetch(fileUrl).then((res) => res.arrayBuffer());
      const pdfDoc = await PDFDocument.load(pdfBytes);

      const page = pdfDoc.getPage(pageNumber - 1); // Obtenir la page actuelle du PDF

      const canvas = canvasRef.current;

      // Convertir le canevas en image PNG
      const pngImageBytes = canvas.toDataURL("image/png");
      const pngImage = await pdfDoc.embedPng(pngImageBytes);

      // Ajouter l'image PNG sur la page du PDF (aux coordonnées souhaitées)
      page.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: page.getWidth(),
        height: page.getHeight(),
      });

      const pdfBytesModified = await pdfDoc.save();

      if (onSave) {
        onSave(pdfBytesModified, userNote, fileUrl, explanation);
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du PDF:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="relative bg-white rounded-lg w-11/12 h-5/6 max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="bg-gray-100 p-4 flex justify-between items-center border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Edit PDF</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 transition-colors"
            aria-label="Close"
          >
            <FaTimes size={24} />
          </button>
        </div>

        <div className="flex-grow relative overflow-auto p-4 ">
          {workerError ? (
            <div className="text-red-500">{workerError}</div>
          ) : (
            <Document
              file={fileUrl || null}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={(error) => {
                console.error("Failed to load PDF:", error);
                setWorkerError("Failed to load PDF document.");
              }}
            >
              <Page
                pageNumber={pageNumber}
                onRenderError={(error) => console.error("Error rendering page:", error)}
                scale={scale}
                renderAnnotationLayer={false}
                renderTextLayer={false}
                onRenderSuccess={redrawCanvas}
                className="shadow-lg"
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 "
                style={{ zIndex: 10, pointerEvents: "all" }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={endDrawing}
                onMouseOut={endDrawing}
              />
            </Document>
          )}
        </div>

        <div className="bg-gray-100 p-4 flex justify-between items-center border-t border-gray-200">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handlePageChange(Math.max(1, pageNumber - 1))}
              disabled={pageNumber <= 1}
              className="bg-[#1f81a9] text-white px-3 py-2 rounded-full flex items-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#145c73] transition-colors"
            >
              <FaChevronLeft className="mr-1" />
            </button>
            <button
              onClick={() =>
                handlePageChange(Math.min(numPages, pageNumber + 1))
              }
              disabled={pageNumber >= numPages}
              className="bg-[#1f81a9] text-white px-3 py-2 rounded-full flex items-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#145c73] transition-colors"
            >
              <FaChevronRight className="ml-1" />
            </button>
            <span className="text-gray-700">
              Page {pageNumber} sur {numPages}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleEraser}
              className={`p-2 rounded-full ${
                isErasing
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-700"
              } hover:bg-opacity-80 transition-colors`}
              aria-label={isErasing ? "Passer au crayon" : "Passer à la gomme"}
            >
              {isErasing ? <FaPencilAlt size={20} /> : <FaEraser size={20} />}
            </button>
            <button
              onClick={handleSave}
              className="bg-[#1f81a9] text-white px-4 py-2 rounded-full flex items-center hover:bg-[#145c73] transition-colors"
            >
              <FaSave className="mr-2" /> Sauvegarder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditablePdfViewer;
