import "../ui/styles.css";

export function App() {
  return (
    <main className="app-shell">
      <header>
        <h1>Control de glucemia</h1>
        <p>Importar · Revisar · Informar</p>
      </header>

      <section className="card">
        <h2>MVP en construcción</h2>
        <p>
          Próximo hito: importar CSV de mySugr con deduplicación y revisión de conflictos.
        </p>
      </section>
    </main>
  );
}
