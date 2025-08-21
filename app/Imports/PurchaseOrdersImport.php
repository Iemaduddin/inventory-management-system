<?php

namespace App\Imports;

use App\Models\Product;
use App\Models\Category;
use App\Models\Supplier;
use App\Models\Warehouse;
use Illuminate\Support\Str;
use App\Models\PurchaseOrder;
use App\Models\StockMovement;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use Illuminate\Contracts\Queue\ShouldQueue;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithChunkReading;


// Import Handler yang sudah disesuaikan dengan kode Anda
class PurchaseOrdersImport implements ToCollection, WithHeadingRow, ShouldQueue, WithChunkReading
{
    public function prepareForValidation($row, $index)
    {
        // Normalize key heading supaya ga masalah kapital/spasi
        return [
            'product_name' => $row['product name'] ?? $row['product_name'] ?? null,
            'order_date'   => $row['order date'] ?? $row['order_date'] ?? null,
            'price'        => $row['price'] ?? null,
            'quantity'     => $row['quantity'] ?? null,
            'status'       => $row['status'] ?? null,
            'warehouse'    => $row['warehouse_if_status_is_completed']
                ?? $row['warehouse']
                ?? null,

        ];
    }
    public function collection(Collection $rows)
    {
        try {
            foreach ($rows as $row) {
                Log::info('Row debug', $row->toArray());
                if ($row->filter()->isEmpty() || $row->isEmpty()) {
                    continue;
                }
                if (empty($row['product_name'])) {
                    Log::warning('Yo Row skipped because missing required dropdowns or keys', [
                        'row' => $row->toArray()
                    ]);
                    continue;
                }

                // Mengambil data produk berdasarkan nama
                $product = Product::where('name', $row['product_name'])->first();

                // Jika data tidak ditemukan, log dan lanjutkan
                if (!$product) {
                    Log::warning('Yo Row skipped because relation not found', [
                        'product_name' => $row['product_name'] ?? null
                    ]);
                    continue;
                }
                if (!$product->is_active) {
                    Log::warning('Yo Row skipped because product is not active', [
                        'product_name' => $row['product_name'] ?? null
                    ]);
                    continue;
                }
                // Konversi order_date
                $orderDate = now();
                if (!empty($row['order_date'])) {
                    if (is_numeric($row['order_date'])) {
                        // Jika format Excel (serial number)
                        $orderDate = Date::excelToDateTimeObject($row['order_date'])
                            ->format('Y-m-d H:i');
                    } else {
                        try {
                            // Jika string biasa (contoh: 2025-08-17 14:30)
                            $orderDate = \Carbon\Carbon::parse($row['order_date'])
                                ->format('Y-m-d H:i');
                        } catch (\Exception $e) {
                            Log::warning('Row skipped because invalid order date', [
                                'order_date' => $row['order_date']
                            ]);
                            continue;
                        }
                    }
                }

                // Buat produk baru
                $po = PurchaseOrder::create([
                    'id'             => Str::uuid(),
                    'supplier_id'    => $product->supplier_id,
                    'order_date'    => $orderDate,
                    'status'        => $row['status'] ?? 'draft',
                ]);
                $po->items()->create([
                    'purchase_order_id' => $po->id,
                    'product_id' => $product->id,
                    'quantity' => $row['quantity'] ?? 0,
                    'price' => $row['price'] ?? 0,
                ]);
                // Kalau status completed, warehouse wajib diisi
                $warehouse = null;
                if ($po->status === 'completed') {
                    if (empty($row['warehouse_if_status_is_completed'])) {
                        Log::warning('Row skipped because warehouse is required for completed status', [
                            'product_name' => $row['product_name'],
                            'status' => $row['status'],
                            'warehouse_if_status_is_completed' => $row['warehouse_if_status_is_completed'] ?? null,
                        ]);
                        continue;
                    }
                    $warehouse = Warehouse::where('name', $row['warehouse_if_status_is_completed'])->first();
                    if (!$warehouse) {
                        Log::warning('Row skipped because warehouse not found', [
                            'warehouse_if_status_is_completed' => $row['warehouse_if_status_is_completed'],
                        ]);
                        continue;
                    }
                }

                if ($po->status === 'completed' && $warehouse) {
                    $quantity = $row['quantity'] ?? 0;

                    // Cari relasi produk di warehouse
                    $warehouseProduct = $warehouse->products()->where('product_id', $product->id)->first();

                    if ($warehouseProduct) {
                        // Update stok lama
                        $newStock = $warehouseProduct->pivot->stock + $quantity;
                        $warehouse->products()->updateExistingPivot($product->id, [
                            'stock' => $newStock,
                        ]);
                    } else {
                        // Attach produk baru ke warehouse dengan stok awal
                        $warehouse->products()->attach($product->id, [
                            'stock' => $quantity,
                        ]);
                    }

                    // ambil ID unik dari PO 8 karakter dari belakang
                    $poIdUnique = substr($po->id, -8);

                    StockMovement::create([
                        'product_id'      => $product->id,
                        'warehouse_id'    => $warehouse->id,
                        'movement_type'   => 'in',
                        'movement_reason' => 'purchase',
                        'movement_date'   => now(),
                        'quantity'        => $quantity,
                        'notes'           => 'Stock from purchase order import #' . $poIdUnique,
                    ]);
                }
            }
        } catch (\Exception $e) {
            Log::error('Error importing purchase orders', [
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);
        }
    }


    public function chunkSize(): int
    {
        return 1000;
    }
}
