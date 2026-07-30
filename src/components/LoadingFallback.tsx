export default function LoadingFallback() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#f1f4f6]">
            <img
                src="/logo.png"
                alt="Loading"
                width={128}
                height={128}
                className="animate-logo-scale"
            />
        </main>
    );
}
