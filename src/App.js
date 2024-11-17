import React from "react";
import axios from "axios";

const App = () => {
  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    if (!file) {
      alert("Please select a file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = async (e) => {
      const fileContent = e.target.result;
      const moleculeData = parseMol2(fileContent);

      try {
        const response = await axios.post(
          "https://molcompute-bcbmhphmb7h5e0cy.northeurope-01.azurewebsites.net/optimize",
          { file1: moleculeData }
        );
        alert("API Response Received: " + JSON.stringify(response.data));
      } catch (error) {
        console.error("Error sending data to API:", error);
        alert("Error sending file to API. Check the console for details.");
      }
    };

    reader.readAsText(file);
  };

  const parseMol2 = (mol2Data) => {
    const lines = mol2Data.split("\n");
    const molecule = { molecule_name: "Molecule", atoms: [], bonds: [] };

    let section = null;
    lines.forEach((line) => {
      if (line.startsWith("@<TRIPOS>ATOM")) {
        section = "atoms";
        return;
      } else if (line.startsWith("@<TRIPOS>BOND")) {
        section = "bonds";
        return;
      }

      if (section === "atoms" && line.trim()) {
        const [id, element, x, y, z] = line.trim().split(/\s+/);
        molecule.atoms.push({
          id: parseInt(id, 10),
          element,
          x: parseFloat(x),
          y: parseFloat(y),
          z: parseFloat(z),
        });
      } else if (section === "bonds" && line.trim()) {
        const [id, atom1, atom2, type] = line.trim().split(/\s+/);
        molecule.bonds.push({
          id: parseInt(id, 10),
          atom1: parseInt(atom1, 10),
          atom2: parseInt(atom2, 10),
          type: parseInt(type, 10),
        });
      }
    });

    return molecule;
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Molecule Optimizer</h1>
      <input
        type="file"
        accept=".mol2"
        onChange={handleFileUpload}
        style={{
          padding: "10px",
          border: "2px dashed gray",
          cursor: "pointer",
        }}
      />
    </div>
  );
};

export default App;
