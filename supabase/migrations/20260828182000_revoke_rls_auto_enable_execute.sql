-- Event-trigger helper is not a public API.
revoke all on function public.rls_auto_enable() from public, anon, authenticated;
