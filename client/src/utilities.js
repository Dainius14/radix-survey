export const checkIfResponseOk = (response) => {
  if (!response.ok)
    throw Error(response.statusText);
  return response;
}
