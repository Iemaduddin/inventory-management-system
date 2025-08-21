<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use App\Models\Audit;
use App\Models\Product;
use App\Models\Category;
use App\Models\ProductWarehouse;
use App\Models\Supplier;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use App\Models\PurchaseOrder;
use App\Models\StockMovement;
use Illuminate\Support\Facades\DB;

class DashboardContoller extends Controller
{
    public function index()
    {
        $audits = Audit::with('user')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();
        $total_users = User::count();
        $total_suppliers = Supplier::count();
        $total_warehouses = Warehouse::count();
        $total_categories = Category::count();
        $total_products = Product::count();
        $purchase_order_status = PurchaseOrder::select('status', DB::raw('count(*) as total'))
            ->where('order_date', '>=', now()->subDays(30))
            ->groupBy('status')
            ->get();
        $stock_summary = StockMovement::select('movement_type', DB::raw('count(*) as total'))
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('movement_type')
            ->get();

        $low_stock_products = Product::with(['warehouses' => function ($query) {
            $query->where('stock', '<=', 20);
        }])
            ->whereHas('warehouses', function ($query) {
                $query->where('stock', '<=', 20);
            })
            ->get();

        $low_stock_summary = $low_stock_products->flatMap(function ($product) {
            return $product->warehouses->map(function ($warehouse) use ($product) {
                return [
                    'product_name' => $product->name,
                    'stock' => $warehouse->pivot->stock,
                    'warehouse' => $warehouse->name,
                ];
            });
        });

        $purchase_order_monthly = PurchaseOrder::select(
            DB::raw('MONTH(order_date) as month'),
            'status',
            DB::raw('count(*) as total')
        )
            ->whereYear('order_date', now()->year)
            ->groupBy('month', 'status')
            ->orderBy('month')
            ->get();


        return Inertia::render('Dashboard', [
            'audits' => $audits,
            'total_users' => $total_users,
            'total_suppliers' => $total_suppliers,
            'total_warehouses' => $total_warehouses,
            'total_categories' => $total_categories,
            'total_products' => $total_products,
            'purchase_order_status' => $purchase_order_status,
            'stock_summary' => $stock_summary,
            'low_stock_summary' => $low_stock_summary,
            'purchase_order_monthly' => $purchase_order_monthly,
        ]);
    }
}
