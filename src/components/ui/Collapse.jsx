import React from "react";
import { Label } from "./Label";
import { Title } from "./Title";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";

export const Collapse = ({ title, description, children }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="border rounded shadow-sm">
      {/* Header do collapse */}
      <button
        type="button"
        className="w-full px-4 py-3 flex justify-between items-center bg-gray-100 hover:bg-gray-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="text-left">
          <Title className="text-lg text-left">{title}</Title>
          {description && <Label>{description}</Label>}
        </div>
        <span className="ml-2">{isOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}</span>
      </button>

      {/* Conteúdo do collapse */}
      {isOpen && <div className="p-2 bg-gray-100 border border-t-gray-300">{children}</div>}
    </div>
  );
};
