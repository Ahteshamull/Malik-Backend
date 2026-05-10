import { getNotFoundPage } from "../../views/notFoundPage.js";

const notFound = (req, res) => {
  // If the request is for an API route or doesn't explicitly accept HTML, send JSON
  if (req.originalUrl.includes("/api") || !req.accepts("html")) {
    return res.status(404).send({
      success: false,
      error: true,
      message: `No matching API route found for ${req.method} ${req.originalUrl}. Please check your URL and method.`,
    });
  }

  // Otherwise, send the beautiful 404 page for browser users
  return res.status(404).send(getNotFoundPage());
};

export default notFound;
