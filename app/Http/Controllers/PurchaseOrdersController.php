<?php

namespace App\Http\Controllers;

use App\Models\Audit;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use App\Models\PurchaseOrder;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\PurchaseOrdersExport;
use App\Imports\PurchaseOrdersImport;

class PurchaseOrdersController extends Controller
{
    public function index()
    {
        $purchaseOrders = PurchaseOrder::with('supplier', 'items.product.category')->get();
        $suppliers = Supplier::select('id', 'name')->get();
        $products = Product::select('id', 'name')->get();
        $warehouses = Warehouse::select('id', 'name')->get();
        return inertia('PurchaseOrdersManagement', [
            'purchaseOrders' => $purchaseOrders,
            'suppliers' => $suppliers,
            'products' => $products,
            'warehouses' => $warehouses,
        ]);
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
            'order_date' => 'required|date',
            'status' => 'required|in:draft,confirmed',
        ]);
        try {
            $product = Product::findOrFail($validated['product_id']);
            if (!$product->is_active) {
                return redirect()->back()->withErrors(['error' => 'Product is not active.']);
            }
            $supplier_id = $product->supplier_id;
            $purchaseOrder = PurchaseOrder::create([
                'supplier_id' => $supplier_id,
                'order_date' => $validated['order_date'],
                'status' => $validated['status'],
            ]);


            $purchaseOrder->items()->create([
                'purchase_order_id' => $purchaseOrder->id,
                'product_id' => $validated['product_id'],
                'quantity' => $validated['quantity'],
                'price' => $validated['price'],
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Failed to create Purchase Order: ' . $e->getMessage()]);
        }

        return redirect()->route('purchase-orders.index')->with('success', 'Purchase Order created successfully.');
    }
    public function update(Request $request, PurchaseOrder $purchaseOrder)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
            'order_date' => 'required|date',
            'status' => 'required|in:draft,confirmed',
        ]);

        try {
            $product = Product::findOrFail($validated['product_id']);
            if (!$product->is_active) {
                return redirect()->back()->withErrors(['error' => 'Product is not active.']);
            }
            $supplier_id = $product->supplier_id;
            $purchaseOrder->update([
                'supplier_id' => $supplier_id,
                'order_date' => $validated['order_date'],
                'status' => $validated['status'],
            ]);

            // Update or create the purchase order item
            $purchaseOrder->items()->update([
                'product_id' => $validated['product_id'],
                'quantity' => $validated['quantity'],
                'price' => $validated['price'],
            ]);
            return redirect()->route('purchase-orders.index')->with('success', 'Purchase Order updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Failed to update Purchase Order: ' . $e->getMessage()]);
        }
    }

    public function confirm(Request $request, PurchaseOrder $purchaseOrder)
    {

        $validated = $request->validate([
            'status' => 'required|in:completed,cancelled',
            'warehouse_id' => 'required_if:status,completed|exists:warehouses,id',
            'notes' => 'required_if:status,cancelled|nullable|string|max:255',
        ]);
        try {
            if ($validated['status'] === 'completed') {
                // Confirm the purchase order and update stock in the warehouse
                $purchaseOrder->status = 'completed';
                $purchaseOrder->save();

                foreach ($purchaseOrder->items as $item) {
                    $product = $item->product;
                    $warehouse = Warehouse::findOrFail($validated['warehouse_id']);
                    // Check if the product is active
                    if (!$product->is_active) {
                        return redirect()->back()->withErrors(['error' => 'Product is not active.']);
                    }
                    // Check if the warehouse exists
                    if (!$warehouse) {
                        return redirect()->back()->withErrors(['error' => 'Warehouse not found.']);
                    }
                    // Add stock to the warehouse
                    $warehouseProduct = $warehouse->products()->where('product_id', $product->id)->first();

                    if ($warehouseProduct) {
                        // Update existing stock
                        $warehouse->products()->updateExistingPivot($product->id, [
                            'stock' => $warehouseProduct->pivot->stock + $item->quantity,
                        ]);
                    } else {
                        // Attach new product with stock
                        $warehouse->products()->attach($product->id, [
                            'stock' => $item->quantity,
                        ]);
                    }
                    // Create a stock movement record
                    $warehouse->stockMovements()->create([
                        'product_id' => $product->id,
                        'movement_type' => 'in',
                        'quantity' => $item->quantity,
                        'notes' => "Stock added from Purchase Order #{$purchaseOrder->id}",
                        'movement_date' => now(),
                    ]);
                }
            } else {
                // Cancel the purchase order
                $purchaseOrder->status = 'cancelled';
                $purchaseOrder->notes = $validated['notes'];
                $purchaseOrder->save();
            }
            return redirect()->route('purchase-orders.index')->with('success', 'Purchase Order status updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Failed to update Purchase Order status: ' . $e->getMessage()]);
        }
    }

    public function startExport(Request $request)
    {
        $order = [
            "product",
            "category",
            "supplier",
            "price",
            "quantity",
            "status",
            "order_date",
        ];

        $inputFields = $request->input('fields', ['name']);

        $fields = array_values(array_intersect($order, $inputFields));
        $fileName = 'purchase-orders_' . now()->format('Ymd_His') . '.xlsx';

        Excel::queue(new PurchaseOrdersExport($fields), $fileName, 'public');
        Audit::create([
            'user_id' => Auth::id(),
            'event' => 'exported',
            'auditable_id' => "",
            'auditable_type' => PurchaseOrder::class,
            'old_values' => [],
            'new_values' => [],
            'url' => route('purchase-orders.export.start'),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'status' => 'queued',
            'file' => $fileName
        ]);
    }

    public function checkExportStatus($fileName)
    {
        $path = storage_path("app/public/{$fileName}");

        if (file_exists($path)) {
            return response()->json([
                'ready' => true,
                'url' => asset("storage/{$fileName}")
            ]);
        }

        return response()->json(['ready' => false]);
    }
    public function downloadAndDelete($fileName)
    {
        $path = storage_path("app/public/{$fileName}");

        if (!file_exists($path)) {
            abort(404);
        }

        return response()->download($path)->deleteFileAfterSend(true);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240',
        ]);

        try {
            // Queue import
            Excel::queueImport(new PurchaseOrdersImport, $request->file('file'));
            Audit::create([
                'user_id' => Auth::id(),
                'event' => 'imported',
                'auditable_id' => "",
                'auditable_type' => PurchaseOrder::class,
                'old_values' => [],
                'new_values' => [],
                'url' => route('purchase-orders.import'),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
            return response()->json([
                'status' => 'queued',
                'message' => 'Import has been queued successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Import failed: ' . $e->getMessage()
            ], 500);
        }
    }
    public function downloadTemplate()
    {
        return Excel::download(
            new \App\Exports\PurchaseOrdersImportTemplateExport,
            'purchase-orders_import_template.xlsx'
        );
    }
}
