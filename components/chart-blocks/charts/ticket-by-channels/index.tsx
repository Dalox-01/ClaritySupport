import { PieChart } from "lucide-react";
import ChartTitle from "../../components/chart-title";
import Chart from "./chart";

export default function TicketByChannels() {
  return (
    <section className="flex h-full flex-col gap-1">
      <ChartTitle title="Emails par Catégorie" icon={PieChart} />
      <div className="relative flex flex-grow flex-col justify-center min-h-0">
        <Chart />
      </div>
    </section>
  );
}
