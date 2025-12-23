interface loginRequest {
  email: string,
  password: string,
}

interface loginResponse {
  id: number,
  name: string,
  phone_number: string,
  role: string,
  email: string,
}

export type { loginRequest, loginResponse }
