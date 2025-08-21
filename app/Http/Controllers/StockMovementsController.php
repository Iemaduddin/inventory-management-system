<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StockMovement;
use App\Models\Warehouse;
use Illuminate\Http\Request;

class StockMovementsController extends Controller
{
    public function index()
    {
        $stockMovements = StockMovement::with(['product', 'warehouse'])->get();
        $warehouses = Warehouse::with('products')->select('id', 'name')->get();
        return inertia(
            'StockMovements/Index',
            [
                'stockMovements' => $stockMovements,
                'warehouses' => $warehouses,
                'products' => [],
            ]
        );
    }

    public function products(Request $request, Warehouse $warehouse)
    {
        // Ambil produk yang terkait lewat relasi pivot, sertakan pivot stock jika perlu
        $products = $warehouse->products()
            ->select('products.id', 'products.name')
            ->get()
            ->map(function ($p) {
                return [
                    'id' => (string) $p->id,
                    'name' => $p->name,
                ];
            });

        // Kembalikan JSON jika diminta (fetch dengan header Accept: application/json)
        if ($request->wantsJson()) {
            return response()->json($products);
        }
    }
    public function adjustStock(Request $request,)
    {
        $validated = $request->validate([
            'warehouse_id' => 'required|exists:warehouses,id',
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'movement_type' => 'required|in:in,out',
            'movement_reason' => 'required|in:sale,damage,adjustment',
            'notes' => 'string|max:255',
        ]);
        // Set the movement date to now
        $validated['movement_date'] = now();
        $product = Product::findOrFail($validated['product_id']);

        if (!$product->warehouses()->where('warehouse_id', $validated['warehouse_id'])->exists()) {
            return redirect()->back()->withErrors(['product_id' => 'Product not found in the selected warehouse.']);
        }
        try {

            $warehouseStock = $product->warehouses()
                ->where('warehouse_id', $validated['warehouse_id'])
                ->value('stock');
            if ($validated['movement_type'] === 'out') {
                // Check if the product has enough stock
                if ($warehouseStock < $validated['quantity']) {
                    return redirect()->back()->withErrors([
                        'quantity' => 'Not enough stock available in this warehouse.'
                    ]);
                }
                // Decrease stock for 'out' movements
                $product->warehouses()
                    ->where('warehouse_id', $validated['warehouse_id'])
                    ->decrement('stock', $validated['quantity']);
            } else {
                // Increase stock for 'in' movements
                $product->warehouses()
                    ->where('warehouse_id', $validated['warehouse_id'])
                    ->increment('stock', $validated['quantity']);
            }

            StockMovement::create($validated);

            return redirect()->route('stock-movements.index')->with('success', 'Stock adjusted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Failed to adjust stock: ' . $e->getMessage()]);
        }
    }
    public function transferStock(Request $request)
    {
        $validated = $request->validate([
            'current_warehouse_id' => 'required|exists:warehouses,id',
            'destination_warehouse_id' => 'required|exists:warehouses,id',
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'notes' => 'string|max:255',
        ]);
        // Set the movement date to now
        $validated['movement_date'] = now();
        $product = Product::findOrFail($validated['product_id']);
        if (!$product->warehouses()->where('warehouse_id', $validated['current_warehouse_id'])->exists()) {
            return redirect()->back()->withErrors(['product_id' => 'Product not found in the current warehouse.']);
        }
        try {
            $currentWarehouseStock = $product->warehouses()
                ->where('warehouse_id', $validated['current_warehouse_id'])
                ->value('stock');

            // Check if the product has enough stock in the current warehouse
            if ($currentWarehouseStock < $validated['quantity']) {
                return redirect()->back()->withErrors([
                    'quantity' => 'Not enough stock available in the current warehouse.'
                ]);
            }

            // Decrease stock in the current warehouse
            $product->warehouses()
                ->where('warehouse_id', $validated['current_warehouse_id'])
                ->decrement('stock', $validated['quantity']);

            // Increase stock in the destination warehouse
            $product->warehouses()
                ->where('warehouse_id', $validated['destination_warehouse_id'])
                ->increment('stock', $validated['quantity']);


            // If the stock in the current warehouse is now zero, remove the product from that warehouse
            if ($currentWarehouseStock - $validated['quantity'] <= 0) {
                $product->warehouses()->detach($validated['current_warehouse_id']);
            }
            // Create stock movement record for the transfer
            StockMovement::create([
                'product_id' => $validated['product_id'],
                'warehouse_id' => $validated['current_warehouse_id'],
                'movement_type' => 'out',
                'movement_reason' => 'transfer',
                'quantity' => -$validated['quantity'],
                'notes' => $validated['notes'],
                'movement_date' => now(),
            ]);

            StockMovement::create([
                'product_id' => $validated['product_id'],
                'warehouse_id' => $validated['destination_warehouse_id'],
                'movement_type' => 'in',
                'movement_reason' => 'transfer',
                'quantity' => $validated['quantity'],
                'notes' => $validated['notes'],
                'movement_date' => now(),
            ]);

            return redirect()->route('stock-movements.index')->with('success', 'Stock transferred successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Failed to transfer stock: ' . $e->getMessage()]);
        }
    }
}