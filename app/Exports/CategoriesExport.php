<?php

namespace App\Exports;

use App\Models\Category;
use App\Models\Warehouse;
use Maatwebsite\Excel\Events\AfterSheet;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Style\Border;
use Maatwebsite\Excel\Concerns\ShouldQueue;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithHeadings;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use Maatwebsite\Excel\Concerns\FromCollection;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Illuminate\Contracts\Queue\ShouldQueue as QueueShouldQueue;
use function Pest\Laravel\get;

class CategoriesExport implements FromCollection, WithHeadings, WithMapping, WithEvents, QueueShouldQueue
{
    protected $fields;

    public function __construct(array $fields)
    {
        $this->fields = array_values(array_unique($fields));
    }


    public function collection()
    {
        $categories = Category::select($this->fields)->get();

        foreach ($categories as $index => $category) {
            $category->row_number = $index + 1;
        }

        return $categories;
    }

    public function headings(): array
    {
        $headers = array_map(function ($field) {
            return ucfirst(str_replace('_', ' ', $field));
        }, $this->fields);

        array_unshift($headers, 'No');
        return $headers;
    }


    public function map($category): array
    {
        $row = [$category->row_number];

        foreach ($this->fields as $field) {
            $row[] = $category->{$field} ?? '';
        }

        return $row;
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

                // Auto size untuk kolom lainnya
                foreach (range('B', $lastCol) as $col) {
                    $sheet->getColumnDimension($col)->setAutoSize(true);
                }
            },
        ];
    }
}