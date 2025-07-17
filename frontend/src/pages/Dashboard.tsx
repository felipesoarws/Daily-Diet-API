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

interface Meal {
  id: string;
  name: string;
  description: string;
  hour: string;
  date: string;
  is_on_diet: boolean;
}

function Dashboard() {
  const [mealsPercent, setMealsPercent] = useState<number | 0>();
  const [meals, setMeals] = useState<Meal[] | []>([]);
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

  // recuperar dados das refeições
  const fetchMealsData = async () => {
    try {
      // faz a requisição para a rota /api/dashboard no backend
      const response = await fetch("/api/dashboard/meals");

      if (response.ok) {
        const data = await response.json();
        setMeals(data);
      } else {
        const errorData = await response.json();
        setError(
          errorData.message ||
            "Falha ao carregar dados das refeições do usuário."
        );
        console.error(
          "Erro ao buscar dados das refeições do usuário:",
          errorData
        );
        navigate("/");
      }
    } catch (error) {
      setError(
        "Não foi possível conectar ao servidor para obter dados das refeições."
      );
      console.error("Erro de rede ao buscar dados das refeições:", error);
    }
  };

  // separar refeições por data para listagem
  const mealsByDate = (allMeals: Meal[]) => {
    return allMeals.reduce<Record<string, Meal[]>>((grouped, meal) => {
      const date = meal.date; // retornar chave principal para agrupar

      // verificar se a chave ja existe no objeto agrupado - se não existir, cria um novo array pra essa data
      if (!grouped[date]) {
        grouped[date] = [];
      }

      // adiciona a refeição ao array correspondente a essa data
      grouped[date].push(meal);

      return grouped;
    }, {});
    // {} para indicar que o valor inicial do 'grouped' = vazio
  };

  // refeições por data
  const groupedMeals = mealsByDate(meals);

  // calcular porcentagem de refeições que estão na dieta
  const howManyMealsIsOnDiet = () => {
    if (meals.length === 0) return 0;

    const mealsOnDiet = meals.filter((meal) => meal.is_on_diet).length;

    const percentage = (mealsOnDiet / meals.length) * 100;
    return Number(percentage);
  };

  useEffect(() => {
    if (isOpenNewMealMenu) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }

    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [isOpenNewMealMenu]);

  useEffect(() => {
    const calculatedPercentage = howManyMealsIsOnDiet();
    setMealsPercent(Number(calculatedPercentage));
  }, [meals]);

  useEffect(() => {
    // recuperar dados do usuário
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

        await fetchMealsData();
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
        await fetchMealsData();
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

  // limpar dados do formulario de nova refeição
  const cleanMealFields = () => {
    setMealName("");
    setMealDesc("");
    setMealDate("");
    setMealHour("");
    setMealIsOnDiet(true);
  };

  // abrir refeição detalhada
  const detailedMeal = (meal: Meal) => {
    /*   console.log(meal); */

    navigate("/dashboard/details", { state: { mealDetails: meal } });
  };

  return (
    <div className="m-6 lg:m-[2vw]">
      <header className="relative flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.5 }}
        >
          <div className="cursor-pointer transition-all durarion-[.3s] ease-in-out hover:scale-105">
            <Link to={"/"}>
              <img
                src={logo}
                alt="daily diet logo"
                className="w-[4rem] cursor-pointer object-cover h-full  pointer-events-none select-none g:w-[6vw]"
              />
            </Link>
          </div>
        </motion.div>

        <div className="flex items-center gap-6 lg:gap-[2vw]">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="hidden p-2 cursor-pointer  items-center justify-center gap-4 rounded-[.4rem] bg-[var(--gray-1)]
          text-[var(--white)]  transiction-all duration-[.3s] ease-in-out
          lg:rounded-[.5vw] lg:p-[.6vw] lg:px-[1.5vw] hover:bg-[var(--gray-2)] lg:flex"
              onClick={() => {
                setErrorMessage("");
                setIsOpenNewMealMenu(true);
                setIsOpenProfileMenu(false);
              }}
            >
              <PlusIcon size={20} />
              <button className="text-[.9rem] cursor-pointer lg:text-[1vw]">
                Nova refeição
              </button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="cursor-pointer transition-all durarion-[.3s] ease-in-out hover:scale-105"
              onClick={() => setIsOpenProfileMenu(!isOpenProfileMenu)}
            >
              <UserCircleIcon size={40} />
            </div>
          </motion.div>
        </div>
        {isOpenProfileMenu && (
          <div className="absolute top-12 right-2  lg:right-[.1vw] lg:mt-[3vw] ">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={handleLogout}
                className="p-2 rounded-[.4rem] cursor-pointer transiction-all duration-[.3s] ease-in-out  bg-[var(--gray-1)] text-[var(--white)]  lg:p-[.3vw] lg:rounded-[.3vw] lg:px-[1vw] hover:bg-[var(--gray-2)]"
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
              className="flex items-center justify-center"
            >
              <div className="p-4 z-999 bg-[var(--white)] mt-12 rounded-[.8rem] border border-[var(--gray-4)]  lg:w-[30vw] lg:p-[2vw] lg:mt-[3vw] lg:rounded-[.8vw]">
                <div className="flex items-center justify-between">
                  <h3 className="text-[1.2rem] font-medium lg:text-[1.4vw]">
                    Nova refeição
                  </h3>

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
      <div className="mt-5 flex flex-col-reverse items-start justify-center gap-4 lg:gap-[5vw] lg:mt-[2.5vw] lg:flex-row">
        <div className="w-full lg:w-[50vw]">
          <h2 className="text-[1.1rem] font-bold lg:text-[2.5vw]">Refeições</h2>
          <div
            className="flex p-3 cursor-pointer w-full items-center justify-center gap-4 rounded-[.4rem] bg-[var(--gray-1)]
          text-[var(--white)]  transiction-all duration-[.3s] ease-in-out
       hover:bg-[var(--gray-2)] lg:hidden"
            onClick={() => {
              setErrorMessage("");
              setIsOpenNewMealMenu(true);
              setIsOpenProfileMenu(false);
            }}
          >
            <PlusIcon size={17} />
            <button className="text-[.9rem] cursor-pointer lg:text-[1vw]">
              Nova refeição
            </button>
          </div>
          <div className="mt-4 lg:mt-[2vw]">
            {Object.keys(groupedMeals).length < 1 ? (
              <>Carregando...</>
            ) : (
              <div className="flex flex-col items-start justify-center gap-6 lg:gap-[2.5vw] ">
                {Object.keys(groupedMeals).map((date) => (
                  <div key={date}>
                    <h2 className="font-bold lg:text-[1.7vw]">
                      {date.replaceAll("/", ".")}
                    </h2>
                    <div className="mt-2 w-full flex flex-col items-start justify-center gap-2 lg:gap-[.8vw] lg:w-[50vw] lg:mt-[.6vw] ">
                      {groupedMeals[date].map((meal, index) => (
                        <div
                          key={index}
                          className="w-[85vw] cursor-pointer gap-4 flex items-center justify-between p-2 rounded-[.4rem] border border-[var(--gray-5)] lg:rounded-[.5vw] lg:px-[1vw] lg:p-[.8vw] active:border-[var(--gray-3)] transiction-all duration-[.3s] ease-in-out lg:mt-[.2vw] lg:w-[50vw]   hover:bg-[var(--gray-4)] "
                          onClick={() => detailedMeal(meal)}
                        >
                          <div className="flex items-center justify-center gap-2 lg:gap-[.8vw]">
                            <p className="font-bold lg:text-[1.2vw]">
                              {meal.hour}
                            </p>
                            <span className="text-[var(--gray-4)]">|</span>
                            <p className="font-regular lg:text-[1.5vw]">
                              {meal.name}
                            </p>
                          </div>
                          {meal.is_on_diet ? (
                            <span className="w-[.45rem] h-[.45rem] lg:w-[.7vw] lg:h-[.7vw] rounded-full inline-block mr-[.3vw] bg-[var(--green-dark)] "></span>
                          ) : (
                            <span className="w-[.45rem] h-[.45rem] lg:w-[.7vw] lg:h-[.7vw] rounded-full inline-block mr-[.3vw] bg-[var(--red-dark)] "></span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="w-full lg:w-[30vw] flex items-start justify-center lg:justify-end">
          {mealsPercent! > 50 ? (
            <div className="-z-1 w-full p-4 pt-7 relative leading-7 bg-[var(--green-mid)] rounded-[.5rem] flex flex-col items-center justify-center lg:leading-[2.8vw] lg:py-[1.5vw] lg:pt-[3vw] lg:rounded-[.8vw]">
              {!mealsPercent ? (
                <h2 className="text-[var(--gray-1)] text-[2rem] font-extrabold lg:text-[4vw]">
                  Carregando...
                </h2>
              ) : (
                <h2 className="text-[var(--gray-1)] text-[2rem] font-extrabold lg:text-[4vw]">
                  {mealsPercent.toFixed(2)}%
                </h2>
              )}
              <p className="text-[var(--gray-2)] text-[1rem] lg:text-[1.3vw]">
                das refeições dentro da dieta
              </p>
              <Link to={"/dashboard/summary"}>
                <div className="cursor-pointer absolute top-2 right-2 transition-all durarion-[.3s] ease-in-out lg:top-[.6vw] lg:right-[.6vw] hover:scale-105 ">
                  <ArrowUpRightIcon size={32} />
                </div>
              </Link>
            </div>
          ) : (
            <div className="-z-100 relative bg-[var(--red-mid)] rounded-[.8rem] flex flex-col items-center justify-center lg:w-full lg:leading-[2.8vw] lg:py-[1.5vw] lg:pt-[3vw] lg:rounded-[.8vw]">
              {!mealsPercent ? (
                <h2 className="text-[var(--gray-1)] text-[2rem] font-extrabold lg:text-[4vw]">
                  Carregando...
                </h2>
              ) : (
                <h2 className="text-[var(--gray-1)] text-[2rem] font-extrabold lg:text-[4vw]">
                  {mealsPercent.toFixed(2)}%
                </h2>
              )}
              <p className="text-[var(--gray-2)] text-[1rem] lg:text-[1.3vw]">
                das refeições dentro da dieta
              </p>
              <Link to={"/dashboard/summary"}>
                <div className="cursor-pointer absolute top-2 right-2 transition-all durarion-[.3s] ease-in-out lg:top-[.6vw] lg:right-[.6vw] hover:scale-105 ">
                  <ArrowUpRightIcon size={32} />
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
