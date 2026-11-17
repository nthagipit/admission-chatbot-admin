/* eslint-disable @typescript-eslint/no-explicit-any */
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import {
  AlertCircle,
  Bot,
  Eye,
  EyeOff,
  FileText,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import authApi from "@/apis/auth.api";
import type { ErrorResponse } from "@/types/utils.type";
import { schema, type Schema } from "@/utils/rules";
import { isAxiosUnprocessableEntityError } from "@/utils/utils";
import { setAccessToken } from "@/utils/http";
import { useAuth } from "@/hooks/useAuth";

type FormData = Pick<Schema, "email" | "password">;

const loginSchema = schema.pick(["email", "password"]);

const TEXT_DISPLAY =
  "text-[clamp(2.25rem,1.3rem+2.4vw,3.5rem)] leading-[1.08] tracking-[-0.03em]";
const TEXT_TITLE =
  "text-[clamp(1.5rem,1.25rem+0.7vw,1.875rem)] leading-tight tracking-[-0.02em]";

const inputBase =
  "h-11 w-full rounded-control border bg-surface pl-10 text-base sm:text-sm text-ink placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-4 focus:ring-primary-500/10";

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-10 items-center justify-center rounded-control bg-primary-600 text-white shadow-card">
        <GraduationCap className="size-5" />
      </span>
      <div className="leading-tight">
        <p className="text-base font-semibold text-ink">Admission AI</p>
        <p className="text-xs text-ink-muted">Administration</p>
      </div>
    </div>
  );
}

function ChatMotif() {
  return (
    <div className="mt-12 w-full max-w-sm space-y-3" aria-hidden>
      <div className="flex justify-end">
        <div className="w-3/5 space-y-2 rounded-card rounded-tr-sm bg-primary-600 p-4 shadow-card">
          <span className="block h-2 w-full rounded-full bg-white/70" />
          <span className="block h-2 w-2/3 rounded-full bg-white/70" />
        </div>
      </div>
      <div className="flex items-start gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface text-primary-600 shadow-card">
          <Bot className="size-4" />
        </span>
        <div className="w-4/5 space-y-2 rounded-card rounded-tl-sm border border-primary-100 bg-surface p-4 shadow-card">
          <span className="block h-2 w-full rounded-full bg-slate-200" />
          <span className="block h-2 w-full rounded-full bg-slate-200" />
          <span className="block h-2 w-1/2 rounded-full bg-slate-200" />
          <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-2.5 py-1">
            <FileText className="size-3 text-primary-600" />
            <span className="h-1.5 w-16 rounded-full bg-primary-100" />
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setIsAuthenticated } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({ resolver: yupResolver(loginSchema) });

  const loginMutation = useMutation({
    mutationFn: (body: FormData) => authApi.login(body),
  });

  const onSubmit = handleSubmit((values) => {
    setServerError(null);
    loginMutation.mutate(values, {
      onSuccess: (response) => {
        const token =
          (response.data as any)?.data?.access_token ||
          (response.data as any)?.access_token;
        if (token) {
          setAccessToken(token);
        }
        setIsAuthenticated(true);
        const from = (location.state as { from?: { pathname: string } } | null)
          ?.from?.pathname;
        navigate(from?.startsWith("/admin") ? from : "/admin", {
          replace: true,
        });
      },
      onError: (error) => {
        if (isAxiosUnprocessableEntityError<ErrorResponse<FormData>>(error)) {
          const formError = error.response?.data.data;
          if (formError) {
            Object.keys(formError).forEach((key) =>
              setError(key as keyof FormData, {
                message: formError[key as keyof FormData],
                type: "Server",
              }),
            );
            return;
          }
        }
        if (isAxiosError(error) && error.response?.status === 401) {
          setServerError("Incorrect email or password.");
        } else if (isAxiosError(error) && !error.response) {
          setServerError(
            "Cannot reach the server. Check your connection and try again.",
          );
        } else {
          setServerError("Something went wrong. Try again in a moment.");
        }
      },
    });
  });

  const pending = loginMutation.isPending;

  return (
    <main className="grid min-h-screen bg-surface lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-primary-50 p-12 lg:flex xl:p-16">
        <Brand />

        <div>
          <h2
            className={`max-w-lg font-semibold text-balance text-ink ${TEXT_DISPLAY}`}
          >
            Admission <br /> Chatbot
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-ink-muted">
            Instant, accurate admission advice for every student, grounded in
            your university’s own documents.
          </p>
          <ChatMotif />
        </div>

        <p className="text-xs text-ink-muted">
          © {new Date().getFullYear()} Admission AI
        </p>
      </section>

      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-10 lg:hidden">
            <Brand />
          </div>

          <h1 className={`font-semibold text-ink ${TEXT_TITLE}`}>Log in</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Use your administrator account to manage the chatbot.
          </p>

          <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-ink">
                Email
              </label>
              <div className="relative mt-3">
                <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder="admin@university.edu.vn"
                  aria-invalid={!!errors.email}
                  className={`${inputBase} pr-3 ${
                    errors.email
                      ? "border-danger focus:border-danger focus:ring-danger/10"
                      : "border-line hover:border-slate-300 focus:border-primary-500"
                  }`}
                  {...register("email")}
                />
              </div>
              {errors.email?.message && (
                <p className="text-xs text-danger">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-ink"
              >
                Password
              </label>
              <div className="relative mt-3">
                <Lock className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  aria-invalid={!!errors.password}
                  className={`${inputBase} pr-11 ${
                    errors.password
                      ? "border-danger focus:border-danger focus:ring-danger/10"
                      : "border-line hover:border-slate-300 focus:border-primary-500"
                  }`}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-control text-slate-400 transition-colors hover:bg-slate-100 hover:text-ink"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {errors.password?.message && (
                <p className="text-xs text-danger">{errors.password.message}</p>
              )}
            </div>

            {serverError && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-control border border-red-200 bg-danger-soft px-3.5 py-3 text-sm text-red-800"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-control bg-primary-600 text-sm font-medium text-white shadow-card transition-colors hover:bg-primary-700 focus-visible:ring-4 focus-visible:ring-primary-500/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending && (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              )}
              {pending ? "Logging in…" : "Log in"}
            </button>
          </form>

          <p className="mt-8 flex items-center justify-center gap-1.5 text-center text-xs leading-relaxed text-ink-muted">
            <ShieldCheck className="size-3.5 shrink-0" />
            Restricted to administrators.
          </p>
        </div>
      </section>
    </main>
  );
}
