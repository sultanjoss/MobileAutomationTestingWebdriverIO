export interface LoginTestData {
    id: string;
    description: string;
    username: string;
    password: string;
    expectedError: string;
}

export const negativeLoginData: LoginTestData[] = [
    {
        id: 'TC-LOGIN-002',
        description: 'Username dan password kosong',
        username: '',
        password: '',
        expectedError: 'Username is required'
    },
    {
        id: 'TC-LOGIN-003',
        description: 'Username kosong dan password benar',
        username: '',
        password: 'secret_sauce',
        expectedError: 'Username is required'
    },
    {
        id: 'TC-LOGIN-004',
        description: 'Username benar dan password kosong',
        username: 'standard_user',
        password: '',
        expectedError: 'Password is required'
    },
    {
        id: 'TC-LOGIN-005',
        description: 'Username benar dan password salah',
        username: 'standard_user',
        password: 'wrong_password',
        expectedError: 'Username and password do not match'
    },
    {
        id: 'TC-LOGIN-006',
        description: 'Login menggunakan akun terkunci',
        username: 'locked_out_user',
        password: 'secret_sauce',
        expectedError: 'Sorry, this user has been locked out'
    }
];