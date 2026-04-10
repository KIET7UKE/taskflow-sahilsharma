import axios, { type AxiosRequestConfig } from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:4000",
});

let cachedToken: any = null;

export const setInterceptors = async () => {
  const token = localStorage.getItem("token");

  if (token) {
    cachedToken = token;
  }

  axiosInstance.interceptors.request.use(
    (config: any) => {
      if (cachedToken) {
        config.headers.Authorization = `Bearer ${cachedToken}`;
      }
      return config;
    },
    (error: any) => Promise.reject(error),
  );
};

const withInterceptors = async (callback: () => Promise<any>) => {
  await setInterceptors();
  return callback();
};

export const getAPI = async <T>(
  endpoint: string,
  params: any = {},
  headers: AxiosRequestConfig["headers"] = {},
  responseType: AxiosRequestConfig["responseType"] = "json",
): Promise<T> => {
  return withInterceptors(async () => {
    try {
      const response = await axiosInstance.get<T>(endpoint, {
        params,
        headers,
        responseType,
      });
      return response.data;
    } catch (error: any) {
      if (error?.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  });
};

export const postAPI = async <T>(
  endpoint: string,
  data: any = {},
  params: any = {},
  headers: AxiosRequestConfig["headers"] = {},
  responseType: AxiosRequestConfig["responseType"] = "json",
): Promise<T> => {
  return withInterceptors(async () => {
    try {
      const response = await axiosInstance.post<T>(endpoint, data, {
        params,
        headers,
        responseType,
      });
      return response.data;
    } catch (error: any) {
      if (error?.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  });
};

export const putAPI = async <T>(
  endpoint: string,
  data: any = {},
  params: any = {},
  headers: AxiosRequestConfig["headers"] = {},
): Promise<T> => {
  return withInterceptors(async () => {
    try {
      const response = await axiosInstance.put<T>(endpoint, data, {
        params,
        headers,
      });
      return response.data;
    } catch (error: any) {
      if (error?.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  });
};

export const deleteAPI = async <T>(
  endpoint: string,
  data: any = {},
  params: any = {},
  headers: AxiosRequestConfig["headers"] = {},
): Promise<T> => {
  return withInterceptors(async () => {
    try {
      const response = await axiosInstance.delete<T>(endpoint, {
        data,
        params,
        headers,
      });
      return response.data;
    } catch (error: any) {
      if (error?.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  });
};

export const patchAPI = async <T>(
  endpoint: string,
  data: any = {},
  params: any = {},
  headers: AxiosRequestConfig["headers"] = {},
): Promise<T> => {
  return withInterceptors(async () => {
    try {
      const response = await axiosInstance.patch<T>(endpoint, data, {
        params,
        headers,
      });
      return response.data;
    } catch (error: any) {
      if (error?.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  });
};
