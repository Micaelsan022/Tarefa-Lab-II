import { Routes, Route, Link } from "react-router-dom";
import ClientesPage from "./pages/ClientesPage";

function HomePage() {
  return (
    <main className="home-page">
      <section className="home-card">
        <span className="home-badge">TAREFA LAB II</span>

        <h1>Gerenciador de Clientes</h1>

        <p>
          Sistema desenvolvido em React para cadastro,
          consulta, edição e exclusão de clientes.
        </p>

        <Link to="/clientes" className="home-button">
          Acessar clientes
        </Link>
      </section>
    </main>
  );
}

export default function App() {
  return (
    <div className="app">
      <header className="navbar">
        <div className="navbar-content">
          <Link to="/" className="logo">
            <span className="logo-icon">C</span>
            <span>Cliente<span className="logo-highlight">+</span></span>
          </Link>

          <nav>
            <Link to="/">Início</Link>
            <Link to="/clientes">Clientes</Link>
          </nav>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/clientes" element={<ClientesPage />} />
      </Routes>
    </div>
  );
}