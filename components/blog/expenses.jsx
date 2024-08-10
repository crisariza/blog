import Chart from "../components/chart";
import Image from "next/image";

const data = [
  { month: "Jan", amount: 500 },
  { month: "Feb", amount: 600 },
  { month: "Mar", amount: 500 },
  { month: "Apr", amount: 400 },
  { month: "May", amount: 700 },
  { month: "May", amount: 300 },
  { month: "Jun", amount: 600 },
  { month: "Jul", amount: 500 },
  { month: "Sep", amount: 600 },
  { month: "Oct", amount: 500 },
];

const Expenses = () => {
  return (
    <div className="mb-8">
      <h1 className="text-2xl mb-2">Expenses</h1>
      <div className="border-2 p-4 rounded-xl border-neutral-600 bg-neutral-800">
        <div className="md:flex md:justify-between mb-2 w-128">
          <div className="md:flex md:justify-between w-128">
            <div className="w-10">
              <Image
                src={
                  "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Flag_of_Argentina.svg/1200px-Flag_of_Argentina.svg.png"
                }
                alt="Accenture Logo"
                width={200}
                height={200}
                className="w-full"
              />
            </div>
            <h1 className="font-bold pl-2">Buenos Aires</h1>
          </div>
          <h1>$500/mo</h1>
        </div>
        <p className="mb-4 text-neutral-400">Living alone</p>
        <Chart data={data}></Chart>
      </div>
    </div>
  );
};

export default Expenses;
