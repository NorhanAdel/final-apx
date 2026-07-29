// ============= Registration =============
export const REGISTER_MUTATION = `
  mutation Register($input: CreateAuthInput!) {
    register(input: $input)
  }
`;

// ============= Login =============
export const LOGIN_MUTATION = `
  mutation Login($input: LoginInput!) {
    login(input: $input)
  }
`;

// ============= Google Register =============
export const GOOGLE_REGISTER_MUTATION = `
  mutation GoogleRegister($input: GoogleAuthInput!) {
    googleRegister(input: $input)
  }
`;

// ============= Google Login =============
export const GOOGLE_LOGIN_MUTATION = `
  mutation GoogleLogin($input: GoogleAuthInput!) {
    googleLogin(input: $input)
  }
`;

// ============= Auto Login with Remember Token =============
export const AUTO_LOGIN_MUTATION = `
  mutation AutoLogin($rememberToken: String!) {
    autoLogin(rememberToken: $rememberToken) {
      token
      refreshToken
      rememberToken
      user {
        id
        email
        role
        is_verified
        is_email_verified
        is_active
        has_active_subscription
        created_at
        updated_at
      }
    }
  }
`;

// ============= Refresh Token =============
export const REFRESH_TOKEN_MUTATION = `
  mutation RefreshToken($input: RefreshTokenInput!) {
    refreshToken(input: $input) {
      token
      refreshToken
    }
  }
`;

// ============= Logout =============
export const LOGOUT_MUTATION = `
  mutation Logout {
    logout
  }
`;

// ============= Unified OTP Verification =============
export const VERIFY_OTP_MUTATION = `
  mutation VerifyOtp($input: VerifyOtpInput!) {
    verifyOtp(input: $input) {
      token
      refreshToken
      rememberToken
      user {
        id
        email
        role
        is_verified
        is_email_verified
        is_active
        has_active_subscription
        created_at
        updated_at
      }
    }
  }
`;

// ============= Unified Resend OTP =============
export const RESEND_OTP_MUTATION = `
  mutation ResendOtp($input: ResendOtpInput!) {
    resendOtp(input: $input)
  }
`;

// ============= Reset Password =============
export const FORGOT_PASSWORD_MUTATION = `
  mutation ForgotPassword($input: ForgotPasswordInput!) {
    forgotPassword(input: $input)
  }
`;

export const RESET_PASSWORD_MUTATION = `
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input)
  }
`;
