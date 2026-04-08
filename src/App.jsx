import './App.css'
import Calculator from './components/Calculator';

function App() {
  return (
    <>
      <div className="app"></div>
      <div className="content-wrapper">
        <h1 className="title">Water Quality Analyzer</h1>
        <div className="calculator-card">
          <Calculator />
        </div>
      </div>
    </>
  );
}

export default App
