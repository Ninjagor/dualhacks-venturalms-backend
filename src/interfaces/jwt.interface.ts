export default interface JwtPayload {
    name?: string;
    email: string;
    password: string;
    id: string;
}

export default interface JwtUser {
    name?: string;
    email: string;
    password: string;
    id: string;
}

export type ReqUserDetails = {
    usersName: string;
    email: string;
    id: string
}

