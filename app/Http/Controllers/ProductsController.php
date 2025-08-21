<?php

namespace App\Http\Controllers;

use App\Models\Audit;
use App\Models\Product;
use App\Models\Category;
use App\Models\Supplier;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use App\Models\StockMovement;
use App\Exports\ProductsExport;
use App\Imports\ProductsImport;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;

class ProductsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $products = Product::with('category', 'supplier', 'warehouses', 'stockMovements')->get();
        $categories = Category::all()->map(function ($category) {
            return [
                'id' => $category->id,
                'name' => $category->name,
            ];
        });
        $suppliers = Supplier::where('is_active', true)
            ->get()
            ->map(function ($supplier) {
                return [
                    'id' => $supplier->id,
                    'name' => $supplier->name,
                ];
            });
        $warehouses = Warehouse::where('is_active', true)
            ->get()
            ->map(function ($warehouse) {
                return [
                    'id' => $warehouse->id,
                    'name' => $warehouse->name,
                ];
            });

        return inertia('Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'suppliers' => $suppliers,
            'warehouses' => $warehouses,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'supplier_id' => 'required|exists:suppliers,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'specifications' => 'nullable',
            'is_active' => 'boolean',
        ]);

        try {
            // Handle file upload if a document is provided
            if ($request->hasFile('manual_pdf')) {
                $request->validate([
                    'manual_pdf' => 'file|mimes:pdf|between:100,500',
                ]);
                $documentName = $request->name . '-' . time();
                $documentPath = $request->file('manual_pdf')->storeAs(
                    'Documents/Products',
                    $documentName . '.' . $request->file('manual_pdf')->getClientOriginalExtension(),
                    'public'
                );
                $validated['manual_pdf'] = $documentPath;
            } else {
                $validated['manual_pdf'] = null;
            }

            $warehouseId = $validated['warehouse_id'];
            $stock = $validated['stock'];

            unset($validated['warehouse_id'], $validated['stock']);

            // Create the product
            $product = Product::create($validated);
            // Insert or update stock in pivot
            $product->warehouses()->syncWithoutDetaching([
                $warehouseId => ['stock' => $stock]
            ]);
            // Handle stock movement
            StockMovement::create([
                'product_id' => $product->id,
                'warehouse_id' => $warehouseId,
                'movement_type' => 'in',
                'movement_reason' => 'adjustment',
                'quantity' => $stock,
                'notes' => 'Initial stock for product creation',
                'movement_date' => now(),
            ]);
            return redirect()->back()->with('success', 'Product created/updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to create product: ' . $e->getMessage());
        }
    }

    public function storeExistingProductToWarehouse(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'stock' => 'required|integer|min:0',
        ]);

        try {
            $product = Product::findOrFail($validated['product_id']);
            $warehouseId = $validated['warehouse_id'];
            $stock = $validated['stock'];

            // Check if the product is already associated with the warehouse
            if ($product->warehouses()->where('warehouse_id', $warehouseId)->exists()) {
                // Update the stock in the pivot table
                $currentStock = $product->warehouses()->where('warehouse_id', $warehouseId)->value('stock');
                $newStock = $currentStock + $stock;
                $product->warehouses()->updateExistingPivot($warehouseId, ['stock' => $newStock]);
            } else {
                // Attach the product to the warehouse with the initial stock
                $product->warehouses()->attach($warehouseId, ['stock' => $stock]);
            }
            // Handle stock movement
            StockMovement::create([
                'product_id' => $product->id,
                'warehouse_id' => $warehouseId,
                'movement_type' => 'in',
                'movement_reason' => 'adjustment',
                'quantity' => $stock,
                'notes' => 'Initial stock for product creation',
                'movement_date' => now(),
            ]);
            return redirect()->back()->with('success', 'Product added to warehouse successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to add product to warehouse: ' . $e->getMessage());
        }
    }


    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'supplier_id' => 'required|exists:suppliers,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'specifications' => 'nullable',
            'is_active' => 'boolean',
        ]);
        try {
            // Handle file upload if a document is provided
            if ($request->hasFile('manual_pdf')) {
                // Validate the file size and type
                $request->validate([
                    'manual_pdf' => 'file|mimes:pdf|between:100,500', // Ensure the file is a PDF and between 100KB and 500KB
                ]);
                $documentName = $request->name . '-' . time();
                $documentPath = $request->file('manual_pdf')->storeAs(
                    'Documents/Products',
                    $documentName . '.' . $request->file('manual_pdf')->getClientOriginalExtension(),
                    'public'
                );
                $validated['manual_pdf'] = $documentPath;
            } else {
                $validated['manual_pdf'] = null;
            }

            $warehouseId = $validated['warehouse_id'];
            $stock = $validated['stock'];

            // Check current stock in the warehouse
            $currentStock = $product->warehouses()->where('warehouse_id', $warehouseId)->value('stock');

            $movementType = 'notUpdateStock';

            if ($stock < $currentStock) {
                $movementType = 'out';
            } elseif ($stock > $currentStock) {
                $movementType = 'in';
            }

            unset($validated['warehouse_id'], $validated['stock']);
            $product->update($validated);

            // Attach the product to the warehouse with the initial stock
            $product->warehouses()->updateExistingPivot($warehouseId, ['stock' => $stock]);

            // Handle stock movement
            if ($movementType !== 'notUpdateStock') {
                StockMovement::create([
                    'product_id' => $product->id,
                    'warehouse_id' => $warehouseId,
                    'movement_type' => $movementType,
                    'movement_reason' => 'adjustment',
                    'quantity' => abs($stock - $currentStock),
                    'notes' => 'Stock adjustment for product update',
                    'movement_date' => now(),
                ]);
            }
            // Return success message
            return redirect()->back()->with('success', 'Product created successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to create product: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        try {
            // Detach the product from all warehouses
            $product->warehouses()->detach();

            // Delete the product
            $product->delete();

            return redirect()->back()->with('success', 'Product deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete product: ' . $e->getMessage());
        }
    }

    public function startExport(Request $request)
    {
        $order = [
            "name",
            "price",
            "total_stock",
            "category",
            "supplier",
            "warehouse",
            "specifications",
            "is_active",
        ];

        $inputFields = $request->input('fields', ['name']);

        $fields = array_values(array_intersect($order, $inputFields));
        $fileName = 'products_' . now()->format('Ymd_His') . '.xlsx';

        Excel::queue(new ProductsExport($fields), $fileName, 'public');
        Audit::create([
            'user_id' => Auth::id(),
            'event' => 'exported',
            'auditable_id' => "",
            'auditable_type' => Product::class,
            'old_values' => [],
            'new_values' => [],
            'url' => route('products.export.start'),
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
            Excel::queueImport(new ProductsImport, $request->file('file'));
            Audit::create([
                'user_id' => Auth::id(),
                'event' => 'imported',
                'auditable_id' => "",
                'auditable_type' => Product::class,
                'old_values' => [],
                'new_values' => [],
                'url' => route('products.import'),
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
            new \App\Exports\ProductsImportTemplateExport,
            'products_import_template.xlsx'
        );
    }
}
