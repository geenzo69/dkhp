import MainContainer from "@/components/MainContainer";

export default async function Home() {
    return (
        <div className="flex flex-1">
            <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
                <MainContainer />
            </main>
        </div>
    );
}
