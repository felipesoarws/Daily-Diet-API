import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/index.css";

interface User {
  sessionId: string;
  name: string;
  email: string;
}

function Dashboard() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  console.log(currentUser);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // faz a requisição para a rota /api/dashboard no backend
        const response = await fetch("/api/dashboard");

        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data.user);
        } else {
          const errorData = await response.json();
          setError(errorData.message || "Falha ao carregar dados do usuário.");
          console.error("Erro ao buscar dados do usuário:", errorData);
          navigate("/");
        }
      } catch (error) {
        setError(
          "Não foi possível conectar ao servidor para obter dados do usuário."
        );
        console.error("Erro de rede ao buscar dados do usuário:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  if (loading) {
    return <p>Carregando dados do usuário...</p>;
  }

  if (error) {
    return (
      <div style={{ color: "red", textAlign: "center" }}>
        <p>{error}</p>
        <p>Você será redirecionado para o login.</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div>
        <p>Nenhum usuário logado. Por favor, faça login.</p>
        <button
          onClick={() => {
            navigate("/");
          }}
        >
          Home
        </button>
      </div>
    );
  }

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" }); // Chama a rota de logout
    navigate("/"); // Redireciona para o login após o logout
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Bem-vindo ao seu Dashboard!</h1>
      <p>Olá, {currentUser.name}!</p>
      <p>Seu e-mail: {currentUser.email}</p>

      <button
        onClick={handleLogout}
        className="bg-[red]"
        style={{ marginTop: "20px", padding: "10px 20px", cursor: "pointer" }}
      >
        Sair
      </button>
    </div>
  );
}

export default Dashboard;
