import { Routes, Route, Link } from "react-router-dom";
import ClientesPage from "./pages/ClientesPage";
import ProdutosPage from "./pages/ProdutosPage";
import TarefasPage from "./pages/TarefasPage";

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

        <div className="home-actions">
          <Link to="/clientes" className="home-button">
            Acessar clientes
          </Link>
          <Link to="/produtos" className="home-button secondary-home-button">
            Acessar produtos
          </Link>
          <Link to="/tarefas" className="home-button secondary-home-button">
            Acessar tarefas
          </Link>
        </div>
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
            <Link to="/produtos">Produtos</Link>
            <Link to="/tarefas">Tarefas</Link>
          </nav>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/clientes" element={<ClientesPage />} />
        <Route path="/produtos" element={<ProdutosPage />} />
        <Route path="/tarefas" element={<TarefasPage />} />
      </Routes>
    </div>
  );
}