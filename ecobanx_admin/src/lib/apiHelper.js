import apiClient from "./axiosInterceptor";

function getTokenConfig(token, config = {}) {
  return {
    ...config,
    headers: {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    },
  };
}

export async function getApi(endpoint, payload = {}, config = {}) {
  const response = await apiClient.get(endpoint, {
    ...config,
    params: payload,
  });

  return response.data;
}

export async function postApi(endpoint, payload = {}, config = {}) {
  const response = await apiClient.post(endpoint, payload, config);

  return response.data;
}

export async function putApi(endpoint, payload = {}, config = {}) {
  const response = await apiClient.put(endpoint, payload, config);

  return response.data;
}

export async function patchApi(endpoint, payload = {}, config = {}) {
  const response = await apiClient.patch(endpoint, payload, config);

  return response.data;
}

export async function deleteApi(endpoint, payload = {}, config = {}) {
  const response = await apiClient.delete(endpoint, {
    ...config,
    data: payload,
  });

  return response.data;
}

export function getWithTokenApi(token, endpoint, payload = {}, config = {}) {
  return getApi(endpoint, payload, getTokenConfig(token, config));
}

export function postWithTokenApi(token, endpoint, payload = {}, config = {}) {
  return postApi(endpoint, payload, getTokenConfig(token, config));
}

export function putWithTokenApi(token, endpoint, payload = {}, config = {}) {
  return putApi(endpoint, payload, getTokenConfig(token, config));
}

export function patchWithTokenApi(token, endpoint, payload = {}, config = {}) {
  return patchApi(endpoint, payload, getTokenConfig(token, config));
}

export function deleteWithTokenApi(token, endpoint, payload = {}, config = {}) {
  return deleteApi(endpoint, payload, getTokenConfig(token, config));
}
