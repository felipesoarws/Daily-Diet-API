import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/index.css";

import wallpaper from "../assets/wallpaper-login.webp";
import logo from "../assets/logo.webp";

function Register() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  // envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        try {
          const responseLogin = await fetch("/api/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          });

          if (responseLogin.ok) {
            navigate("/dashboard");
          } else {
            const errorData = await response.json();
            setErrorMessage(
              errorData.massage || "Login inválido. Verifique suas credenciais."
            );
          }
        } catch (error) {
          setErrorMessage(
            "Não foi possível conectar ao servidor. Verifique sua conexão."
          );
          console.error("Erro ao fazer requisição de login:", error);
        }
      } else {
        const errorData = await response.json(); // Tenta ler a mensagem de erro do backend
        setErrorMessage(
          errorData.message || "Erro no registro. Tente novamente." // Corrigido para errorData.message
        );
        console.error("Erro no registro:", errorData);
      }
    } catch (error) {
      setErrorMessage(
        "Não foi possível conectar ao servidor. Verifique sua conexão."
      );
      console.error("Erro ao fazer requisição de registro:", error);
    }
  };

  return (
    <div className="flex flex-col-reverse items-center justify-between lg:flex-row">
      <div className="shadow-lg bg-[var(--white)] absolute top-[20vh] p-6 rounded-[.4rem] flex flex-col items-center justify-center lg:w-[50vw] lg:gap-[2vw] lg:m-0 lg:shadow-none lg:bg-transparent lg:p-0 lg:translate-y-0 lg:relative lg:top-0">
        <div className="mt-5 flex items-center justify-between gap-4 lg:gap-[2vw] ">
          <Link to={"/"}>
            <img
              src={logo}
              alt="daily diet logo"
              className="object-cover w-[4rem] h-full pointer-events-none select-none lg:w-[15vw] "
            />
          </Link>
          <div>
            <h1 className="font-bold w-[10rem] leading-4 lg:w-[14vw] lg:leading-[2vw] lg:text-[2vw]">
              Crie sua conta!
            </h1>
          </div>
        </div>
        <div className="mt-5 w-full lg:px-[11vw] lg:m-0">
          <form className="flex items-start flex-col " onSubmit={handleSubmit}>
            <div className="flex items-start flex-col gap-4 lg:gap-[1vw] w-full">
              <label htmlFor="name" className="text-[var(--gray-2)] w-full">
                Nome
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="p-2 block rounded-[.4rem] border border-[var(--gray-5)] w-full lg:rounded-[.5vw] lg:p-[.5vw] active:border-[var(--gray-3)]"
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>
              <label htmlFor="email" className="text-[var(--gray-2)] w-full">
                E-mail
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="p-2 block rounded-[.4rem] border border-[var(--gray-5)] w-full lg:rounded-[.5vw] lg:p-[.5vw] active:border-[var(--gray-3)]"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
              <label htmlFor="text" className="text-[var(--gray-2)] w-full">
                Senha
                <input
                  type="password"
                  name="password"
                  id="password"
                  className="p-2 block rounded-[.4rem] border border-[var(--gray-5)] w-full lg:rounded-[.5vw] lg:p-[.5vw] active:border-[var(--gray-3)]"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>
            </div>

            {errorMessage && (
              <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
            )}
            <input
              type="submit"
              value="Entrar"
              className="mt-6 cursor-pointer p-2 block  border-[var(--gray-1)] rounded-[.4rem] bg bg-[var(--gray-1)] text-[var(--white)] w-full transiction-all duration-[.3s] ease-in-outlg:rounded-[.5vw] lg:p-[.5vw] lg:mt-[1.5vw]  hover:bg-[var(--gray-2)] "
            />
          </form>
        </div>
      </div>
      <div className="lg:w-[50vw] lg:h-screen ">
        <img
          src={wallpaper}
          alt="wallpaper"
          className="object-cover h-full pointer-events-none select-none"
        />
      </div>
    </div>
  );
}

export default Register;
