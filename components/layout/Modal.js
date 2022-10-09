import { useEffect } from "react";
import styled from "styled-components";

const Container = styled.div`
  padding: 12px;
  border: 3px solid red;
  max-width: 100%;
  max-height: 95%;
  overflow: auto;
  position: fixed;
  display: grid;
  z-index: 1000;
  top: 50vh;
  left: 50%;
  transform: translateY(-50%) translateX(-50%);
  background: white;
`;

export const Modal = ({ show, children, onClose }) => {
  useEffect(() => {
    let init = false;
    const handler = () => {
      if (init) onClose();
      init = true;
    };

    document.addEventListener("click", handler);

    return () => {
      document.removeEventListener("click", handler);
    };
  }, []);

  return <Container onClick={(e) => e.stopPropagation()}>{children}</Container>;
};
