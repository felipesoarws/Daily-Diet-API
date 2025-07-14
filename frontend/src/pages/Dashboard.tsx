import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import "../styles/index.css";

import logo from "../assets/logo.webp";

import {
  XIcon,
  ArrowUpRightIcon,
  PlusIcon,
  UserCircleIcon,
} from "@phosphor-icons/react";

interface User {
  sessionId: string;
  name: string;
  email: string;
}

function Dashboard() {
  const [mealName, setMealName] = useState<string>("");
  const [mealDesc, setMealDesc] = useState<string>("");
  const [mealDate, setMealDate] = useState<string>("");
  const [mealHour, setMealHour] = useState<string>("");
  const [mealIsOnDiet, setMealIsOnDiet] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOpenProfileMenu, setIsOpenProfileMenu] = useState<boolean>(false);
  const [isOpenNewMealMenu, setIsOpenNewMealMenu] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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

  // envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const now = new Date();

    const [year, month, day] = mealDate.split("-").map(Number);
    const [hours, minutes] = mealHour.split(":").map(Number);

    const selectedDateTime = new Date(year, month - 1, day, hours, minutes);

    if (selectedDateTime > now) {
      setErrorMessage(
        "Não é possível registrar refeições para datas ou horários futuros."
      );
      return;
    }

    try {
      // arrumar formato da data para DD/MM/YYYY
      const formattedDate = `${String(day).padStart(2, "0")}/${String(
        month
      ).padStart(2, "0")}/${year}`;

      const response = await fetch("/api/dashboard/new-meal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: mealName,
          description: mealDesc,
          meal_date: formattedDate,
          meal_hour: mealHour,
          is_on_diet: mealIsOnDiet,
        }),
      });

      if (response.ok) {
        // subir modal de aviso de registro
        setIsOpenNewMealMenu(false);
        cleanMealFields();
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
      console.error("Erro na requisição:", error);
    }
  };

  const cleanMealFields = () => {
    setMealName("");
    setMealDesc("");
    setMealDate("");
    setMealHour("");
    setMealIsOnDiet(true);
  };

  return (
    <div className="m-2 lg:m-[2vw]">
      <header className="relative flex items-center justify-between">
        <Link to={"/"}>
          <img
            src={logo}
            alt="daily diet logo"
            className="cursor-pointer object-cover h-full lg:w-[6vw] pointer-events-none select-none"
          />
        </Link>

        <div
          className="flex items-center gap-6 lg:gap-[2vw]"
          onClick={() => {
            setErrorMessage("");
            setIsOpenNewMealMenu(true);
          }}
        >
          <div
            className="p-2 cursor-pointer flex items-center justify-center gap-4 rounded-[.4rem] bg-[var(--gray-1)]
          text-[var(--white)]  transiction-all duration-[.3s] ease-in-out
          lg:rounded-[.5vw] lg:p-[.6vw] lg:px-[1.5vw] hover:bg-[var(--gray-2)] "
          >
            <PlusIcon size={20} />
            <button className="cursor-pointer text-[1vw]">Nova refeição</button>
          </div>

          <div
            className="cursor-pointer transition-all durarion-[.3s] ease-in-out hover:scale-105"
            onClick={() => setIsOpenProfileMenu(!isOpenProfileMenu)}
          >
            <UserCircleIcon size={40} />
          </div>
        </div>
        {isOpenProfileMenu && (
          <div className="absolute top-0 right-2  lg:right-[.1vw] lg:mt-[3vw] ">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={handleLogout}
                className="cursor-pointer transiction-all duration-[.3s] ease-in-out  bg-[var(--gray-1)] text-[var(--white)]  lg:p-[.3vw] lg:rounded-[.3vw] lg:px-[1vw] hover:bg-[var(--gray-2)]"
              >
                Sair
              </button>
            </motion.div>
          </div>
        )}
      </header>
      <AnimatePresence mode="wait">
        {isOpenNewMealMenu && (
          <motion.div
            className="bg-[#000000a2] absolute top-0 left-0 right-0 bottom-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.3 }}
            >
              <div className="z-999 absolute bg-[var(--white)] rounded-[.8rem] border border-[var(--gray-4)]  lg:w-[30vw] lg:p-[2vw] lg:translate-x-[35vw] lg:mt-[3vw] lg:rounded-[.8vw]">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium lg:text-[1.4vw]">Nova refeição</h3>

                  <button
                    type="button"
                    className="cursor-pointer"
                    onClick={() => setIsOpenNewMealMenu(false)}
                  >
                    <XIcon size={30} weight="bold" />
                  </button>
                </div>
                <form
                  className="mt-6 flex items-start flex-col lg:mt-[2vw] w-full lg:gap-[1vw]"
                  onSubmit={handleSubmit}
                >
                  <div className="flex items-start flex-col gap-4 lg:gap-[vw] w-full">
                    <label
                      htmlFor="mealName"
                      className="text-[var(--gray-2)] w-full"
                    >
                      Nome
                      <input
                        type="text"
                        name="mealName"
                        id="mealName"
                        className="p-2 block rounded-[.4rem] border border-[var(--gray-5)] lg:rounded-[.5vw] w-full lg:p-[.5vw] active:border-[var(--gray-3)]"
                        onChange={(e) => setMealName(e.target.value)}
                        value={mealName}
                        required
                      />
                    </label>

                    <label
                      htmlFor="mealDesc"
                      className="text-[var(--gray-2)] w-full"
                    >
                      Descrição
                      <textarea
                        name="mealDesc"
                        id="mealDesc"
                        rows={3}
                        className="resize-none p-2 block rounded-[.4rem] border border-[var(--gray-5)] lg:rounded-[.5vw] w-full lg:p-[.5vw] active:border-[var(--gray-3)]"
                        onChange={(e) => setMealDesc(e.target.value)}
                        value={mealDesc}
                        required
                      />
                    </label>

                    <div className="flex items-center justify-between gap-4 lg:gap-[1vw] w-full">
                      <label
                        htmlFor="mealDate"
                        className="text-[var(--gray-2)] w-full"
                      >
                        Data
                        <input
                          type="date"
                          name="mealDate"
                          id="mealDate"
                          className="p-2 block rounded-[.4rem] border border-[var(--gray-5)] lg:rounded-[.5vw] w-full lg:p-[.5vw] active:border-[var(--gray-3)]"
                          onChange={(e) => setMealDate(e.target.value)}
                          value={mealDate}
                          required
                        />
                      </label>
                      <label
                        htmlFor="dateHour"
                        className="text-[var(--gray-2)] w-full"
                      >
                        Hora
                        <input
                          type="time"
                          name="dateHour"
                          id="dateHour"
                          className="p-2 block rounded-[.4rem] border border-[var(--gray-5)] lg:rounded-[.5vw] w-full lg:p-[.5vw] active:border-[var(--gray-3)]"
                          onChange={(e) => setMealHour(e.target.value)}
                          value={mealHour}
                          required
                        />
                      </label>
                    </div>

                    <div className="flex items-center justify-between gap-4 lg:gap-[1vw] w-full">
                      {/*  <label
                        htmlFor="isOnDiet"
                        className="text-[var(--gray-2)] w-full"
                      >
                        Está dentro da dieta?
                        <div className="flex items-center justify-between gap-4 lg:gap-[1vw]">
                          <button
                            id="isOnDiet"
                            className="cursor-pointer p-2 rounded-[.4rem] font-bold border border-[var(--gray-5)] lg:rounded-[.5vw] w-full lg:p-[.5vw] "
                            onClick={() => setMealIsOnDiet(true)}
                          >
                            <span className="bg-[var(--green-dark)] rounded-full inline-block lg:w-[.4vw] lg:h-[.4vw] lg:mr-[.3vw]"></span>
                            Sim
                          </button>
                          <button
                            id="isOnDiet"
                            className="cursor-pointer p-2 rounded-[.4rem] font-bold border border-[var(--gray-5)] lg:rounded-[.5vw] w-full lg:p-[.5vw] "
                            onClick={() => setMealIsOnDiet(true)}
                          >
                            <span className="bg-[var(--red-dark)] rounded-full inline-block lg:w-[.4vw] lg:h-[.4vw] lg:mr-[.3vw]"></span>
                            Não
                          </button>
                        </div>
                      </label> */}

                      <label
                        htmlFor="is_on_diet_yes"
                        className={`flex-1 flex items-center justify-center p-2 rounded-[.4rem] font-bold border cursor-pointer lg:rounded-[.5vw] lg:p-[.5vw]
                                    ${
                                      mealIsOnDiet
                                        ? "bg-[var(--green-light)] border-[var(--green-dark)] text-[var(--green-dark)]"
                                        : "bg-[var(--gray-5)] border-[var(--gray-5)] text-[var(--gray-1)]"
                                    }
                                    transition-all duration-[.2s] ease-in-out hover:brightness-90`}
                      >
                        <input
                          type="radio"
                          id="is_on_diet_yes"
                          name="is_on_diet"
                          value="true"
                          checked={mealIsOnDiet === true}
                          onChange={() => setMealIsOnDiet(true)}
                          className="hidden"
                        />
                        <span
                          className={`w-[.4vw] h-[.4vw] rounded-full inline-block mr-[.3vw] ${
                            mealIsOnDiet
                              ? "bg-[var(--green-dark)]"
                              : "bg-[var(--gray-3)]"
                          }`}
                        ></span>
                        Sim
                      </label>

                      <label
                        htmlFor="is_on_diet_no"
                        className={`flex-1 flex items-center justify-center p-2 rounded-[.4rem] font-bold border cursor-pointer lg:rounded-[.5vw] lg:p-[.5vw]
                                    ${
                                      mealIsOnDiet === false
                                        ? "bg-[var(--red-light)] border-[var(--red-dark)] text-[var(--red-dark)]"
                                        : "bg-[var(--gray-5)] border-[var(--gray-5)] text-[var(--gray-1)]"
                                    }
                                    transition-all duration-[.2s] ease-in-out hover:brightness-90`}
                      >
                        <input
                          type="radio"
                          id="is_on_diet_no"
                          name="is_on_diet"
                          value="false"
                          checked={mealIsOnDiet === false}
                          onChange={() => setMealIsOnDiet(false)}
                          className="hidden"
                        />
                        <span
                          className={`w-[.4vw] h-[.4vw] rounded-full inline-block mr-[.3vw] ${
                            mealIsOnDiet === false
                              ? "bg-[var(--red-dark)]"
                              : "bg-[var(--gray-3)]"
                          }`}
                        ></span>
                        Não
                      </label>
                    </div>
                    {errorMessage && (
                      <p className="text-red-500 text-sm ">{errorMessage}</p>
                    )}
                  </div>

                  <input
                    type="submit"
                    value="Cadastrar refeição"
                    className="mt-6 cursor-pointer p-2 block  border-[var(--gray-1)] rounded-[.4rem] bg bg-[var(--gray-1)] text-[var(--white)] w-full transiction-all duration-[.3s] ease-in-out lg:rounded-[.5vw] lg:p-[.5vw] lg:mt-[1vw]  hover:bg-[var(--gray-2)] "
                  />
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex items-start justify-center gap-4 lg:gap-[2vw] lg:mt-[2.5vw]">
        <div className="lg:w-[50vw]">
          <h2 className="font-medium lg:text-[1.7vw]">Refeições</h2>
        </div>
        <div className="lg:w-[50vw] flex items-start justify-end">
          <div className="-z-100 relative bg-[var(--green-mid)] rounded-[.8rem] flex flex-col items-center justify-center lg:w-full lg:leading-[2.8vw] lg:py-[1.5vw] lg:pt-[3vw] lg:rounded-[.8vw]">
            <h2 className="text-[var(--gray-1)] text-[2rem] font-extrabold lg:text-[4vw]">
              XX.XX%
            </h2>
            <p className="text-[var(--gray-2)] text-[1rem] lg:text-[1.3vw]">
              das refeições dentro da dieta
            </p>
            <Link to={"/dashboard/resume"}>
              <div className="cursor-pointer absolute top-2 right-2 transition-all durarion-[.3s] ease-in-out lg:top-[.6vw] lg:right-[.6vw] hover:scale-105 ">
                <ArrowUpRightIcon size={32} />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
