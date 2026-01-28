export const getToken = () => localStorage.getItem('token')

export const setToken = (token) => localStorage.setItem('token', token)

export const removeToken = () => localStorage.removeItem('token')

export const isAuthenticated = () => !!getToken()

export const getUserFromToken = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload
  } catch {
    return null
  }
}

export const hasRole = (user, role) => user?.role === role

export const canAccess = (user, allowedRoles) => 
  allowedRoles.includes(user?.role)