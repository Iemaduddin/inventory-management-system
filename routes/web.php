<?php

use App\Http\Controllers\CategoriesController;
use App\Http\Controllers\DashboardContoller;
use App\Http\Controllers\ProductsController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PurchaseOrdersController;
use App\Http\Controllers\StockMovementsController;
use App\Http\Controllers\SuppliersController;
use App\Http\Controllers\WarehousesController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Home');
});

// Route::get('/dashboard', function () {
//     return Inertia::render('Dashboard');
// })->middleware(['auth'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});
Route::middleware(['auth'])->group(function () {

    Route::middleware(['role:Administrator|Manager'])->group(function () {
        //Dashboard
        Route::get('/dashboard', [DashboardContoller::class, 'index'])->name('dashboard');

        // Suppliers
        Route::resource('/suppliers', SuppliersController::class);

        // Categories
        Route::resource('/categories', CategoriesController::class);

        // Warehouses
        Route::resource('/warehouses', WarehousesController::class);

        // Products
        Route::resource('/products', ProductsController::class);
        Route::post('products/add-existing-product-to-warehouse', [ProductsController::class, 'storeExistingProductToWarehouse'])
            ->name('products.storeExistingProductToWarehouse');
    });

    // Purchase Orders
    Route::get('/purchase-orders', function () {
        return Inertia::render('PurchaseOrders/Index');
    })->name('purchase-orders.index');

    // Stock Movements
    Route::get('/stock-movements', [StockMovementsController::class, "index"])->name('stock-movements.index');
    // Stock Movements by Warehouse
    Route::get('/warehouses/{warehouse}/products', [StockMovementsController::class, 'products'])
        ->name('warehouses.products');
    // Adjust Stock
    Route::post('/stock-movements/adjust-stock', [StockMovementsController::class, 'adjustStock'])
        ->name('stock-movements.adjustStock');
    // Transfer Stock
    Route::post('/stock-movements/transfer-stock', [StockMovementsController::class, 'transferStock'])
        ->name('stock-movements.transferStock');

    // Purchase Orders
    Route::get('/purchase-orders', [PurchaseOrdersController::class, "index"])->name('purchase-orders.index');
    Route::post('/purchase-orders', [PurchaseOrdersController::class, "store"])->name('purchase-orders.store');
    Route::put('/purchase-orders/{purchaseOrder}', [PurchaseOrdersController::class, "update"])
        ->name('purchase-orders.update');
    Route::post('/purchase-orders/{purchaseOrder}/update-status', [PurchaseOrdersController::class, 'confirm'])
        ->name('purchase-orders.confirm');


    // Users Management (only Administrator role can access)
    Route::resource('/users', 'App\Http\Controllers\UsersController')
        ->except(['show', 'create', 'edit'])->middleware('role:Administrator');


    // Roles Management (any logged-in user can access)
    Route::resource('/roles', 'App\Http\Controllers\RolesController')
        ->except(['show', 'create', 'edit']);


    // Import and Export Routes

    // Suppliers
    // Import
    Route::post('/supplier/import', [SuppliersController::class, 'import'])->name('suppliers.import');
    Route::get('supplier/import/template', [SuppliersController::class, 'downloadTemplate'])
        ->name('suppliers.import.template');
    // Export
    Route::post('/supplier/export/start', [SuppliersController::class, 'startExport'])->name('suppliers.export.start');
    Route::get('/supplier/export/status/{fileName}', [SuppliersController::class, 'checkExportStatus'])->name('suppliers.export.status');
    Route::get('/supplier/export/download/{fileName}', [SuppliersController::class, 'downloadAndDelete'])->name('suppliers.export.download');


    // Categories
    // Import
    Route::post('/category/import', [CategoriesController::class, 'import'])->name('categories.import');
    Route::get('category/import/template', [CategoriesController::class, 'downloadTemplate'])
        ->name('categories.import.template');
    // Export
    Route::post('/category/export/start', [CategoriesController::class, 'startExport'])->name('categories.export.start');
    Route::get('/category/export/status/{fileName}', [CategoriesController::class, 'checkExportStatus'])->name('categories.export.status');
    Route::get('/category/export/download/{fileName}', [CategoriesController::class, 'downloadAndDelete'])->name('categories.export.download');

    // Warehouses
    // Import
    Route::post('/warehouse/import', [WarehousesController::class, 'import'])->name('warehouses.import');
    Route::get('warehouse/import/template', [WarehousesController::class, 'downloadTemplate'])
        ->name('warehouses.import.template');
    // Export
    Route::post('/warehouse/export/start', [WarehousesController::class, 'startExport'])->name('warehouses.export.start');
    Route::get('/warehouse/export/status/{fileName}', [WarehousesController::class, 'checkExportStatus'])->name('warehouses.export.status');
    Route::get('/warehouse/export/download/{fileName}', [WarehousesController::class, 'downloadAndDelete'])->name('warehouses.export.download');

    // Products
    // Import
    Route::post('/product/import', [ProductsController::class, 'import'])->name('products.import');
    Route::get('product/import/template', [ProductsController::class, 'downloadTemplate'])
        ->name('products.import.template');
    // Export
    Route::post('/product/export/start', [ProductsController::class, 'startExport'])->name('products.export.start');
    Route::get('/product/export/status/{fileName}', [ProductsController::class, 'checkExportStatus'])->name('products.export.status');
    Route::get('/product/export/download/{fileName}', [ProductsController::class, 'downloadAndDelete'])->name('products.export.download');

    // Purchase Orders
    // Import
    Route::post('/purchase-order/import', [PurchaseOrdersController::class, 'import'])->name('purchase-orders.import');
    Route::get('purchase-order/import/template', [PurchaseOrdersController::class, 'downloadTemplate'])
        ->name('purchase-orders.import.template');
    // Export
    Route::post('/purchase-order/export/start', [PurchaseOrdersController::class, 'startExport'])->name('purchase-orders.export.start');
    Route::get('/purchase-order/export/status/{fileName}', [PurchaseOrdersController::class, 'checkExportStatus'])->name('purchase-orders.export.status');
    Route::get('/purchase-order/export/download/{fileName}', [PurchaseOrdersController::class, 'downloadAndDelete'])->name('purchase-orders.export.download');
});
require __DIR__ . '/auth.php';
