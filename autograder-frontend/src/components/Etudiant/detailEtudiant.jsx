import React from "react";

function DetailEtudiant({ etudiant }) {
  if (!etudiant) {
    return <div>Aucun étudiant sélectionné.</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Détails de l'Étudiant</h2>
      <div className="mb-4">
        <strong>Matricule:</strong>
        <p className="text-gray-700">{etudiant.matricule}</p>
      </div>
      <div className="mb-4">
        <strong>Nom:</strong>
        <p className="text-gray-700">{etudiant.name}</p>
      </div>
      <div className="mb-4">
        <strong>Classe:</strong>
        <p className="text-gray-700">
          {etudiant.class ? etudiant.class.name : "Non spécifiée"}
        </p>
      </div>
      <div className="mb-4">
        <strong>Date d'inscription:</strong>
        <p className="text-gray-700">
          {etudiant.registrationDate
            ? new Date(etudiant.registrationDate).toLocaleDateString()
            : "Non spécifiée"}
        </p>
      </div>
      <div className="flex justify-end">
        <button
          className="text-white bg-[#1f81a9] hover:bg-[#145c73] focus:outline-none focus:ring-4 focus:ring-[#1f81a9] font-medium rounded-full text-sm px-5 py-2.5"
          onClick={() => window.history.back()}
        >
          Retour
        </button>
      </div>
    </div>
  );
}

export default DetailEtudiant;
