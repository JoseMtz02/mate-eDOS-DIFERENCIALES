import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
const PORT = 3000;
const WOLFRAM_APP_ID = "TA4L4Y-2RYU7AK3KH";

app.use(cors());
app.use(express.json());

app.post("/resolver", async (req, res) => {
  const ecuacion = req.body.ecuacion;
  if (!ecuacion) return res.status(400).json({ error: "Falta la ecuación" });

  const query = encodeURIComponent(`solve ${ecuacion}`);
  const url = `https://api.wolframalpha.com/v2/query?input=${query}&format=plaintext&output=JSON&appid=${WOLFRAM_APP_ID}`;

  try {
    const response = await axios.get(url);
    const data = response.data;
    
    if (data.queryresult.success) {
      const pods = data.queryresult.pods;
      // console.log(pods);

      const solutionPod = pods.find(pod => pod.title === "Result");
      console.log(solutionPod);
      console.log(pods);

      if (solutionPod && solutionPod.subpods && solutionPod.subpods.length > 0) {
        res.json({ solucion: solutionPod.subpods[0].plaintext });
      } else {
        res.json({ error: "No se encontró solución en la respuesta." });
      }
    } else {
      res.json({ error: "No se pudo resolver la ecuación." });
    }
  } catch (error) {
    res.status(500).json({ error: "Error en la API de Wolfram Alpha: " + error.message });
  }
});


app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
