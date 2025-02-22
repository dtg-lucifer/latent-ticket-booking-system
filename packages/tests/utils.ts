import axios from "axios";

export const post = async (url: string, data: Record<string, any>) => {
  try {
    return await axios.post(url, data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response;
    }
    throw error; // rethrow non-Axios errors (like network errors)
  }
};
