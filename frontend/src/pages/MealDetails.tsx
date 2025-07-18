import {
  CaretLeftIcon,
  PencilSimpleLineIcon,
  TrashIcon,
  XIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/index.css";

const MealDetails = () => {
  const [mealName, setMealName] = useState<string>("");
  const [mealDesc, setMealDesc] = useState<string>("");
  const [mealDate, setMealDate] = useState<string>("");
  const [mealHour, setMealHour] = useState<string>("");
  const [mealIsOnDiet, setMealIsOnDiet] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // modais de editar refeição
  const [editMealModalOpenWarning, setEditMealModalOpenWarning] =
    useState<boolean>(false);
  const [isEditMealModalOpen, setIsEditMealModalOpen] = useState<boolean>();

  // modais de deletar refeição
  const [isDeleteMealModalOpen, setIsDeleteMealModalOpen] =
    useState<boolean>(false);
  const [deleteMealModalOpenWarning, setDeleteMealModalOpenWarning] =
    useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();

  const meal = location.state?.mealDetails || null;

  useEffect(() => {
    if (isDeleteMealModalOpen || deleteMealModalOpenWarning) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }

    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [isDeleteMealModalOpen, deleteMealModalOpenWarning]);

  useEffect(() => {
    setMealIsOnDiet(meal.is_on_diet === 1 || meal.is_on_diet === true);

    if (!location.state) {
      navigate("/dashboard");
      console.error(
        "Nenhuma refeição foi selecionada previamente. Tente novamente."
      );
      return;
    }
  }, [navigate, meal]);

  // recuperar dados das refeições
  const handleDeleteMeal = async (meal_id: string) => {
    try {
      const response = await fetch(`/api/dashboard/delete/${meal_id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDeleteMealModalOpenWarning(true);
        setIsDeleteMealModalOpen(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // enviar form pra atualizar refeição
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

      const response = await fetch(`/api/dashboard/update/${meal.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: mealName ? mealName : meal.name,
          description: mealDesc ? mealDesc : meal.description,
          meal_date: formattedDate ? formattedDate : meal.date,
          meal_hour: mealHour ? mealHour : meal.hour,
          is_on_diet: mealIsOnDiet,
        }),
      });

      if (response.ok) {
        setIsEditMealModalOpen(false);
        setEditMealModalOpenWarning(true);
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

  // limpar dados do formulario de editar refeição
  const cleanMealFields = () => {
    setMealName("");
    setMealDesc("");
    setMealDate("");
    setMealHour("");
    setMealIsOnDiet(null);
  };

  return (
    <>
      {!meal ? (
        <>Carregando detalhes...</>
      ) : (
        <div className="flex items-center justify-center">
          <div className="w-full m-0 lg:shadow-lg lg:rounded-[1vw] lg:pb-[.2vw] lg:w-[45vw] lg:mt-[13vh]">
            <header
              className={`rounded-[1rem] relative flex items-center justify-between p-4 lg:rounded-[1vw] ${
                meal.is_on_diet
                  ? "bg-[var(--green-mid)]"
                  : "bg-[var(--red-mid)]"
              }`}
            >
              <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-between w-full"
              >
                <div className="cursor-pointer transition-all durarion-[.3s] ease-in-out hover:scale-105">
                  <Link to={"/dashboard"}>
                    <CaretLeftIcon size={30} />
                  </Link>
                </div>
                <h2 className="font-bold text-[1.2rem] lg:text-[2vw]">
                  Refeição
                </h2>
              </motion.div>
            </header>
            <div className="h-[80vh] flex flex-col items-start justify-between m-6 mt-8 lg:m-[2vw] lg:h-full lg:justify-center">
              <div>
                <h2 className="font-bold text-[1.5rem] lg:text-[2vw]">
                  {meal.name}
                </h2>
                <p className="text-[1.1rem] lg:text-[1.5vw]">
                  {meal.description}
                </p>

                <div className="mt-5">
                  <h3 className="font-bold text-[1.3rem] lg:text-[1.7vw]">
                    Data e hora
                  </h3>
                  <p className="text-[1.1rem] lg:text-[1.5vw]">
                    {meal.date} às {meal.hour}
                  </p>
                </div>

                <div className="py-2 px-5 mt-4 rounded-full bg-[var(--gray-5)] w-fit">
                  {meal.is_on_diet ? (
                    <div className="flex items-center justify-center gap-3">
                      <span className="w-[.7rem] h-[.7rem] lg:w-[.7vw] lg:h-[.7vw] rounded-full inline-block mr-[.3vw] bg-[var(--green-dark)] "></span>
                      <p className="text-[1rem] lg:text-[1.3vw]">
                        dentro da dieta
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <span className="w-[.7rem] h-[.7rem] lg:w-[.7vw] lg:h-[.7vw] rounded-full inline-block mr-[.3vw] bg-[var(--red-dark)] "></span>
                      <p className="text-[1rem] lg:text-[1.3vw]">
                        fora da dieta
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="m-0 flex flex-col gap-3 text-center w-full lg:mt-[2vw]">
                <div
                  className="flex items-center justify-center gap-2 p-4 cursor-pointer  rounded-[.8rem] border border-[var(--gray-1)] bg-[var(--white)]
          text-[var(--white)]  transiction-all duration-[.3s] ease-in-out
          lg:rounded-[.5vw] lg:p-[.6vw] lg:px-[1.5vw] hover:bg-[var(--gray-5)]"
                  onClick={() => {
                    cleanMealFields();
                    setIsEditMealModalOpen(true);
                  }}
                >
                  <PencilSimpleLineIcon size={20} color="var(--gray-1)" />

                  <button className="font-bold text-[var(--gray-1)] text-[.9rem] cursor-pointer lg:text-[1.5vw]">
                    Editar refeição
                  </button>
                </div>
                <div
                  className="flex items-center justify-center gap-2 p-4 cursor-pointer  rounded-[.8rem] bg-[var(--gray-1)]
          text-[var(--white)]  transiction-all duration-[.3s] ease-in-out
          lg:rounded-[.5vw] lg:p-[.6vw] lg:px-[1.5vw] hover:bg-[var(--gray-2)] "
                  onClick={() => setIsDeleteMealModalOpen(true)}
                >
                  <TrashIcon size={20} color="var(--white)" />

                  <button className="font-bold text-[.9rem] cursor-pointer lg:text-[1.5vw]">
                    Excluir refeição
                  </button>
                </div>
              </div>
            </div>
            <AnimatePresence mode="wait">
              {isDeleteMealModalOpen && (
                <div className="bg-[#000000a2] absolute top-0 left-0 right-0 bottom-0">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-center"
                  >
                    <div className="p-6 z-999 bg-[var(--white)] mt-[30vh] rounded-[.8rem] w-[17rem] border border-[var(--gray-4)]  lg:w-[23vw] lg:p-[2vw] lg:mt-[30vh] lg:rounded-[.8vw]">
                      <div className="flex items-center justify-center flex-col text-center">
                        <h3 className="font-bold text-[1.2rem] text-[var(--gray-1)] lg:text-[1.4vw]">
                          Deseja realmente excluir o registro da refeição?
                        </h3>
                        <div className="mt-4 flex items-center justify-center gap-4 lg:gap-[1vw] lg:mt-[.8vw]">
                          <div
                            className="flex items-center justify-center gap-2 p-3 cursor-pointer  rounded-[.5rem] border border-[var(--gray-1)] bg-[var(--white)]
          text-[var(--white)]  transiction-all duration-[.3s] ease-in-out
          lg:rounded-[.5vw] lg:p-[.6vw] lg:px-[1.5vw] hover:bg-[var(--gray-5)]"
                            onClick={() => setIsDeleteMealModalOpen(false)}
                          >
                            <button className="font-bold text-[var(--gray-1)] text-[.9rem] cursor-pointer lg:text-[1.2vw]">
                              Cancelar
                            </button>
                          </div>

                          <div
                            className="flex items-center justify-center gap-2 p-3 cursor-pointer  rounded-[.5rem] bg-[var(--gray-1)]
          text-[var(--white)]  transiction-all duration-[.3s] ease-in-out
          lg:rounded-[.5vw] lg:p-[.6vw] lg:px-[1.5vw] hover:bg-[var(--gray-2)] "
                            onClick={() => handleDeleteMeal(meal.id)}
                          >
                            <button className="font-bold text-[.9rem] cursor-pointer lg:text-[1.2vw]">
                              Sim, excluir
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
            <AnimatePresence mode="wait">
              {deleteMealModalOpenWarning && (
                <div className="bg-[#000000a2] absolute top-0 left-0 right-0 bottom-0">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-center"
                  >
                    <div className="p-6 z-999 bg-[var(--white)] mt-[30vh] rounded-[.8rem] w-[17rem] border border-[var(--gray-4)]  lg:w-[23vw] lg:p-[2vw] lg:mt-[30vh] lg:rounded-[.8vw]">
                      <div className="flex items-center justify-center flex-col text-center lg:gap-[.5vw]">
                        <h3 className="font-bold text-[1.2rem] text-[var(--gray-1)] lg:text-[1.4vw]">
                          A refeição foi deletada!
                        </h3>
                        <p className="lg:text-[1.2vw] lg:leading-[1.5vw]">
                          Você irá ser redirecionado para o seu dashboard!
                        </p>
                        <div
                          className="mt-2 flex items-center justify-center gap-2 p-3 cursor-pointer  rounded-[.5rem] bg-[var(--gray-1)]
          text-[var(--white)]  transiction-all duration-[.3s] ease-in-out
          lg:rounded-[.5vw] lg:p-[.6vw] lg:px-[1.5vw] hover:bg-[var(--gray-2)] "
                          onClick={() => {
                            navigate("/dashboard");
                          }}
                        >
                          <button className="font-bold text-[.9rem] cursor-pointer lg:text-[1.2vw]">
                            Confirmar
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
            <AnimatePresence mode="wait">
              {isEditMealModalOpen && (
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
                    <div className="p-5 z-999 bg-[var(--white)] mt-[10vh] w-[30rem] rounded-[.8rem] border border-[var(--gray-4)]  lg:w-[30vw] lg:p-[2vw] lg:mt-[10vh] lg:rounded-[.8vw]">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[1.2rem] font-medium lg:text-[1.4vw]">
                          Nova refeição
                        </h3>

                        <button
                          type="button"
                          className="cursor-pointer"
                          onClick={() => setIsEditMealModalOpen(false)}
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
                              value={mealName ? mealName : meal.name}
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
                              value={mealDesc ? mealDesc : meal.description}
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
                            <p className="text-red-500 text-sm ">
                              {errorMessage}
                            </p>
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
            <AnimatePresence mode="wait">
              {editMealModalOpenWarning && (
                <div className="bg-[#000000a2] absolute top-0 left-0 right-0 bottom-0">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-center"
                  >
                    <div className="p-6 z-999 bg-[var(--white)] mt-[30vh] rounded-[.8rem] w-[17rem] border border-[var(--gray-4)]  lg:w-[23vw] lg:p-[2vw] lg:mt-[30vh] lg:rounded-[.8vw]">
                      <div className="flex items-center justify-center flex-col text-center lg:gap-[.5vw]">
                        <h3 className="font-bold text-[1.2rem] text-[var(--gray-1)] lg:text-[1.4vw]">
                          A refeição foi editada!
                        </h3>
                        <p className="lg:text-[1.2vw] lg:leading-[1.5vw]">
                          Você irá ser redirecionado para o seu dashboard!
                        </p>
                        <div
                          className="mt-2 flex items-center justify-center gap-2 p-3 cursor-pointer  rounded-[.5rem] bg-[var(--gray-1)]
          text-[var(--white)]  transiction-all duration-[.3s] ease-in-out
          lg:rounded-[.5vw] lg:p-[.6vw] lg:px-[1.5vw] hover:bg-[var(--gray-2)] "
                          onClick={() => {
                            navigate("/dashboard");
                          }}
                        >
                          <button className="font-bold text-[.9rem] cursor-pointer lg:text-[1.2vw]">
                            Confirmar
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </>
  );
};

export default MealDetails;
