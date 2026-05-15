import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary atrapó un error:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            maxWidth: 520,
            margin: "60px auto",
            padding: 32,
            background: "#fef2f2",
            border: "1px solid #fca5a5",
            borderRadius: 12,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
          <h2 style={{ margin: "0 0 8px", color: "#991b1b", fontSize: 20 }}>
            Algo salió mal
          </h2>
          <p style={{ margin: "0 0 16px", color: "#7f1d1d", fontSize: 14 }}>
            La aplicación encontró un error inesperado. Tus datos están a salvo — la información está registrada
            de forma permanente.
          </p>
          {this.state.error?.message && (
            <code
              style={{
                display: "block",
                padding: 10,
                background: "#fff",
                borderRadius: 6,
                fontSize: 12,
                color: "#991b1b",
                marginBottom: 16,
                wordBreak: "break-word",
              }}
            >
              {this.state.error.message.slice(0, 200)}
            </code>
          )}
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button
              className="btn"
              style={{ background: "#fff", color: "#991b1b", border: "1px solid #fca5a5" }}
              onClick={this.handleReset}
            >
              Reintentar
            </button>
            <button className="btn btn-primary" onClick={this.handleReload}>
              Recargar página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
