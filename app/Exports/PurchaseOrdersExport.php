<?php

namespace App\Exports;

use App\Models\PurchaseOrder;
use Maatwebsite\Excel\Events\AfterSheet;
use Maatwebsite\Excel\Concerns\WithEvents;
use PhpOffice\PhpSpreadsheet\Style\Border;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithHeadings;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use Maatwebsite\Excel\Concerns\FromCollection;
use Illuminate\Contracts\Queue\ShouldQueue as QueueShouldQueue;

class PurchaseOrdersExport implements FromCollection, WithHeadings, WithMapping, WithEvents, QueueShouldQueue
{
    protected $fields;

    public function __construct(array $fields)
    {
        $this->fields = array_values(array_unique($fields));
    }
    public function collection()
    {
        $purchases = PurchaseOrder::with([
            'supplier:id,name',
            'items:id,purchase_order_id,product_id,quantity,price',
            'items.product:id,name,category_id',
            'items.product.category:id,name',
        ])->get();

        $data = $purchases->map(function ($purchase, $index) {
            return [
                'row_number'   => $index + 1,
                'purchase_id'  => $purchase->id,
                'order_date'   => $purchase->order_date?->format('Y-m-d H:i:s'),
                'status'       => $purchase->status,
                'supplier'     => $purchase->supplier->name ?? null,
                'product'     => $purchase->items->pluck('product.name')->join(', '),
                'category'   => $purchase->items->pluck('product.category.name')->unique()->join(', '),
                'quantity'   => $purchase->items->pluck('quantity')->join(', '),
                'price'        => $purchase->items->pluck('price')->join(', '),
                'notes'        => $purchase->notes,
            ];
        });

        return $data;
    }



    // Header
    public function headings(): array
    {
        $headers = array_map(function ($field) {
            return ucfirst(str_replace('_', ' ', $field));
        }, $this->fields);

        array_unshift($headers, 'No');
        return $headers;
    }


    public function map($purchase): array
    {
        $mappedData = [$purchase['row_number']];

        foreach ($this->fields as $field) {
            if ($field === 'status') {
                $mappedData[] = $purchase['status'] === 'cancelled'
                    ? "Cancelled\nReason: " . ($purchase['notes'] ?? '')
                    : ucfirst($purchase['status']);
            } else {
                $mappedData[] = $purchase[$field] ?? '';
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
