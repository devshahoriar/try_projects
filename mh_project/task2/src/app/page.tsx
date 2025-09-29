import { parseCSV } from "@/lib/csvOpration";
import EditTable from "./EditTable";

const HomePage = async () => {
  const generatorData = await parseCSV();

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-8 text-center text-3xl font-bold">CSV Data Editor</h1>
      <EditTable initialData={generatorData} />
    </div>
  );
};

export default HomePage;
