import data from "../../data.json"

export default function Contact() {
  return (
    <>
      <p>Phone: {data.phone}</p>
      <p>Address: {data.address}</p>
    </>
  );
}
