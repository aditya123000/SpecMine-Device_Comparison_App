import { initializeApp } from "../backend/app";

export default async function handler(req, res) {
  const app = await initializeApp();
  return app(req, res);
}
