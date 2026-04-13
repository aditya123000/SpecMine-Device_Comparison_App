import { initializeApp } from "../src/Backend/app.js";

export default async function handler(req, res) {
  const app = await initializeApp();
  return app(req, res);
}
