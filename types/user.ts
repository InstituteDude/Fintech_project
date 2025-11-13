export type UserType = "peminjam" | "investor"

export interface ClientUser {
  id: string
  email: string
  name: string
  type: UserType
  createdAt: string
}
