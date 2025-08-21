<?php

namespace App\Imports;

use App\Models\Warehouse;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Concerns\ToModel;
use Illuminate\Contracts\Queue\ShouldQueue;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithChunkReading;

class WarehousesImport implements ToModel, WithHeadingRow, ShouldQueue, WithChunkReading
{
    /**
     * Membuat model baru untuk setiap row
     *
     * @param array $row
     * @return \Illuminate\Database\Eloquent\Model|null
     */

    public function model(array $row)
    {
        return new Warehouse([
            'id' => Str::uuid(),
            'name' => $row['name'],
            'location' => json_encode([
                'phone' => $row['phone'] ?? null,
                'email' => $row['email'] ?? null,
                'address' => $row['address'] ?? null,
            ]),
        ]);
    }

    /**
     * Ukuran chunk saat membaca file
     *
     * @return int
     */
    public function chunkSize(): int
    {
        return 1000; // proses 1000 baris per batch
    }
}
