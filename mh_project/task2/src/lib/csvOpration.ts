import Papa from "papaparse";
import fs from "fs/promises";
import path from "path";

interface CSVRow {
  domain: string;
  title: string;
  description: string;
  phone: string;
  address: string;
}

export const parseCSV = async (): Promise<CSVRow[]> => {
  const csvPath = path.join(process.cwd(), "input.csv");

  try {
    const fileString = await fs.readFile(csvPath, "utf8");

    return new Promise((resolve, reject) => {
      Papa.parse(fileString, {
        header: true, // Use first row as headers
        skipEmptyLines: true,
        complete: function (results) {
          if (results.errors.length > 0) {
            reject(
              new Error(
                `CSV parsing errors: ${JSON.stringify(results.errors)}`,
              ),
            );
            return;
          }

          const jsonData = results.data as CSVRow[];

          resolve(jsonData);
        },
        error: function (error: Error) {
          reject(error);
        },
      });
    });
  } catch (error) {
    throw error;
  }
};

export const saveCSV = async (data: CSVRow[]) => {
  const csv = Papa.unparse(data);
  const csvPath = path.join(process.cwd(), "input.csv");
  // save csv file
  return await fs.writeFile(csvPath, csv);
};