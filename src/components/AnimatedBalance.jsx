import { useAnimatedBalance } from "../hooks/useAnimatedBalance";
import { fKES } from "../utils/format";

export default function AnimatedBalance({ value }) {
  const disp = useAnimatedBalance(value);
  return <span>{fKES(disp)}</span>;
}