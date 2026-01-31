import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Filler } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    ArcElement, Tooltip, Legend, CategoryScale, LinearScale,
    BarElement, PointElement, LineElement, Title, Filler
);

// Types for chart data
interface CategoryChartData {
    category: string;
    total: number;
    icon: string;
}

interface DailyTotals {
    date: string;
    income: number;
    expense: number;
    balance: number;
}

interface BudgetChartData {
    expense_by_category: CategoryChartData[];
    income_by_category: CategoryChartData[];
    daily_totals: DailyTotals[];
    total_income: number;
    total_expense: number;
}

interface BudgetChartsProps {
    data: BudgetChartData;
}

// Color palette for charts
const CHART_COLORS = [
    'rgba(139, 92, 246, 0.8)',   // Purple
    'rgba(59, 130, 246, 0.8)',   // Blue
    'rgba(16, 185, 129, 0.8)',   // Green
    'rgba(245, 158, 11, 0.8)',   // Amber
    'rgba(239, 68, 68, 0.8)',    // Red
    'rgba(236, 72, 153, 0.8)',   // Pink
    'rgba(14, 165, 233, 0.8)',   // Sky
    'rgba(168, 85, 247, 0.8)',   // Violet
    'rgba(34, 197, 94, 0.8)',    // Emerald
    'rgba(251, 146, 60, 0.8)',   // Orange
];

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: {
                color: 'rgba(255, 255, 255, 0.8)',
                font: { size: 12 }
            }
        },
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1
        }
    },
    scales: {
        x: {
            ticks: { color: 'rgba(255, 255, 255, 0.6)' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
        },
        y: {
            ticks: { color: 'rgba(255, 255, 255, 0.6)' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
        }
    }
};

const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom' as const,
            labels: {
                color: 'rgba(255, 255, 255, 0.8)',
                font: { size: 11 },
                padding: 15
            }
        },
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            callbacks: {
                label: function (context: any) {
                    const value = context.raw || 0;
                    return ` ${value.toLocaleString('ru-RU')} ₽`;
                }
            }
        }
    }
};

export default function BudgetCharts({ data }: BudgetChartsProps) {
    // Pie chart: Expense by category
    const expensePieData = {
        labels: data.expense_by_category.map(c => `${c.icon} ${c.category}`),
        datasets: [{
            data: data.expense_by_category.map(c => c.total),
            backgroundColor: CHART_COLORS,
            borderColor: 'rgba(0, 0, 0, 0.3)',
            borderWidth: 2
        }]
    };

    // Bar chart: Income vs Expense comparison (last 7 days)
    const last7Days = data.daily_totals.slice(-7);
    const barData = {
        labels: last7Days.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
        }),
        datasets: [
            {
                label: '📈 Доходы',
                data: last7Days.map(d => d.income),
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 1,
                borderRadius: 4
            },
            {
                label: '📉 Расходы',
                data: last7Days.map(d => d.expense),
                backgroundColor: 'rgba(239, 68, 68, 0.7)',
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 1,
                borderRadius: 4
            }
        ]
    };

    // Line chart: Balance trend
    const lineData = {
        labels: data.daily_totals.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
        }),
        datasets: [{
            label: '💵 Баланс',
            data: data.daily_totals.map(d => d.balance),
            borderColor: 'rgba(139, 92, 246, 1)',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: 'rgba(139, 92, 246, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4
        }]
    };

    const hasExpenseData = data.expense_by_category.length > 0;
    const hasDailyData = data.daily_totals.length > 0;

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="stat-card">
                    <div className="text-sm mb-1" style={{ color: 'var(--foreground-muted)' }}>
                        📈 Всего доходов
                    </div>
                    <div className="text-2xl font-bold profit">
                        +{data.total_income.toLocaleString('ru-RU')} ₽
                    </div>
                </div>
                <div className="stat-card">
                    <div className="text-sm mb-1" style={{ color: 'var(--foreground-muted)' }}>
                        📉 Всего расходов
                    </div>
                    <div className="text-2xl font-bold loss">
                        -{data.total_expense.toLocaleString('ru-RU')} ₽
                    </div>
                </div>
            </div>

            {/* Charts grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Expense Pie Chart */}
                <div className="card p-6">
                    <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
                        🥧 Расходы по категориям
                    </h3>
                    <div style={{ height: '280px' }}>
                        {hasExpenseData ? (
                            <Pie data={expensePieData} options={pieOptions} />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p style={{ color: 'var(--foreground-muted)' }}>Нет данных о расходах</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Income vs Expense Bar Chart */}
                <div className="card p-6">
                    <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
                        📊 Доходы vs Расходы (последние 7 дней)
                    </h3>
                    <div style={{ height: '280px' }}>
                        {hasDailyData ? (
                            <Bar data={barData} options={chartOptions} />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p style={{ color: 'var(--foreground-muted)' }}>Нет данных за период</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Balance Line Chart - full width */}
            <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
                    📈 Тренд баланса
                </h3>
                <div style={{ height: '300px' }}>
                    {hasDailyData ? (
                        <Line data={lineData} options={chartOptions} />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p style={{ color: 'var(--foreground-muted)' }}>Нет данных для графика</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export type { BudgetChartData, CategoryChartData, DailyTotals };
