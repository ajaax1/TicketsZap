import api from "./api"

export async function forgotPassword(email) {
  const response = await api.post(`/password/forgot`, { email })
  return response.data
}

export async function verifyResetToken(token, email) {
  const response = await api.get(`/password/verify-token`, {
    params: { token, email }
  })
  return response.data
}

export async function resetPassword(payload) {
  const response = await api.post(`/password/reset`, payload)
  return response.data
}
