"use client";

import { useState, useEffect, useMemo } from "react";
import Container from "@/app/_components/container";
import {
    Store,
    TrendingUp,
    Target,
    Save,
    Calculator,
    Download,
    Upload,
    Plus,
    BarChart3,
    PieChart as PieChartIcon,
    Database,
    ArrowRight
} from "lucide-react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    type ChartOptions,
    type ChartData
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

// Constants from original app.js
const MARGIN_RATES = {
    lotto: 0.055,
    toto: 0.055,
    spitto: 0.10,
    annuity: 0.10
};

const DEFAULT_SETTINGS = {
    goalMonthlyProfit: 5000000,
    ratios: {
        lotto: 0.5,
        toto: 0.2,
        spitto: 0.2,
        annuity: 0.1
    }
};

interface DailyLog {
    date: string;
    sales: {
        lotto: number;
        toto: number;
        spitto: number;
        annuity: number;
    };
    profit: number;
}

interface AppData {
    settings: typeof DEFAULT_SETTINGS;
    dailyLogs: DailyLog[];
}

export default function LottoPage() {
    const [data, setData] = useState<AppData>({
        settings: DEFAULT_SETTINGS,
        dailyLogs: []
    });
    const [isLoaded, setIsLoaded] = useState(false);

    // Form states
    const [lottoSales, setLottoSales] = useState<string>("");
    const [totoSales, setTotoSales] = useState<string>("");
    const [spittoSales, setSpittoSales] = useState<string>("");
    const [annuitySales, setAnnuitySales] = useState<string>("");
    const [goalProfitInput, setGoalProfitInput] = useState<string>("5000000");

    // Simulation result state
    const [simulationResult, setSimulationResult] = useState<any>(null);

    // Load data from localStorage
    useEffect(() => {
        const stored = localStorage.getItem("lottoStoreData");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setData(parsed);
            } catch (e) {
                console.error("Failed to parse stored data", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save data to localStorage whenever it changes
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("lottoStoreData", JSON.stringify(data));
        }
    }, [data, isLoaded]);

    const getToday = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD

    const calculateProfit = (sales: DailyLog["sales"]) => {
        let totalProfit = 0;
        totalProfit += (sales.lotto || 0) * MARGIN_RATES.lotto;
        totalProfit += (sales.toto || 0) * MARGIN_RATES.toto;
        totalProfit += (sales.spitto || 0) * MARGIN_RATES.spitto;
        totalProfit += (sales.annuity || 0) * MARGIN_RATES.annuity;
        return Math.round(totalProfit);
    };

    const handleSaveSales = () => {
        const today = getToday();
        const sales = {
            lotto: parseInt(lottoSales) || 0,
            toto: parseInt(totoSales) || 0,
            spitto: parseInt(spittoSales) || 0,
            annuity: parseInt(annuitySales) || 0
        };

        const profit = calculateProfit(sales);
        const newLogs = [...data.dailyLogs];
        const existingIndex = newLogs.findIndex(log => log.date === today);

        if (existingIndex >= 0) {
            newLogs[existingIndex] = { date: today, sales, profit };
        } else {
            newLogs.push({ date: today, sales, profit });
        }

        setData(prev => ({ ...prev, dailyLogs: newLogs }));
        setLottoSales("");
        setTotoSales("");
        setSpittoSales("");
        setAnnuitySales("");
        alert("매출이 저장되었습니다!");
    };

    const calculateSimulation = () => {
        const goalProfit = parseInt(goalProfitInput) || data.settings.goalMonthlyProfit;
        const ratios = data.settings.ratios;

        const weightedMarginRate =
            (ratios.lotto * MARGIN_RATES.lotto) +
            (ratios.toto * MARGIN_RATES.toto) +
            (ratios.spitto * MARGIN_RATES.spitto) +
            (ratios.annuity * MARGIN_RATES.annuity);

        const requiredTotalSales = Math.round(goalProfit / weightedMarginRate);
        const weeklyTarget = Math.round(requiredTotalSales / 4.3);
        const dailyTarget = Math.round(weeklyTarget / 7);

        const productTargets = {
            lotto: Math.round(dailyTarget * ratios.lotto),
            toto: Math.round(dailyTarget * ratios.toto),
            spitto: Math.round(dailyTarget * ratios.spitto),
            annuity: Math.round(dailyTarget * ratios.annuity)
        };

        setSimulationResult({
            requiredTotalSales,
            weeklyTarget,
            dailyTarget,
            weightedMarginRate,
            productTargets
        });
    };

    const exportData = () => {
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `lotto-store-data-${getToday()}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target?.result as string);
                setData(importedData);
                alert("데이터가 성공적으로 복원되었습니다!");
            } catch (error) {
                alert("파일 형식이 올바르지 않습니다.");
            }
        };
        reader.readAsText(file);
    };

    // Dashboard calculations
    const todayProfit = useMemo(() => {
        const today = getToday();
        const todayData = data.dailyLogs.find(log => log.date === today);
        return todayData ? todayData.profit : 0;
    }, [data.dailyLogs]);

    const monthlyProfit = useMemo(() => {
        const currentMonth = getToday().substring(0, 7);
        return data.dailyLogs
            .filter(log => log.date.startsWith(currentMonth))
            .reduce((sum, log) => sum + log.profit, 0);
    }, [data.dailyLogs]);

    const goalAchievement = useMemo(() => {
        return data.settings.goalMonthlyProfit > 0
            ? Math.round((monthlyProfit / data.settings.goalMonthlyProfit) * 100)
            : 0;
    }, [monthlyProfit, data.settings.goalMonthlyProfit]);

    // Chart data
    const monthlyChartData: ChartData<"line"> = useMemo(() => {
        const monthlyProfits: Record<string, number> = {};
        data.dailyLogs.forEach(log => {
            const month = log.date.substring(0, 7);
            monthlyProfits[month] = (monthlyProfits[month] || 0) + log.profit;
        });

        const sortedMonths = Object.keys(monthlyProfits).sort();
        return {
            labels: sortedMonths,
            datasets: [
                {
                    label: "월별 순수익",
                    data: sortedMonths.map(month => monthlyProfits[month]),
                    borderColor: "rgb(59, 130, 246)",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    tension: 0.1,
                    fill: true
                }
            ]
        };
    }, [data.dailyLogs]);

    const productChartData: ChartData<"doughnut"> = useMemo(() => {
        const productSales = { lotto: 0, spitto: 0, annuity: 0 };
        data.dailyLogs.forEach(log => {
            productSales.lotto += (log.sales.lotto || 0) + (log.sales.toto || 0);
            productSales.spitto += log.sales.spitto || 0;
            productSales.annuity += log.sales.annuity || 0;
        });

        return {
            labels: ["로또/토토", "스피또", "연금복권"],
            datasets: [
                {
                    data: [productSales.lotto, productSales.spitto, productSales.annuity],
                    backgroundColor: [
                        "rgb(59, 130, 246)",
                        "rgb(16, 185, 129)",
                        "rgb(139, 92, 246)"
                    ],
                    borderWidth: 0
                }
            ]
        };
    }, [data.dailyLogs]);

    const commonChartOptions: ChartOptions<any> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: "currentColor"
                }
            }
        }
    };

    if (!isLoaded) return null;

    return (
        <Container>
            <div className="py-8 max-w-5xl mx-auto">
                {/* Header */}
                <header className="mb-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <Store className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            로또 가맹점 수익 관리
                        </h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 ml-13">
                        복권 판매점 운영자를 위한 스마트 수익 관리 시스템
                    </p>
                </header>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-all hover:shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">오늘 예상 순수익</p>
                            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-full">
                                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            ₩{todayProfit.toLocaleString()}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-all hover:shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">이번 달 누적 수익</p>
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            ₩{monthlyProfit.toLocaleString()}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-all hover:shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">목표 달성률</p>
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-full">
                                <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                        <div className="flex items-end gap-2">
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">{goalAchievement}%</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                / {data.settings.goalMonthlyProfit.toLocaleString()}
                            </p>
                        </div>
                        <div className="mt-4 w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2">
                            <div
                                className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(goalAchievement, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Input Section */}
                <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-8 mb-10">
                    <div className="flex items-center gap-2 mb-6">
                        <Plus className="w-5 h-5 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">오늘의 매출 입력</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: "로또", state: lottoSales, setter: setLottoSales, color: "focus:ring-blue-500" },
                            { label: "토토", state: totoSales, setter: setTotoSales, color: "focus:ring-blue-500" },
                            { label: "스피또", state: spittoSales, setter: setSpittoSales, color: "focus:ring-green-500" },
                            { label: "연금복권", state: annuitySales, setter: setAnnuitySales, color: "focus:ring-purple-500" },
                        ].map((field) => (
                            <div key={field.label}>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    {field.label}
                                </label>
                                <input
                                    type="number"
                                    value={field.state}
                                    onChange={(e) => field.setter(e.target.value)}
                                    placeholder="0"
                                    className={`w-full px-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 ${field.color} dark:text-white transition-all`}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={handleSaveSales}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20"
                        >
                            <Save className="w-5 h-5" />
                            매출 데이터 저장
                        </button>
                    </div>
                </section>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-8">
                        <div className="flex items-center gap-2 mb-6">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">월별 수익 추이</h2>
                        </div>
                        <div className="h-[300px]">
                            <Line
                                data={monthlyChartData}
                                options={{
                                    ...commonChartOptions,
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            ticks: {
                                                callback: (value: any) => `₩${value.toLocaleString()}`,
                                                color: "inherit"
                                            },
                                            grid: { color: "rgba(156, 163, 175, 0.1)" }
                                        },
                                        x: {
                                            ticks: { color: "inherit" },
                                            grid: { display: false }
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-8">
                        <div className="flex items-center gap-2 mb-6">
                            <PieChartIcon className="w-5 h-5 text-green-600" />
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">상품별 매출 비중</h2>
                        </div>
                        <div className="h-[300px] flex items-center justify-center">
                            <Doughnut
                                data={productChartData}
                                options={{
                                    ...commonChartOptions,
                                    cutout: "70%",
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Simulation Section */}
                <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-8 mb-10">
                    <div className="flex items-center gap-2 mb-6">
                        <Calculator className="w-5 h-5 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">목표 수익 시뮬레이션</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                월 목표 순수익 설정
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">₩</span>
                                <input
                                    type="number"
                                    value={goalProfitInput}
                                    onChange={(e) => setGoalProfitInput(e.target.value)}
                                    placeholder="5000000"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white font-bold text-xl transition-all"
                                />
                            </div>
                        </div>
                        <button
                            onClick={calculateSimulation}
                            className="bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg"
                        >
                            시뮬레이션 돌리기
                        </button>
                    </div>

                    {simulationResult && (
                        <div className="mt-10 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                {[
                                    { label: "필요 총 매출", value: `₩${simulationResult.requiredTotalSales.toLocaleString()}`, color: "text-blue-600" },
                                    { label: "주간 목표", value: `₩${simulationResult.weeklyTarget.toLocaleString()}`, color: "text-green-600" },
                                    { label: "일일 목표", value: `₩${simulationResult.dailyTarget.toLocaleString()}`, color: "text-purple-600" },
                                    { label: "평균 마진율", value: `${(simulationResult.weightedMarginRate * 100).toFixed(1)}%`, color: "text-orange-600" },
                                ].map((item) => (
                                    <div key={item.label} className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700 text-center">
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{item.label}</p>
                                        <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                                <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-4 flex items-center gap-2">
                                    <ArrowRight className="w-4 h-4" />
                                    상품별 일일 판매 목표
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { label: "로또", value: simulationResult.productTargets.lotto },
                                        { label: "토토", value: simulationResult.productTargets.toto },
                                        { label: "스피또", value: simulationResult.productTargets.spitto },
                                        { label: "연금복권", value: simulationResult.productTargets.annuity },
                                    ].map((target) => (
                                        <div key={target.label} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-blue-50 dark:border-slate-700">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{target.label}</p>
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                ₩{target.value.toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* Data Management Section */}
                <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-8">
                    <div className="flex items-center gap-2 mb-6">
                        <Database className="w-5 h-5 text-gray-600" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">데이터 관리</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={exportData}
                            className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-900 dark:text-white px-6 py-3 rounded-xl font-bold transition-all"
                        >
                            <Download className="w-5 h-5" />
                            데이터 내보내기 (JSON)
                        </button>
                        <label className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-900 dark:text-white px-6 py-3 rounded-xl font-bold transition-all cursor-pointer">
                            <Upload className="w-5 h-5" />
                            데이터 가져오기
                            <input type="file" accept=".json" onChange={importData} className="hidden" />
                        </label>
                    </div>
                </section>
            </div>
        </Container>
    );
}
