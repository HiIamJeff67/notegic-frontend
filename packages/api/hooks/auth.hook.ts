import type {
  DeleteMeRequest,
  ForgetPasswordRequest,
  LoginRequest,
  LoginViaDiscordRequest,
  LoginViaGithubRequest,
  LoginViaGoogleRequest,
  LoginViaXRequest,
  LogoutRequest,
  RegisterRequest,
  RegisterViaDiscordRequest,
  RegisterViaGithubRequest,
  RegisterViaGoogleRequest,
  RegisterViaXRequest,
  ResetEmailRequest,
  ResetMeRequest,
  SendAuthCodeRequest,
  ValidateEmailRequest,
} from "@shared/api/interfaces/auth.interface";
import {
  mutationFnDeleteMe,
  mutationFnForgetPassword,
  mutationFnLogin,
  mutationFnLoginViaDiscord,
  mutationFnLoginViaGithub,
  mutationFnLoginViaGoogle,
  mutationFnLoginViaX,
  mutationFnLogout,
  mutationFnRegister,
  mutationFnRegisterViaDiscord,
  mutationFnRegisterViaGithub,
  mutationFnRegisterViaGoogle,
  mutationFnRegisterViaX,
  mutationFnResetEmail,
  mutationFnResetMe,
  mutationFnSendAuthCode,
  mutationFnValidateEmail,
} from "@shared/api/invokers/auth.invoker";
import { useMutation } from "@tanstack/react-query";

export const useRegister = (func: Parameters<typeof mutationFnRegister>[1]) =>
  useMutation({
    mutationFn: (request: RegisterRequest) => mutationFnRegister(request, func),
  });

export const useRegisterViaGoogle = (
  func: Parameters<typeof mutationFnRegisterViaGoogle>[1]
) =>
  useMutation({
    mutationFn: (request: RegisterViaGoogleRequest) =>
      mutationFnRegisterViaGoogle(request, func),
  });

export const useRegisterViaGithub = (
  func: Parameters<typeof mutationFnRegisterViaGithub>[1]
) =>
  useMutation({
    mutationFn: (request: RegisterViaGithubRequest) =>
      mutationFnRegisterViaGithub(request, func),
  });

export const useRegisterViaX = (
  func: Parameters<typeof mutationFnRegisterViaX>[1]
) =>
  useMutation({
    mutationFn: (request: RegisterViaXRequest) =>
      mutationFnRegisterViaX(request, func),
  });

export const useRegisterViaDiscord = (
  func: Parameters<typeof mutationFnRegisterViaDiscord>[1]
) =>
  useMutation({
    mutationFn: (request: RegisterViaDiscordRequest) =>
      mutationFnRegisterViaDiscord(request, func),
  });

export const useLogin = (func: Parameters<typeof mutationFnLogin>[1]) =>
  useMutation({
    mutationFn: (request: LoginRequest) => mutationFnLogin(request, func),
  });

export const useLoginViaGoogle = (
  func: Parameters<typeof mutationFnLoginViaGoogle>[1]
) =>
  useMutation({
    mutationFn: (request: LoginViaGoogleRequest) =>
      mutationFnLoginViaGoogle(request, func),
  });

export const useLoginViaGithub = (
  func: Parameters<typeof mutationFnLoginViaGithub>[1]
) =>
  useMutation({
    mutationFn: (request: LoginViaGithubRequest) =>
      mutationFnLoginViaGithub(request, func),
  });

export const useLoginViaX = (func: Parameters<typeof mutationFnLoginViaX>[1]) =>
  useMutation({
    mutationFn: (request: LoginViaXRequest) =>
      mutationFnLoginViaX(request, func),
  });

export const useLoginViaDiscord = (
  func: Parameters<typeof mutationFnLoginViaDiscord>[1]
) =>
  useMutation({
    mutationFn: (request: LoginViaDiscordRequest) =>
      mutationFnLoginViaDiscord(request, func),
  });

export const useLogout = (func: Parameters<typeof mutationFnLogout>[1]) =>
  useMutation({
    mutationFn: (request: LogoutRequest) => mutationFnLogout(request, func),
  });

export const useSendAuthCode = (
  func: Parameters<typeof mutationFnSendAuthCode>[1]
) =>
  useMutation({
    mutationFn: (request: SendAuthCodeRequest) =>
      mutationFnSendAuthCode(request, func),
  });

export const useValidateEmail = (
  func: Parameters<typeof mutationFnValidateEmail>[1]
) =>
  useMutation({
    mutationFn: (request: ValidateEmailRequest) =>
      mutationFnValidateEmail(request, func),
  });

export const useResetEmail = (
  func: Parameters<typeof mutationFnResetEmail>[1]
) =>
  useMutation({
    mutationFn: (request: ResetEmailRequest) =>
      mutationFnResetEmail(request, func),
  });

export const useForgetPassword = (
  func: Parameters<typeof mutationFnForgetPassword>[1]
) =>
  useMutation({
    mutationFn: (request: ForgetPasswordRequest) =>
      mutationFnForgetPassword(request, func),
  });

export const useResetMe = (func: Parameters<typeof mutationFnResetMe>[1]) =>
  useMutation({
    mutationFn: (request: ResetMeRequest) => mutationFnResetMe(request, func),
  });

export const useDeleteMe = (func: Parameters<typeof mutationFnDeleteMe>[1]) =>
  useMutation({
    mutationFn: (request: DeleteMeRequest) => mutationFnDeleteMe(request, func),
  });
