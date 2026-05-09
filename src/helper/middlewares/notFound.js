import { getNotFoundPage } from "../../views/notFoundPage.js";

const notFound = (req, res) => {
  // If request accepts HTML, send the beautiful 404 page
  if (req.accepts("html")) {
    return res.status(404).send(getNotFoundPage());
  }

  // Otherwise, send the JSON response
  return res.status(404).send({
    success: false,
    error: true,
    message: "No matching API route found for this request",
  });
};

export default notFound;
