import { useContext } from "react";
import { CompareContext } from "./CompareContextObject";

export const useCompare = () => useContext(CompareContext);
