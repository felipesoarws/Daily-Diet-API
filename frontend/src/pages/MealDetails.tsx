import { CaretLeftIcon } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/index.css";

const MealDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const meal = location.state?.mealDetails || null;

  useEffect(() => {
    if (!location.state) {
      navigate("/dashboard");
      console.error(
        "Nenhuma refeição foi selecionada previamente. Tente novamente."
      );
      return;
    }
  }, [navigate]);

  return (
    <>
      {!meal ? (
        <>Carregando detalhes...</>
      ) : (
        <div className="m-0">
          <header
            className={`rounded-b-[1rem] relative flex items-center justify-between p-4 ${
              meal.is_on_diet ? "bg-[var(--green-mid)]" : "bg-[var(--red-mid)]"
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
              <h2 className="font-bold text-[1.2rem] lg:text-[2.5vw]">
                Refeição
              </h2>
            </motion.div>
          </header>
          <div className="m-6 mt-8 lg:m-[2vw]">
            <h2 className="font-bold text-[1.5rem] lg:text-[2.5vw]">
              {meal.name}
            </h2>
            <p className="text-[1.1rem] lg:text-[1.8vw]">{meal.description}</p>

            <div className="mt-5">
              <h3 className="font-bold text-[1.3rem] lg:text-[1.5vw]">
                Data e hora
              </h3>
              <p className="text-[1.1rem] lg:text-[1.8vw]">
                {meal.date} às {meal.hour}
              </p>
            </div>

            <div className="p-3 px-5 mt-4 rounded-full bg-[var(--gray-5)] w-fit">
              {meal.is_on_diet ? (
                <div className="flex items-center justify-center gap-3">
                  <span className="w-[.7rem] h-[.7rem] lg:w-[.7vw] lg:h-[.7vw] rounded-full inline-block mr-[.3vw] bg-[var(--green-dark)] "></span>
                  <p className="text-[1rem] lg:text-[1.8vw]">dentro da dieta</p>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <span className="w-[.7rem] h-[.7rem] lg:w-[.7vw] lg:h-[.7vw] rounded-full inline-block mr-[.3vw] bg-[var(--red-dark)] "></span>
                  <p className="text-[1rem] lg:text-[1.8vw]">fora da dieta</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MealDetails;
