<?php

namespace App\Imports;

use App\Models\Audit;
use App\Models\Category;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Concerns\ToModel;
use Illuminate\Contracts\Queue\ShouldQueue;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithChunkReading;

class CategoriesImport implements ToModel, WithHeadingRow, ShouldQueue, WithChunkReading
{
    /**
     * Membuat model baru untuk setiap row
     *
     * @param array $row
     * @return \Illuminate\Database\Eloquent\Model|null
     */

    public function model(array $row)
    {

        return new Category([
            'id' => Str::uuid(),
            'name' => $row['name'],
            'description' => $row['description'],
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
