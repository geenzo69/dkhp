export default function Card({ title, icon: Icon, children, color = "blue", actions }: {
    title: string;
    icon: any;
    children: any;
    color?: string;
    actions?: any
}) {
    return (
        <div className="mc-panel mb-6">
            <div className="px-6 py-4 border-b-2 border-black flex items-center justify-between bg-mc-stone-dark">
                <div className="flex items-center gap-3">
                    <div className={`p-2 text-white bg-black/20`}>
                        <Icon size={18} />
                    </div>
                    <h3 className="font-minecraft text-white uppercase text-[10px] mc-text-shadow">{title}</h3>
                </div>
                {actions}
            </div>
            <div className="p-0 bg-mc-stone">
                {children}
            </div>
        </div>
    );
}