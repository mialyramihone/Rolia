import React, { useState } from "react";
import "./App.css";
import logo from './img/rolialogo.png'; 

function App() {
  const [showHome, setShowHome] = useState(true);
  const [items, setItems] = useState([]);
  const [newName, setNewName] = useState("");
  const [inputType, setInputType] = useState("single");
  const [mode, setMode] = useState("single");
  const [param, setParam] = useState(2);
  const [results, setResults] = useState([]);
  const [downloadFormat, setDownloadFormat] = useState("txt");
  const [fileName, setFileName] = useState("rolia_results");
  const [categoryNames, setCategoryNames] = useState({});
  const [isDrawing, setIsDrawing] = useState(false);
  const [bulkInput, setBulkInput] = useState("");

  
  const goToDrawInterface = () => setShowHome(false);
  const goToHome = () => {
    setShowHome(true);
    resetList();
  };

  
  const addItem = () => {
    if (newName.trim() !== "") {
      setItems([...items, newName.trim()]);
      setNewName("");
    }
  };

  const addBulkItems = () => {
    if (bulkInput.trim() === "") return;
    const newItems = bulkInput
      .split(/[\n,]/)
      .map(item => item.trim())
      .filter(item => item !== "");
    if (newItems.length > 0) {
      setItems([...items, ...newItems]);
      setBulkInput("");
    }
  };

  const resetList = () => {
    setItems([]);
    setResults([]);
    setBulkInput("");
  };

  const removeItem = index => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const updateCategoryName = (index, value) => {
    setCategoryNames(prev => ({ ...prev, [index]: value }));
  };

  
  const runDraw = () => {
    if (items.length === 0) {
      setResults([{ text: "Aucun élément", id: Date.now() }]);
      return;
    }

    setResults([]);
    setIsDrawing(true);

    
    if (mode === "single") {
      const winner = items[Math.floor(Math.random() * items.length)];
      setTimeout(() => {
        setResults([{ 
          text: `Gagnant : ${winner}`, 
          winner: true, 
          id: Date.now() 
        }]);
        setIsDrawing(false);
      }, 500);
      return;
    }

    
    if (mode === "duel") {
      let duelNumber = 1;
      const output = [];
      const pool = [...items];
      

      while (pool.length > 1) {
        const a = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
        const b = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
        output.push({
          id: Date.now() + duelNumber,
          duel: duelNumber,
          player1: a,
          player2: b,
          showVS: false,
          showPlayer2: false,
          isDuel: true
        });
        duelNumber++;
      }

      if (pool.length === 1) {
        output.push({
          id: Date.now() + duelNumber,
          duel: duelNumber,
          player1: pool[0],
          player2: "(bye)",
          showVS: false,
          showPlayer2: false,
          isDuel: true
        });
      }

      let duelIndex = 0;
      const showNextDuel = () => {
        if (duelIndex >= output.length) {
          setIsDrawing(false);
          return;
        }

        const currentDuel = output[duelIndex];
        setResults(prev => [...prev, { ...currentDuel }]);

        setTimeout(() => {
          setResults(prev =>
            prev.map(item =>
              item.id === currentDuel.id ? { ...item, showVS: true } : item
            )
          );
          setTimeout(() => {
            setResults(prev =>
              prev.map(item =>
                item.id === currentDuel.id ? { ...item, showPlayer2: true } : item
              )
            );
            duelIndex++;
            setTimeout(showNextDuel, 300);
          }, 300);
        }, 500);
      };
      showNextDuel();
      return;
    }
    
    if (mode === "categories") {
      const n = parseInt(param, 10);
      if (isNaN(n) || n <= 0) return;

      
      const shuffledItems = [...items].sort(() => Math.random() - 0.5);

      
      const categories = Array.from({ length: n }, (_, i) => ({
        name: categoryNames[i] || `Catégorie ${i + 1}`,
        members: [],
        id: `cat-${i}-${Date.now()}`,
        isCategory: true
      }));
      
      shuffledItems.forEach((item, index) => {
        const categoryIndex = index % n;
        categories[categoryIndex].members.push(item);
      });
      
      let catIndex = 0;
      
      const showNextCategory = () => {
        if (catIndex >= categories.length) {
          setIsDrawing(false);
          return;
        }

        const currentCat = categories[catIndex];
        setResults(prev => [...prev, {
          id: currentCat.id,
          name: currentCat.name,
          members: [...currentCat.members],
          isCategory: true
        }]);

        catIndex++;
        setTimeout(showNextCategory, 500);
      };

      showNextCategory();
      return;
    }
  };

  // Téléchargement
  const downloadResults = async () => {
    if (results.length === 0) return;
  
    if (downloadFormat === "txt") {
      const content = results
        .map(r => {
          if (r.text) return r.text;
          if (r.isDuel) return `Duel ${r.duel}\n${r.player1} VS ${r.player2}`;
          if (r.isCategory) {
            const membersList = r.members
              .map((member, index) => `${index + 1}. ${member}`)
              .join('\n');
            return `${r.name}\n${membersList}`;
          }
          return "";
        })
        .join("\n\n");
      
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (downloadFormat === "png" || downloadFormat === "jpeg") {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      
      canvas.width = 800;
      const lineHeight = 60;
      const padding = 40;
      const titleHeight = 80;
      const logoHeight = 50; 
      
      
      let totalHeight = padding * 2 + titleHeight + logoHeight + 20;
      results.forEach(r => {
        if (r.text) totalHeight += lineHeight;
        if (r.isDuel) totalHeight += lineHeight * 2;
        if (r.isCategory) totalHeight += lineHeight + (r.members.length * 35);
      });
      
      
      totalHeight += 50;
      canvas.height = totalHeight;
      
      
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(1, '#2d2d44');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      
      const logoImg = new Image();
      logoImg.src = logo;
      
      
      await new Promise((resolve) => {
        logoImg.onload = resolve;
      });
      
      
      const logoWidth = (logoHeight * logoImg.width) / logoImg.height;
      ctx.beginPath();
      ctx.roundRect(
        canvas.width / 2 - logoWidth / 2 - 10, 
        padding - 10, 
        logoWidth + 20, 
        logoHeight + 20, 
        10
      );
      
      ctx.fill();
      
      
      ctx.drawImage(
        logoImg, 
        canvas.width / 2 - logoWidth / 2,
        padding,
        logoWidth, 
        logoHeight
      );
      
      
      ctx.fillStyle = '#ecf0f1';
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(' RESULTAT DU TIRAGE', canvas.width / 2, padding + logoHeight + 50);
      
      let y = titleHeight + padding + logoHeight + 50;
      
      results.forEach(r => {
        if (r.text) {
          ctx.fillStyle = '#5ca8a8';
          ctx.font = 'bold 28px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(r.text, canvas.width / 2, y);
          y += lineHeight;
        }
        
        if (r.isDuel) {
          
          ctx.fillStyle = '#d04e74';
          ctx.font = 'bold 24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`Duel ${r.duel}`, canvas.width / 2, y);
          y += 40;
          
          
          ctx.fillStyle = '#ecf0f1';
          ctx.font = '20px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`${r.player1} VS ${r.player2}`, canvas.width / 2, y);
          y += lineHeight;
        }
        
        if (r.isCategory) {
          ctx.fillStyle = '#5ca8a8';
          ctx.font = 'bold 24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(r.name, canvas.width / 2, y);
          y += 40;
          
          ctx.fillStyle = '#ecf0f1';
          ctx.font = '18px Arial';
          ctx.textAlign = 'left';
          r.members.forEach((member, index) => {
            ctx.fillText(`${index + 1}. ${member}`, padding, y);
            y += 35;
          });
          y += 10;
        }
      });
      
      const footerLogoHeight = 30;
      const footerLogoWidth = (footerLogoHeight * logoImg.width) / logoImg.height;
      ctx.drawImage(
        logoImg,
        canvas.width - footerLogoWidth - 20,
        canvas.height - footerLogoHeight - 20,
        footerLogoWidth,
        footerLogoHeight
      );
      
      ctx.fillStyle = 'rgba(182, 182, 182, 0.48)';
      ctx.font = '14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`© ${new Date().getFullYear()} DALIA`, 20, canvas.height - 30);
      
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${fileName}.${downloadFormat}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, downloadFormat === "png" ? "image/png" : "image/jpeg", 0.9);
    }
  };

  // Page d'accueil
  if (showHome) {
    return (
      <div className="app-container">
        <header className="app-header">
          <div className="header-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={logo} alt="ROLIA Logo" style={{ height: '40px' }} />
              <h1>ROLIA</h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop:'30px' , marginRight:'20px' }} className="header-badge">✨ Totalement gratuit</div>

          </div>
        </header>

        <main className="home-container">
          <section className="hero-section">
            <div className="hero-content">
              <h2>Bienvenue sur ROLIA</h2>
              <p className="hero-subtitle">
                L'outil ultime pour tous vos tirages aléatoires et vos sélections équitables
              </p>
            </div>
          </section>

          <section className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Tirage Simple</h3>
              <p>Sélectionne un gagnant aléatoire parmi votre liste en un clic</p>
              <div className="feature-highlight">Idéal pour les concours</div>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">⚔️</div>
              <h3>Mode Duel</h3>
              <p>Crée des confrontations aléatoires entre tous les participants</p>
              <div className="feature-highlight">Parfait pour les tournois</div>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Catégories</h3>
              <p>Répartit automatiquement vos éléments dans plusieurs groupes équilibrés</p>
              <div className="feature-highlight">Organisation automatique</div>
            </div>
          </section>

          <section className="steps-section">
            <h3>Comment ça marche ?</h3>
            <div className="steps-grid">
              <div className="step-item">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Ajoutez vos éléments</h4>
                  <p>Saisissez vos noms un par un ou importez une liste complète</p>
                </div>
              </div>
              
              <div className="step-item">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Choisissez le mode</h4>
                  <p>Sélectionnez entre tirage simple, duel ou catégories</p>
                </div>
              </div>
              
              <div className="step-item">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Lancez et découvrez</h4>
                  <p>Appuyez sur le bouton et laissez le hasard décider !</p>
                </div>
              </div>
            </div>
          </section>

          <section className="cta-section">
            <div className="cta-content">
              <h3>Prêt à commencer ?</h3>
              <p>Créez votre premier tirage en quelques secondes</p>
              <button className="start-button" onClick={goToDrawInterface}>
                <span className="button-icon">🚀</span>
                Commencer un tirage
              </button>
            </div>
          </section>

          <section className="benefits-section">
            <div className="benefits-grid">
              <div className="benefit-item">
                <span className="benefit-icon">⚡</span>
                <span>Rapide et intuitif</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">🔒</span>
                <span>100% sécurisé</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">📱</span>
                <span>Responsive design</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">💾</span>
                <span>Export des résultats</span>
              </div>
            </div>
          </section>
        </main>

        <footer className="app-footer">
          <div className="footer-content">
            <p>© {new Date().getFullYear()} DALIA</p>
           
          </div>
        </footer>
      </div>
    );
  }

  // Interface de tirage
  return (
    <div className="app-container">
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={logo} alt="ROLIA Logo" style={{ height: '40px' }} />
          <div>
            <h1>ROLIA</h1>
          </div>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop:'15px' , marginRight:'20px' }} className="home-button" onClick={goToHome}>
          Retour à l'accueil
        </button>
      </header>

      <main className="app-main">
        
        <section className="control-panel">
          <div className="mode-selector">
            {[
              { key: "single", label: "Simple" },
              { key: "duel", label: "Duel" },
              { key: "categories", label: "Catégories" }
            ].map(m => (
              <label key={m.key} className={`mode-button ${mode === m.key ? "active" : ""}`}>
                <input
                  type="radio"
                  name="mode"
                  value={m.key}
                  checked={mode === m.key}
                  onChange={() => setMode(m.key)}
                  className="hidden-radio"
                />
                {m.label}
              </label>
            ))}
          </div>

          {mode === "categories" && (
            <div className="category-config">
              <div>
                <input
                  type="number"
                  value={param}
                  onChange={e => setParam(e.target.value)}
                  min="1"
                  max="10"
                />
                <label>Nombre de catégories</label>
              </div>

              {Array.from({ length: parseInt(param) || 0 }, (_, i) => (
                <input
                  key={i}
                  type="text"
                  value={categoryNames[i] || ""}
                  onChange={e => updateCategoryName(i, e.target.value)}
                  placeholder={`Catégorie ${i + 1}`}
                />
              ))}
            </div>
          )}
        </section>

        {/* Entry panel */}
        <section className="entry-panel">
          <div className="input-type-toggle">
            <button
              className={`toggle-btn ${inputType === "single" ? "active" : ""}`}
              onClick={() => setInputType("single")}
            >
              Nom unique
            </button>
            <button
              className={`toggle-btn ${inputType === "bulk" ? "active" : ""}`}
              onClick={() => setInputType("bulk")}
            >
              Liste
            </button>
          </div>

          {inputType === "single" ? (
            <div className="input-group">
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyPress={e => e.key === "Enter" && addItem()}
                placeholder="Entrez un nom"
              />
              <button className="btn primary" onClick={addItem}>
                Ajouter
              </button>
            </div>
          ) : (
            <div className="input-group">
              <textarea
                value={bulkInput}
                onChange={e => setBulkInput(e.target.value)}
                rows="4"
                placeholder="Séparez par virgules ou retour à la ligne"
              />
              <button className="btn primary" onClick={addBulkItems}>
                Ajouter la liste
              </button>
            </div>
          )}

          {items.length > 0 && (
            <div className="items-management">
              <h4>
                Liste des éléments ({items.length} élément{items.length > 1 ? 's' : ''})
              </h4>
              <div className="items-list">
                {items.map((item, idx) => (
                  <div key={idx} className="item-tag">
                    <span className="item-name">{item}</span>
                    <button 
                      className="remove-item-btn"
                      onClick={() => removeItem(idx)}
                      aria-label={`Supprimer ${item}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button className="reset-btn" onClick={resetList}>
                Réinitialiser tout
              </button>
            </div>
          )}
        </section>

        {/* Action button */}
        <div className="action-center">
          <button 
            onClick={runDraw} 
            disabled={isDrawing || items.length === 0}
          >
            {isDrawing ? "Tirage en cours..." : "LANCER LE TIRAGE"}
          </button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <section className="results-section">
            <h3>Résultats</h3>
            <div className="results-container">
              {results.map(res => {
                
                if (res.text) {
                  return (
                    <div key={res.id} className={res.winner ? "winner" : ""}>
                      {res.text}
                    </div>
                  );
                }

                
                if (res.isDuel) {
                  return (
                    <div key={res.id} className="duel-result">
                      <div className="duel-title">
                        Duel {res.duel}
                      </div>
                      <div className="duel-match">
                        <div className="player">{res.player1}</div>
                        <div className="vs">VS</div>
                        <div className="player">{res.player2}</div>
                      </div>
                    </div>
                  );
                }

                
                if (res.isCategory) {
                  return (
                    <div key={res.id} className="category-result">
                      <div className="category-title">
                        {res.name}
                      </div>
                      <div className="category-members">
                        {res.members.map((member, index) => (
                          <div key={index} className="member-item">
                            {index + 1}. {member}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                return null;
              })}
            </div>

            <div className="download-controls">
              <input 
                type="text" 
                value={fileName} 
                onChange={e => setFileName(e.target.value)} 
                placeholder="Nom du fichier"
              />
              <select 
                value={downloadFormat} 
                onChange={e => setDownloadFormat(e.target.value)}
              >
                <option value="txt">TXT</option>
                <option value="png">PNG</option>
                <option value="jpeg">JPEG</option>
              </select>
              <button className="download-btn" onClick={downloadResults}>
                Télécharger
              </button>
            </div>
          </section>
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <p>© {new Date().getFullYear()} DALIA </p>
        </div>
      </footer>
    </div>
  );
}

export default App;