<?php

namespace App\Exports;

use App\Models\Product;
use function Pest\Laravel\get;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Events\AfterSheet;
use Maatwebsite\Excel\Concerns\WithEvents;
use PhpOffice\PhpSpreadsheet\Style\Border;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithHeadings;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use Maatwebsite\Excel\Concerns\FromCollection;
use Illuminate\Contracts\Queue\ShouldQueue as QueueShouldQueue;

class ProductsExport implements FromCollection, WithHeadings, WithMapping, WithEvents, QueueShouldQueue
{
    protected $fields;

    public function __construct(array $fields)
    {
        $this->fields = array_values(array_unique($fields));
    }
    public function collection()
    {

        $products = Product::with(['category:id,name', 'supplier:id,name', 'warehouses' => function ($q) {
            $q->withPivot('stock');
        }])
            ->get();

        foreach ($products as $index => $product) {
            $product->row_number = $index + 1;


            $product->total_stock = $product->warehouses->sum('pivot.stock') ?? 0;
            $product->category = $product->category->name ?? null;
            $product->supplier = $product->supplier->name ?? null;

            $product->warehouse = $product->warehouses->map(function ($warehouse) {
                $stock = $warehouse->pivot->stock ?? 0;
                return "{$warehouse->name} - Stock: {$stock}";
            })->join("\n");
        }

        return $products;
    }

    // Header
    public function headings(): array
    {
        $headers = array_map(function ($field) {
            if ($field === 'is_active') {
                return 'Status';
            } elseif ($field === 'total_stock') {
                return 'Total Stock';
            }
            return ucfirst(str_replace('_', ' ', $field));
        }, $this->fields);

        array_unshift($headers, 'No');
        return $headers;
    }


    public function map($product): array
    {
        $mappedData = [$product->row_number];

        foreach ($this->fields as $field) {
            if ($field === 'specifications') {
                $specs = $product->specifications;


                if (is_string($specs)) {
                    $specs = json_decode($specs, true) ?? [];
                }

                $parts = [];
                if (is_array($specs)) {
                    foreach ($specs as $spec) {
                        if (isset($spec['title'], $spec['value'])) {
                            $parts[] = ucfirst($spec['title']) . ": " . $spec['value'];
                        }
                    }
                }

                $mappedData[] = implode("\n", $parts);
            } elseif ($field === 'is_active') {
                $mappedData[] = $product->is_active ? 'Active' : 'Non-Active';
            } elseif ($field === 'total_stock') {
                $mappedData[] = $product->total_stock;
            } else {
                $mappedData[] = $product->{$field} ?? '';
            }
        }

        return $mappedData;
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet;
                $sheet->getStyle('A1:' . $sheet->getHighestColumn() . '1')
                    ->getFont()
                    ->setBold(true);
                $sheet->getStyle('A1:' . $sheet->getHighestColumn() . '1')
                    ->getAlignment()
                    ->setHorizontal('center');
                $colCount = count($this->fields) + 1;
                $lastCol = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colCount);

                // Styling heading
                $sheet->getStyle("A1:{$lastCol}1")->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'size' => 11,
                        'name' => 'Trebuchet MS',
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => ['argb' => 'FF000000'],
                        ],
                    ],
                ]);

                // Styling isi tabel
                $sheet->getStyle("A2:{$lastCol}" . $sheet->getHighestRow())
                    ->applyFromArray([
                        'font' => [
                            'size' => 10,
                            'name' => 'Trebuchet MS',
                        ],
                        'borders' => [
                            'allBorders' => [
                                'borderStyle' => Border::BORDER_THIN,
                                'color' => ['argb' => 'FF000000'],
                            ],
                        ],
                        'alignment' => [
                            'vertical' => Alignment::VERTICAL_CENTER,
                        ],
                    ]);

                // Kolom No rata tengah dan lebarnya kecil
                $sheet->getStyle('A2:A' . $sheet->getHighestRow())
                    ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getColumnDimension('A')->setWidth(5);

                // Seluruh kolom wrapping text
                $sheet->getStyle("B2:{$lastCol}" . $sheet->getHighestRow())
                    ->getAlignment()
                    ->setWrapText(true);

                // Auto size untuk kolom lainnya
                foreach (range('B', $lastCol) as $col) {
                    $sheet->getColumnDimension($col)->setAutoSize(true);
                }

                // Menambahkan tinggi baris otomatis untuk memastikan wrap text bekerja
                foreach (range(2, $sheet->getHighestRow()) as $row) {
                    $sheet->getRowDimension($row)->setRowHeight(-1); // -1 untuk auto height
                }
            },
        ];
    }
}
