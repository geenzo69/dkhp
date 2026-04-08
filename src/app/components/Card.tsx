export default function Card({ title, icon: Icon, children, color = "blue", actions }: {
    title: string;
    icon: any;
    children: any;
    color?: string;
    actions?: any
}) {
    return (
        <div className="bg-white rounded shadow-md overflow-hidden mb-6 border-t-4" style={{ borderTopColor: color === 'blue' ? '#3f6ad8' : color }}>
            <div className="px-6 py-4 border-b flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded text-white`} style={{ backgroundColor: color === 'blue' ? '#3f6ad8' : color }}>
                        <Icon size={18} />
                    </div>
                    <h3 className="font-bold text-slate-700 uppercase text-sm tracking-wider">{title}</h3>
                </div>
                {actions}
            </div>
            <div className="p-0">
                {children}
            </div>
        </div>
    );
}