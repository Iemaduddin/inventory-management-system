<?php

namespace App\Imports;

use App\Models\Product;
use App\Models\Category;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\Warehouse;
use Illuminate\Support\Str;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Contracts\Queue\ShouldQueue;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithChunkReading;


// Import Handler yang sudah disesuaikan dengan kode Anda
class ProductsImport implements ToCollection, WithHeadingRow, ShouldQueue, WithChunkReading
{
    public function collection(Collection $rows)
    {
        try {
            foreach ($rows as $row) {
                // Validasi apakah key array ada
                if (
                    !isset($row['supplier']) ||
                    !isset($row['category']) ||
                    !isset($row['warehouse']) ||
                    empty($row['supplier']) ||
                    empty($row['category']) ||
                    empty($row['warehouse'])
                ) {
                    Log::warning('Row skipped because missing required dropdowns or keys', [
                        'row' => $row
                    ]);
                    continue;
                }

                // Cari data supplier, category, dan warehouse
                $supplier  = Supplier::where('name', $row['supplier'])->first();
                $category  = Category::where('name', $row['category'])->first();
                $warehouse = Warehouse::where('name', $row['warehouse'])->first();

                // Jika data tidak ditemukan, log dan lanjutkan
                if (!$supplier || !$category || !$warehouse) {
                    Log::warning('Row skipped because relation not found', [
                        'supplier' => $row['supplier'] ?? null,
                        'category' => $row['category'] ?? null,
                        'warehouse' => $row['warehouse'] ?? null,
                    ]);
                    continue;
                }

                // Buat produk baru
                $product = Product::create([
                    'id'             => Str::uuid(),
                    'supplier_id'    => $supplier->id,
                    'category_id'    => $category->id,
                    'name'           => $row['product_name'] ?? '',
                    'price'          => $row['price'] ?? 0,
                    'specifications' => $this->parseSpecification($row['specifications'] ?? '{}'),
                    'is_active'      => true,
                ]);

                // Hubungkan produk dengan warehouse
                $product->warehouses()->attach($warehouse->id, [
                    'stock' => $row['stock'] ?? 0,
                ]);

                StockMovement::create([
                    'product_id' => $product->id,
                    'warehouse_id' => $warehouse->id,
                    'moevement_type' => 'in',
                    'movement_reason' => 'adjustment',
                    'movement_date' => now(),
                    'quantity' => $row['stock'] ?? 0,
                    'notes' => 'Initial stock from import',
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Error importing products', [
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);
        }
    }

    /**
     * Baca specification (JSON string)
     */
    private function parseSpecification($value): array
    {
        if (empty($value)) {
            return [];
        }

        $decoded = json_decode($value, true);
        if (!is_array($decoded)) {
            return [];
        }

        if (isset($decoded[0]['title']) && isset($decoded[0]['value'])) {
            return $decoded;
        }

        $result = [];
        foreach ($decoded as $key => $val) {
            $result[] = [
                'title' => $key,
                'value' => $val,
            ];
        }

        return $result;
    }

    public function chunkSize(): int
    {
        return 1000;
    }
}
