import React, { useState } from 'react';
import './Calculator.css';

const Calculator = () => {
  const [activeCalculator, setActiveCalculator] = useState('all');
  
  const [formData, setFormData] = useState({
    hydrogenBase: '',
    hydrogenExponent: '',
    titrationVolume: '',
    normality: '',
    sampleVolume: '',
    alkalinityTitrationVolume: '',
    alkalinityNormality: '',
    alkalinitySampleVolume: ''
  });

  const [results, setResults] = useState({
    pH: null,
    salinity: null,
    alkalinity: null,
    hConcentration: null,
    waterContribution: false
  });

  const [errors, setErrors] = useState({});
  const [showResults, setShowResults] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateInputs = () => {
    const newErrors = {};
    
    // Only validate inputs relevant to the active calculator
    if (activeCalculator === 'all' || activeCalculator === 'ph') {
      const base = parseFloat(formData.hydrogenBase);
      const exponent = parseFloat(formData.hydrogenExponent);
      
      if (!formData.hydrogenBase || base <= 0) {
        newErrors.hydrogenBase = 'Base value must be greater than 0';
      }
      
      if (!formData.hydrogenExponent || isNaN(exponent)) {
        newErrors.hydrogenExponent = 'Exponent value is required';
      }
    }
    
    if (activeCalculator === 'all' || activeCalculator === 'salinity') {
      const titrationVolume = parseFloat(formData.titrationVolume);
      const normality = parseFloat(formData.normality);
      const sampleVolume = parseFloat(formData.sampleVolume);
      
      if (!formData.titrationVolume || titrationVolume <= 0) {
        newErrors.titrationVolume = 'Titration volume must be greater than 0';
      }
      
      if (!formData.normality || normality <= 0) {
        newErrors.normality = 'Normality must be greater than 0';
      }
      
      if (!formData.sampleVolume || sampleVolume <= 0) {
        newErrors.sampleVolume = 'Sample volume must be greater than 0';
      }
    }
    
    if (activeCalculator === 'all' || activeCalculator === 'alkalinity') {
      const alkalinityTitrationVolume = parseFloat(formData.alkalinityTitrationVolume);
      const alkalinityNormality = parseFloat(formData.alkalinityNormality);
      const alkalinitySampleVolume = parseFloat(formData.alkalinitySampleVolume);
      
      if (!formData.alkalinityTitrationVolume || alkalinityTitrationVolume <= 0) {
        newErrors.alkalinityTitrationVolume = 'Titration volume must be greater than 0';
      }
      
      if (!formData.alkalinityNormality || alkalinityNormality <= 0) {
        newErrors.alkalinityNormality = 'Normality must be greater than 0';
      }
      
      if (!formData.alkalinitySampleVolume || alkalinitySampleVolume <= 0) {
        newErrors.alkalinitySampleVolume = 'Sample volume must be greater than 0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getpHStatus = (pH) => {
    if (pH === null) return { status: null, color: null };
    if (pH < 7) return { status: 'Acidic', color: '#e74c3c' };
    if (pH === 7) return { status: 'Neutral', color: '#f39c12' };
    return { status: 'Basic', color: '#3498db' };
  };

  const handleCalculate = () => {
    console.log('Calculate button clicked!');
    console.log('Active calculator:', activeCalculator);
    console.log('Form data:', formData);
    
    // Validate inputs first
    if (!validateInputs()) {
      console.log('Validation failed');
      setShowResults(false);
      return;
    }
    
    console.log('Validation passed');

    // Parse input values to numbers
    const base = parseFloat(formData.hydrogenBase);
    const exponent = parseFloat(formData.hydrogenExponent);
    const titrationVolume = parseFloat(formData.titrationVolume);
    const normality = parseFloat(formData.normality);
    const sampleVolume = parseFloat(formData.sampleVolume);
    const alkalinityTitrationVolume = parseFloat(formData.alkalinityTitrationVolume);
    const alkalinityNormality = parseFloat(formData.alkalinityNormality);
    const alkalinitySampleVolume = parseFloat(formData.alkalinitySampleVolume);

    // Calculate H+ concentration: base × 10 ^ exponent
    const hPlus = base * Math.pow(10, exponent);
    
    // Add water contribution if H < 1e-7
    let totalH = hPlus;
    let waterContribution = false;
    
    if (hPlus < 1e-7) {
      totalH = hPlus + 1e-7;
      waterContribution = true;
    }

    // Calculate pH: pH = -log10(total H+ concentration)
    let pH = null;
    if (totalH > 0) {
      pH = -Math.log10(totalH);
    }

    // Calculate Chloride Concentration: (V × N × 35.45 × 1000) / sample volume
    let chlorideConcentration = null;
    if (titrationVolume > 0 && normality > 0 && sampleVolume > 0) {
      chlorideConcentration = (titrationVolume * normality * 35.45 * 1000) / sampleVolume;
    }

    // Calculate Salinity: 1.8 × [Cl-]
    let salinity = null;
    if (chlorideConcentration !== null) {
      salinity = 1.8 * chlorideConcentration;
    }

    // Calculate Alkalinity: (V × N × 50,000) / sample volume (as CaCO3)
    let alkalinity = null;
    if (alkalinityTitrationVolume > 0 && alkalinityNormality > 0 && alkalinitySampleVolume > 0) {
      alkalinity = (alkalinityTitrationVolume * alkalinityNormality * 50000) / alkalinitySampleVolume;
    }

    const pHStatus = getpHStatus(pH);

    const results = {
      pH: pH !== null ? pH.toFixed(2) : null,
      chlorideConcentration: chlorideConcentration !== null ? chlorideConcentration.toFixed(2) : null,
      salinity: salinity !== null ? salinity.toFixed(2) : null,
      alkalinity: alkalinity !== null ? alkalinity.toFixed(2) : null,
      hConcentration: hPlus.toExponential(2),
      waterContribution: waterContribution,
      pHStatus: pHStatus.status,
      pHStatusColor: pHStatus.color
    };
    
    console.log('Calculated results:', results);
    
    setResults(results);
    setShowResults(true);
    console.log('Results displayed');
  };

  return (
    <div className="water-quality-calculator">
      <h2 className="calculator-title">Water Quality Parameters</h2>
      
      {/* Calculator Selector Buttons */}
      <div className="calculator-selector">
        <button 
          className={`selector-btn ${activeCalculator === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCalculator('all')}
        >
          All Calculators
        </button>
        <button 
          className={`selector-btn ${activeCalculator === 'ph' ? 'active' : ''}`}
          onClick={() => setActiveCalculator('ph')}
        >
          pH Calculator
        </button>
        <button 
          className={`selector-btn ${activeCalculator === 'salinity' ? 'active' : ''}`}
          onClick={() => setActiveCalculator('salinity')}
        >
          Salinity Calculator
        </button>
        <button 
          className={`selector-btn ${activeCalculator === 'alkalinity' ? 'active' : ''}`}
          onClick={() => setActiveCalculator('alkalinity')}
        >
          Alkalinity Calculator
        </button>
      </div>
      
      {/* pH Calculation Section */}
      {(activeCalculator === 'all' || activeCalculator === 'ph') && (
        <div className="input-section">
          <h3 className="section-heading">pH Calculation</h3>
          <div className="input-grid single-column">
            <div className="input-group">
              <label>Hydrogen Ion (H+) Concentration</label>
              <div className="scientific-notation-input">
                <input
                  type="number"
                  value={formData.hydrogenBase}
                  onChange={(e) => handleInputChange('hydrogenBase', e.target.value)}
                  placeholder="Base"
                  step="0.1"
                  className={errors.hydrogenBase ? 'error' : ''}
                />
                <span className="notation-operator">×</span>
                <span className="notation-base">10</span>
                <input
                  type="number"
                  value={formData.hydrogenExponent}
                  onChange={(e) => handleInputChange('hydrogenExponent', e.target.value)}
                  placeholder="Exp"
                  step="1"
                  className={`notation-exponent ${errors.hydrogenExponent ? 'error' : ''}`}
                />
              </div>
              {formData.hydrogenBase && formData.hydrogenExponent && (
                <div className="scientific-display">
                  <span className="display-value">{formData.hydrogenBase}</span>
                  <span className="display-operator">×</span>
                  <div className="display-base-container">
                    <span className="display-base">10</span>
                    <span className="display-exponent">{formData.hydrogenExponent}</span>
                  </div>
                  <span className="display-equals">=</span>
                  <span className="display-result">
                    {(parseFloat(formData.hydrogenBase) * Math.pow(10, parseFloat(formData.hydrogenExponent))).toExponential(2)}
                  </span>
                </div>
              )}
              {errors.hydrogenBase && (
                <span className="error-message">{errors.hydrogenBase}</span>
              )}
              {errors.hydrogenExponent && (
                <span className="error-message">{errors.hydrogenExponent}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Salinity Calculation Section */}
      {(activeCalculator === 'all' || activeCalculator === 'salinity') && (
        <div className="input-section">
          <h3 className="section-heading">Salinity Calculation</h3>
          <div className="input-grid">
            <div className="input-group">
              <label htmlFor="titrationVolume">Titration Volume (V)</label>
              <input
                type="number"
                id="titrationVolume"
                value={formData.titrationVolume}
                onChange={(e) => handleInputChange('titrationVolume', e.target.value)}
                placeholder="Enter titration volume"
                step="0.1"
                className={errors.titrationVolume ? 'error' : ''}
              />
              {errors.titrationVolume && (
                <span className="error-message">{errors.titrationVolume}</span>
              )}
            </div>
            <div className="input-group">
              <label htmlFor="normality">Normality (N)</label>
              <input
                type="number"
                id="normality"
                value={formData.normality}
                onChange={(e) => handleInputChange('normality', e.target.value)}
                placeholder="Enter normality"
                step="0.01"
                className={errors.normality ? 'error' : ''}
              />
              {errors.normality && (
                <span className="error-message">{errors.normality}</span>
              )}
            </div>
            <div className="input-group">
              <label htmlFor="sampleVolume">Sample Volume</label>
              <input
                type="number"
                id="sampleVolume"
                value={formData.sampleVolume}
                onChange={(e) => handleInputChange('sampleVolume', e.target.value)}
                placeholder="Enter sample volume"
                step="0.1"
                className={errors.sampleVolume ? 'error' : ''}
              />
              {errors.sampleVolume && (
                <span className="error-message">{errors.sampleVolume}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Alkalinity Calculation Section */}
      {(activeCalculator === 'all' || activeCalculator === 'alkalinity') && (
        <div className="input-section">
          <h3 className="section-heading">Alkalinity Calculation</h3>
          <div className="input-grid">
            <div className="input-group">
              <label htmlFor="alkalinityTitrationVolume">Titration Volume (V)</label>
              <input
                type="number"
                id="alkalinityTitrationVolume"
                value={formData.alkalinityTitrationVolume}
                onChange={(e) => handleInputChange('alkalinityTitrationVolume', e.target.value)}
                placeholder="Enter titration volume"
                step="0.1"
                className={errors.alkalinityTitrationVolume ? 'error' : ''}
              />
              {errors.alkalinityTitrationVolume && (
                <span className="error-message">{errors.alkalinityTitrationVolume}</span>
              )}
            </div>
            <div className="input-group">
              <label htmlFor="alkalinityNormality">Normality (N)</label>
              <input
                type="number"
                id="alkalinityNormality"
                value={formData.alkalinityNormality}
                onChange={(e) => handleInputChange('alkalinityNormality', e.target.value)}
                placeholder="Enter normality"
                step="0.01"
                className={errors.alkalinityNormality ? 'error' : ''}
              />
              {errors.alkalinityNormality && (
                <span className="error-message">{errors.alkalinityNormality}</span>
              )}
            </div>
            <div className="input-group">
              <label htmlFor="alkalinitySampleVolume">Sample Volume</label>
              <input
                type="number"
                id="alkalinitySampleVolume"
                value={formData.alkalinitySampleVolume}
                onChange={(e) => handleInputChange('alkalinitySampleVolume', e.target.value)}
                placeholder="Enter sample volume"
                step="0.1"
                className={errors.alkalinitySampleVolume ? 'error' : ''}
              />
              {errors.alkalinitySampleVolume && (
                <span className="error-message">{errors.alkalinitySampleVolume}</span>
              )}
            </div>
          </div>
        </div>
      )}

      <button className="calculate-btn" onClick={handleCalculate}>
        Calculate
      </button>

      {showResults && (
        <div className="results-highlight">
          <h3 className="results-title">Water Quality Analysis Results</h3>
          
          {/* pH Result with Enhanced Color Coding */}
          {results.pH && (
            <div className={`result-card ph-result ${results.pHStatus?.toLowerCase()}`}>
              <div className="result-header">
                <span className="result-icon">pH</span>
                <h4>pH Level Analysis</h4>
              </div>
              <div className="result-content">
                <div className="h-concentration-display">
                  <span className="h-label">H+ Concentration:</span>
                  <span className="h-value">
                    {results.hConcentration || 'N/A'}
                  </span>
                </div>
                <div className="result-value-large">
                  {results.pH}
                </div>
                <div className="ph-status-large" style={{ 
                  backgroundColor: results.pHStatusColor,
                  color: '#ffffff'
                }}>
                  {results.pHStatus}
                </div>
                {results.waterContribution && (
                  <div className="water-contribution-note">
                    <span className="note-icon">Info</span>
                    <span className="note-text">
                      Water contribution (1×10^-7) added to H+ concentration
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Other Results */}
          <div className="secondary-results">
            {results.chlorideConcentration && (
              <div className="result-card">
                <div className="result-header">
                  <span className="result-icon">Cl</span>
                  <h4>Chloride Concentration</h4>
                </div>
                <div className="result-content">
                  <span className="result-value">{results.chlorideConcentration} mg/L</span>
                  <span className="result-unit">milligrams per liter</span>
                </div>
              </div>
            )}

            {results.salinity && (
              <div className="result-card">
                <div className="result-header">
                  <span className="result-icon">Salinity</span>
                  <h4>Salinity</h4>
                </div>
                <div className="result-content">
                  <span className="result-value">{results.salinity} ppt</span>
                  <span className="result-unit">parts per thousand</span>
                </div>
              </div>
            )}

            {results.alkalinity && (
              <div className="result-card">
                <div className="result-header">
                  <span className="result-icon">Alk</span>
                  <h4>Alkalinity</h4>
                </div>
                <div className="result-content">
                  <span className="result-value">{results.alkalinity} mg/L</span>
                  <span className="result-unit">as CaCO3</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calculator;
