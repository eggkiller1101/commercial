type LoadingStateProps = {
  text: string;
};

export function LoadingState({ text }: LoadingStateProps) {
  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center">
      <div className="rounded-md border bg-card px-5 py-4 text-sm text-muted-foreground">
        {text}
      </div>
    </div>
  );
}
