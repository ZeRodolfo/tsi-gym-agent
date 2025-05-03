import { FaSyncAlt } from "react-icons/fa";

export default function Loading({ size = 42, text = "carregando..." }) {
  return (
    <div className="flex flex-col gap-2 justify-center items-center w-full h-screen">
      <FaSyncAlt size={size} className="animate-spin text-primary" />
      <h2 className="font-semibold text-md text-primary">{text}</h2>
      </div>
  );
}
