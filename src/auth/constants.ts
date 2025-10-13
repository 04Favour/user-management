/* eslint-disable prettier/prettier */
const JWT_SECRET = process.env.JWT_SECRET || "Afallbackkey"
const BCRYPT_SALT = parseInt(process.env.BCRYPT_SALT || "10", 10)
export const JwtConstant = {
    secret: JWT_SECRET,
    saltRounds: BCRYPT_SALT
}