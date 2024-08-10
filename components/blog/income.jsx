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

const Income = () => {
  return (
    <div className="mb-8">
      <h1 className="text-2xl mb-2">Income</h1>
      <div className="border-2 p-4 rounded-xl border-neutral-600 bg-neutral-800">
        <div className="md:flex md:justify-between mb-2 w-128">
          <div className="md:flex md:justify-between w-128">
            <div className="w-6">
              {" "}
              <Image
                src={
                  "https://companieslogo.com/img/orig/ACN-cce5b411.png?t=1633439499"
                }
                alt="Accenture Logo"
                width={200}
                height={200}
                className="w-full"
              />
            </div>
            <h1 className="font-bold pl-2">Accenture</h1>
          </div>
          <h1>$700/mo</h1>
        </div>
        <p className="mb-4 text-neutral-400">Semi Senior Software Engineer</p>
        <Chart data={data}></Chart>
      </div>
    </div>
  );
};

export default Income;
